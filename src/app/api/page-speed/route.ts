import { NextRequest, NextResponse } from "next/server";

export interface PageSpeedResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  loadTimeMs: number;
  ttfbMs: number;
  contentSizeBytes: number;
  transferSizeBytes: number;
  resourceCounts: {
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    total: number;
  };
  scores: {
    performance: number;
    sizeScore: number;
    requestScore: number;
    ttfbScore: number;
  };
  issues: string[];
  suggestions: string[];
  headers: { [key: string]: string };
}

function scorePerf(loadMs: number, ttfbMs: number, sizeKb: number, requests: number): number {
  let score = 100;
  if (loadMs > 3000) score -= 20;
  else if (loadMs > 1500) score -= 10;
  if (ttfbMs > 600) score -= 20;
  else if (ttfbMs > 200) score -= 10;
  if (sizeKb > 500) score -= 15;
  else if (sizeKb > 150) score -= 7;
  if (requests > 80) score -= 15;
  else if (requests > 40) score -= 7;
  return Math.max(0, score);
}

export async function POST(req: NextRequest) {
  let url: string;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const start = Date.now();
  let res: Response;
  let ttfbMs: number;
  let html: string;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    res = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageSpeedBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
        "Accept-Encoding": "gzip, deflate, br",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    ttfbMs = Date.now() - start;
    html = await res.text();
    clearTimeout(timeout);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json({ error: "Request timed out after 15 seconds" }, { status: 504 });
    }
    if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
      return NextResponse.json({ error: `Domain not found: ${parsedUrl.hostname}` }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const loadTimeMs = Date.now() - start;
  const contentSizeBytes = new TextEncoder().encode(html).length;
  const transferSizeBytes = parseInt(res.headers.get("content-length") ?? "0") || contentSizeBytes;

  // Count resources in HTML
  const scriptMatches = (html.match(/<script[^>]+src=/gi) ?? []).length;
  const styleMatches = (html.match(/<link[^>]+stylesheet/gi) ?? []).length;
  const imgMatches = (html.match(/<img[^>]+src=/gi) ?? []).length;
  const fontMatches = (html.match(/font-face|\.woff2?|\.ttf/gi) ?? []).length;
  const total = scriptMatches + styleMatches + imgMatches + fontMatches;

  const sizeKb = contentSizeBytes / 1024;

  const issues: string[] = [];
  const suggestions: string[] = [];

  if (ttfbMs > 600) {
    issues.push(`Slow server response time (${ttfbMs}ms TTFB)`);
    suggestions.push("Consider server-side caching, CDN, or upgrading hosting to reduce TTFB below 200ms.");
  }
  if (loadTimeMs > 3000) {
    issues.push(`High total load time (${loadTimeMs}ms)`);
    suggestions.push("Lazy-load below-the-fold content and defer non-critical JavaScript.");
  }
  if (sizeKb > 500) {
    issues.push(`Large HTML payload (${sizeKb.toFixed(0)} KB)`);
    suggestions.push("Minify HTML, enable gzip/brotli compression, and remove unused markup.");
  }
  if (scriptMatches > 15) {
    issues.push(`High number of script tags (${scriptMatches})`);
    suggestions.push("Bundle JavaScript files and use code splitting to reduce request count.");
  }
  if (styleMatches > 8) {
    issues.push(`Multiple stylesheets (${styleMatches})`);
    suggestions.push("Combine CSS files and inline critical styles to reduce render-blocking requests.");
  }
  if (!res.headers.get("cache-control")) {
    issues.push("No Cache-Control header");
    suggestions.push("Set Cache-Control headers to allow browsers and CDNs to cache responses.");
  }
  if (!html.includes('loading="lazy"') && imgMatches > 3) {
    suggestions.push(`Add loading="lazy" to images — found ${imgMatches} <img> tags without it detected.`);
  }
  if (html.includes("<script ") && !html.includes("defer") && !html.includes("async")) {
    suggestions.push("Add defer or async to script tags to avoid render-blocking.");
  }
  if (!res.headers.get("content-encoding")) {
    suggestions.push("Enable gzip or brotli compression — no Content-Encoding header detected.");
  }

  const responseHeaders: { [key: string]: string } = {};
  for (const [k, v] of res.headers.entries()) {
    responseHeaders[k] = v;
  }

  const perfScore = scorePerf(loadTimeMs, ttfbMs, sizeKb, total);
  const sizeScore = sizeKb < 50 ? 100 : sizeKb < 150 ? 85 : sizeKb < 300 ? 65 : sizeKb < 500 ? 45 : 25;
  const requestScore = total < 20 ? 100 : total < 40 ? 80 : total < 60 ? 60 : total < 80 ? 40 : 20;
  const ttfbScore = ttfbMs < 100 ? 100 : ttfbMs < 200 ? 90 : ttfbMs < 400 ? 70 : ttfbMs < 600 ? 50 : 25;

  return NextResponse.json({
    url: parsedUrl.toString(),
    finalUrl: res.url ?? parsedUrl.toString(),
    statusCode: res.status,
    loadTimeMs,
    ttfbMs,
    contentSizeBytes,
    transferSizeBytes,
    resourceCounts: {
      scripts: scriptMatches,
      stylesheets: styleMatches,
      images: imgMatches,
      fonts: fontMatches,
      total,
    },
    scores: { performance: perfScore, sizeScore, requestScore, ttfbScore },
    issues,
    suggestions,
    headers: responseHeaders,
  } satisfies PageSpeedResult);
}
