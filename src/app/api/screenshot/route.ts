import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import sharp from "sharp";

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

  // Make sure we're really back at the top before measuring/capturing |
  // some pages animate the scroll-to-top or have scroll-snap that delays it.
  await page.waitForFunction(() => window.scrollY === 0, { timeout: 2_000 }).catch(async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
  });
}

// Hide fixed/sticky-positioned elements (headers, cookie banners, chat
// widgets) so they don't get baked into every tile when we scroll-and-capture
// | otherwise they'd appear duplicated down the length of the stitched image.
async function hideFixedElements(page: Page) {
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("body *"));
    for (const el of els) {
      const pos = getComputedStyle(el).position;
      if (pos === "fixed" || pos === "sticky") {
        el.dataset.ffHiddenPrevVisibility = el.style.visibility;
        el.style.visibility = "hidden";
      }
    }
  });
}

async function restoreFixedElements(page: Page) {
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-ff-hidden-prev-visibility]"));
    for (const el of els) {
      el.style.visibility = el.dataset.ffHiddenPrevVisibility ?? "";
      delete el.dataset.ffHiddenPrevVisibility;
    }
  });
}

// Capture the page in viewport-sized tiles and stitch them into one image.
// This sidesteps two pitfalls of large single-shot captures: Chromium's
// renderer reflows (and scroll-aware scripts misbehave) when the viewport is
// resized to the full content height, and software rasterizers can silently
// truncate or corrupt canvases beyond a certain pixel height.
async function captureFullPage(page: Page, width: number, viewportHeight: number): Promise<Buffer> {
  const fullHeight = await page.evaluate(
    () => Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))
  );

  if (fullHeight <= viewportHeight + 50) {
    return Buffer.from(await page.screenshot({ type: "png" }));
  }

  const targetHeight = Math.min(fullHeight, 20_000);

  const positions: number[] = [];
  for (let y = 0; y < targetHeight; y += viewportHeight) {
    positions.push(Math.min(y, targetHeight - viewportHeight));
  }
  if (positions[positions.length - 1] !== targetHeight - viewportHeight) {
    positions.push(targetHeight - viewportHeight);
  }

  const composites: { input: Buffer; top: number; left: number }[] = [];
  for (let i = 0; i < positions.length; i++) {
    const top = positions[i];
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), top);
    await new Promise((resolve) => setTimeout(resolve, 140));
    // Keep fixed/sticky elements (headers, banners) visible in the very first
    // tile | that's where they belong | but hide them for the rest so they
    // don't get baked into every subsequent tile as we scroll down.
    if (i === 1) await hideFixedElements(page);
    const buf = Buffer.from(await page.screenshot({ type: "png" }));
    composites.push({ input: buf, top, left: 0 });
  }
  if (positions.length > 1) await restoreFixedElements(page);

  return await sharp({
    create: { width, height: targetHeight, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite(composites)
    .jpeg({ quality: 72 })
    .toBuffer();
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
    const buf = await captureFullPage(page, width, height);

    return NextResponse.json({
      image: `data:image/jpeg;base64,${buf.toString("base64")}`,
    });
  } catch (e) {
    console.error("screenshot: failed to capture page", e);
    return NextResponse.json({ error: "Failed to capture the page" }, { status: 502 });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
