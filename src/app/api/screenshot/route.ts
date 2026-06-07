import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

async function autoScroll(page: Page) {
  const needsScroll = await page.evaluate(() => document.body.scrollHeight > window.innerHeight + 200);
  if (!needsScroll) return;

  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const distance = 600;
      const maxSteps = 25; // safety cap for endless/infinite-scroll pages
      let steps = 0;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        steps += 1;
        if (window.scrollY + window.innerHeight >= scrollHeight || steps >= maxSteps) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 90);
    });
  });
  // Let lazy-loaded images/sections settle after the walk-down.
  await new Promise((resolve) => setTimeout(resolve, 450));

  // Make sure we're really back at the top before measuring/capturing —
  // some pages animate the scroll-to-top or have scroll-snap that delays it.
  await page.waitForFunction(() => window.scrollY === 0, { timeout: 2_000 }).catch(async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
  });
}

export async function POST(req: NextRequest) {
  let body: { url?: string; width?: number; height?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https URLs are supported" }, { status: 400 });
  }

  if (!Number.isFinite(body.width) || !Number.isFinite(body.height)) {
    return NextResponse.json({ error: "Missing width/height" }, { status: 400 });
  }
  const width = Math.min(2200, Math.max(50, Math.round(body.width as number)));
  const height = Math.min(4400, Math.max(50, Math.round(body.height as number)));

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setUserAgent("Mozilla/5.0 (compatible; FileSpark/1.0; +https://filespark.app)");

    try {
      await page.goto(target.toString(), { waitUntil: "networkidle2", timeout: 20_000 });
    } catch (e) {
      const timedOut = e instanceof Error && /timeout/i.test(e.message);
      return NextResponse.json(
        { error: timedOut ? "Timed out loading the page (20s limit)" : "Failed to load the page" },
        { status: timedOut ? 504 : 502 }
      );
    }

    await autoScroll(page);

    // Resize the viewport to the full content height ourselves rather than
    // relying on `fullPage: true` — Puppeteer's internal resize-and-capture
    // triggers a reflow that scroll-aware sites (sticky headers, parallax,
    // lazy-load observers) react to using stale scroll state, which can
    // corrupt or shift the top of the captured page.
    const fullHeight = await page.evaluate(
      () => Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))
    );
    if (fullHeight > height) {
      await page.setViewport({ width, height: Math.min(fullHeight, 16_000) });
      // Let the page settle into its new layout before capturing.
      await new Promise((resolve) => setTimeout(resolve, 350));
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    const buf = await page.screenshot({ type: "jpeg", quality: 72 });

    return NextResponse.json({
      image: `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`,
    });
  } catch (e) {
    console.error("screenshot: failed to capture page", e);
    return NextResponse.json({ error: "Failed to capture the page" }, { status: 502 });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
