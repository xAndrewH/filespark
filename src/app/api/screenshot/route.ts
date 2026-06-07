import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

type SizeInput = { id?: unknown; width?: unknown; height?: unknown };
type Size = { id: string; width: number; height: number };

const MAX_SIZES = 6;

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const distance = 400;
      const maxSteps = 60; // safety cap for endless/infinite-scroll pages
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
      }, 120);
    });
  });
  // Let lazy-loaded images/sections settle after the walk-down.
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export async function POST(req: NextRequest) {
  let body: { url?: string; sizes?: SizeInput[] };
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

  const sizes: Size[] = (Array.isArray(body.sizes) ? body.sizes : [])
    .filter(
      (s): s is Required<SizeInput> & { id: string } =>
        typeof s.id === "string" && Number.isFinite(s.width) && Number.isFinite(s.height)
    )
    .map((s) => ({
      id: s.id,
      width: Math.min(2200, Math.max(50, Math.round(s.width as number))),
      height: Math.min(4400, Math.max(50, Math.round(s.height as number))),
    }))
    .slice(0, MAX_SIZES);

  if (sizes.length === 0) {
    return NextResponse.json({ error: "No valid sizes provided" }, { status: 400 });
  }

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });

    const results = await Promise.all(
      sizes.map(async (size) => {
        const page = await browser!.newPage();
        try {
          await page.setViewport({ width: size.width, height: size.height });
          await page.setUserAgent("Mozilla/5.0 (compatible; FileSpark/1.0; +https://filespark.app)");
          await page.goto(target.toString(), {
            waitUntil: "networkidle2",
            timeout: 25_000,
          });
          // Many sites lazy-load images/sections as you scroll — walk the
          // page down to the bottom first so the full-page capture isn't
          // truncated to whatever rendered on initial load.
          await autoScroll(page);
          const buf = await page.screenshot({ type: "jpeg", quality: 72, fullPage: true });
          return {
            id: size.id,
            image: `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`,
          };
        } catch (e) {
          const timedOut = e instanceof Error && /timeout/i.test(e.message);
          return { id: size.id, error: timedOut ? "Timed out loading page" : "Failed to capture page" };
        } finally {
          await page.close().catch(() => {});
        }
      })
    );

    return NextResponse.json({ results });
  } catch (e) {
    console.error("screenshot: failed to launch renderer", e);
    return NextResponse.json({ error: "Failed to start the renderer" }, { status: 502 });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
