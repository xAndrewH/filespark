import { NextRequest, NextResponse } from "next/server";

export interface ResourceItem {
  url: string;
  isExternal: boolean;
  hasDefer: boolean;
  hasAsync: boolean;
}

export interface ImageItem {
  src: string;
  hasAlt: boolean;
  hasDimensions: boolean;
  isExternal: boolean;
}

export interface AnalysisIssue {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  details?: string[];
}

export interface PageAnalysis {
  url: string;
  finalUrl: string;
  fetchTime: string;
  ttfb: number;
  htmlSize: number;
  compressedSize: number | null;
  compressed: boolean;
  https: boolean;
  hasViewport: boolean;
  hasCacheControl: boolean;
  hasTitle: boolean;
  titleLength: number;
  scripts: ResourceItem[];
  stylesheets: ResourceItem[];
  images: ImageItem[];
  renderBlockingScripts: ResourceItem[];
  renderBlockingStylesheets: ResourceItem[];
  inlineScripts: number;
  inlineStyles: number;
  score: number;
  issues: AnalysisIssue[];
}

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

function isExternal(src: string, base: string): boolean {
  try {
    return new URL(src).origin !== new URL(base).origin;
  } catch {
    return false;
  }
}

function parseScripts(html: string, baseUrl: string): ResourceItem[] {
  const results: ResourceItem[] = [];
  const re = /<script([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcMatch) continue;
    const src = resolveUrl(srcMatch[1], baseUrl);
    results.push({
      url: src,
      isExternal: isExternal(src, baseUrl),
      hasDefer: /\bdefer\b/i.test(attrs),
      hasAsync: /\basync\b/i.test(attrs),
    });
  }
  return results;
}

function parseStylesheets(html: string, baseUrl: string): ResourceItem[] {
  const results: ResourceItem[] = [];
  const re = /<link([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    if (!/rel=["']stylesheet["']/i.test(attrs)) continue;
    const hrefMatch = /href=["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch) continue;
    const src = resolveUrl(hrefMatch[1], baseUrl);
    results.push({ url: src, isExternal: isExternal(src, baseUrl), hasDefer: false, hasAsync: false });
  }
  return results;
}

function parseImages(html: string, baseUrl: string): ImageItem[] {
  const results: ImageItem[] = [];
  const re = /<img([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcMatch) continue;
    const src = resolveUrl(srcMatch[1], baseUrl);
    const hasAlt = /\balt=["'][^"']*["']/i.test(attrs);
    const hasDimensions = /\bwidth=["']?\d+["']?/i.test(attrs) && /\bheight=["']?\d+["']?/i.test(attrs);
    results.push({ src, isExternal: isExternal(src, baseUrl), hasAlt, hasDimensions });
  }
  return results;
}

function scoreAndIssues(analysis: Omit<PageAnalysis, "score" | "issues">): { score: number; issues: AnalysisIssue[] } {
  const issues: AnalysisIssue[] = [];
  let deductions = 0;

  if (!analysis.https) {
    deductions += 20;
    issues.push({ id: "no-https", title: "Page not served over HTTPS", description: "HTTPS is required for security and modern browser features. Google also uses it as a ranking signal.", impact: "high" });
  }

  if (analysis.ttfb > 1500) {
    deductions += 25;
    issues.push({ id: "slow-ttfb", title: `Slow server response time (${analysis.ttfb} ms)`, description: "Server took over 1.5 s to respond. Consider upgrading hosting, enabling caching, or using a CDN.", impact: "high" });
  } else if (analysis.ttfb > 600) {
    deductions += 12;
    issues.push({ id: "moderate-ttfb", title: `High server response time (${analysis.ttfb} ms)`, description: "Server response over 600 ms. A CDN or server-side caching could improve this.", impact: "medium" });
  } else if (analysis.ttfb > 200) {
    deductions += 5;
  }

  if (!analysis.compressed && analysis.htmlSize > 10_000) {
    deductions += 10;
    issues.push({ id: "no-compression", title: "Text compression not enabled", description: "Enable gzip or Brotli compression on your server to reduce transfer size by 60–80%.", impact: "high" });
  }

  if (analysis.htmlSize > 500_000) {
    deductions += 15;
    issues.push({ id: "large-html", title: `Large HTML document (${Math.round(analysis.htmlSize / 1024)} KB)`, description: "HTML over 500 KB adds parse time. Reduce server-side rendering output or paginate content.", impact: "high" });
  } else if (analysis.htmlSize > 150_000) {
    deductions += 7;
    issues.push({ id: "large-html-moderate", title: `Large HTML document (${Math.round(analysis.htmlSize / 1024)} KB)`, description: "Consider reducing the initial HTML payload to improve parse time.", impact: "medium" });
  }

  if (!analysis.hasViewport) {
    deductions += 10;
    issues.push({ id: "no-viewport", title: "Missing viewport meta tag", description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for correct mobile rendering.', impact: "high" });
  }

  if (analysis.renderBlockingScripts.length > 0) {
    const n = analysis.renderBlockingScripts.length;
    deductions += Math.min(n * 5, 20);
    issues.push({
      id: "render-blocking-scripts",
      title: `${n} render-blocking script${n > 1 ? "s" : ""}`,
      description: "Scripts without defer or async block HTML parsing. Add defer or async to scripts in the <head>.",
      impact: n > 2 ? "high" : "medium",
      details: analysis.renderBlockingScripts.slice(0, 5).map(s => s.url),
    });
  }

  if (analysis.renderBlockingStylesheets.length > 3) {
    const n = analysis.renderBlockingStylesheets.length;
    deductions += Math.min((n - 3) * 3, 12);
    issues.push({
      id: "many-stylesheets",
      title: `${n} render-blocking stylesheets`,
      description: "Each stylesheet blocks rendering. Consider combining CSS files or inlining critical CSS.",
      impact: "medium",
      details: analysis.renderBlockingStylesheets.slice(0, 5).map(s => s.url),
    });
  }

  const imagesNoAlt = analysis.images.filter(i => !i.hasAlt);
  if (imagesNoAlt.length > 0) {
    deductions += 5;
    issues.push({
      id: "images-no-alt",
      title: `${imagesNoAlt.length} image${imagesNoAlt.length > 1 ? "s" : ""} missing alt text`,
      description: "Alt text improves accessibility and helps search engines understand image content.",
      impact: "medium",
      details: imagesNoAlt.slice(0, 5).map(i => i.src),
    });
  }

  const imagesNoDims = analysis.images.filter(i => !i.hasDimensions);
  if (imagesNoDims.length > 0) {
    deductions += 5;
    issues.push({
      id: "images-no-dimensions",
      title: `${imagesNoDims.length} image${imagesNoDims.length > 1 ? "s" : ""} without explicit width/height`,
      description: "Declaring image dimensions prevents layout shifts (CLS) while the page loads.",
      impact: "medium",
    });
  }

  if (!analysis.hasCacheControl) {
    deductions += 5;
    issues.push({ id: "no-cache", title: "No Cache-Control header", description: "Set cache headers for static assets to allow browsers to cache resources and speed up repeat visits.", impact: "low" });
  }

  if (!analysis.hasTitle) {
    deductions += 5;
    issues.push({ id: "no-title", title: "Missing <title> tag", description: "Every page should have a unique, descriptive title for SEO and accessibility.", impact: "medium" });
  } else if (analysis.titleLength > 60) {
    issues.push({ id: "long-title", title: `Title tag too long (${analysis.titleLength} chars)`, description: "Keep titles under 60 characters to avoid truncation in search results.", impact: "low" });
  }

  return { score: Math.max(5, 100 - deductions), issues };
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
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;

  try { new URL(url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let res: Response;
  const start = Date.now();
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FileSpark/1.0; +https://filespark.app)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json({ error: "Request timed out — the site took too long to respond." }, { status: 504 });
    }
    return NextResponse.json({ error: `Could not reach the URL: ${msg}` }, { status: 502 });
  }
  const ttfb = Date.now() - start;

  if (!res.ok && res.status !== 200) {
    return NextResponse.json({ error: `Site returned HTTP ${res.status}` }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return NextResponse.json({ error: "URL does not return an HTML page." }, { status: 422 });
  }

  const html = await res.text();
  const htmlSize = Buffer.byteLength(html, "utf8");
  const compressedSize = res.headers.get("content-length") ? parseInt(res.headers.get("content-length")!) : null;
  const compressed = /gzip|br|deflate/i.test(res.headers.get("content-encoding") ?? "");
  const https = url.startsWith("https://");
  const hasCacheControl = !!res.headers.get("cache-control");
  const finalUrl = res.url ?? url;

  const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html) ||
                     /<meta[^>]+content=["'][^"']*width=device-width[^"']*["'][^>]*>/i.test(html);

  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  const hasTitle = !!titleMatch;
  const titleLength = titleMatch ? titleMatch[1].trim().length : 0;

  const scripts = parseScripts(html, finalUrl);
  const stylesheets = parseStylesheets(html, finalUrl);
  const images = parseImages(html, finalUrl);

  const renderBlockingScripts = scripts.filter(s => !s.hasDefer && !s.hasAsync);
  const renderBlockingStylesheets = stylesheets;

  const inlineScripts = (html.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi) ?? []).length;
  const inlineStyles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).length;

  const base: Omit<PageAnalysis, "score" | "issues"> = {
    url, finalUrl, fetchTime: new Date().toISOString(), ttfb,
    htmlSize, compressedSize, compressed, https,
    hasViewport, hasCacheControl, hasTitle, titleLength,
    scripts, stylesheets, images,
    renderBlockingScripts, renderBlockingStylesheets,
    inlineScripts, inlineStyles,
  };

  const { score, issues } = scoreAndIssues(base);

  return NextResponse.json({ ...base, score, issues } satisfies PageAnalysis);
}
