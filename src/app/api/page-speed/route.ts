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
  hasLazy: boolean;
  isExternal: boolean;
  format: string;
}

export interface AnalysisIssue {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  details?: string[];
}

export interface CategoryResult {
  score: number;
  passed: number;
  total: number;
  issues: AnalysisIssue[];
}

export interface PageAnalysis {
  url: string;
  finalUrl: string;
  fetchTime: string;

  // Network
  ttfb: number;
  htmlSize: number;
  compressedSize: number | null;
  compressed: boolean;
  https: boolean;
  hasCacheControl: boolean;

  // Resources
  scripts: ResourceItem[];
  stylesheets: ResourceItem[];
  images: ImageItem[];
  renderBlockingScripts: ResourceItem[];
  inlineScripts: number;
  inlineStyles: number;
  thirdPartyDomains: string[];

  // Performance
  hasViewport: boolean;
  hasPreconnect: boolean;
  hasPreload: boolean;
  lazyImageCount: number;
  modernImageCount: number;
  legacyImageCount: number;

  // Accessibility
  hasLang: boolean;
  lang: string;
  hasCharset: boolean;
  charsetValue: string;
  buttonsWithoutLabel: number;
  inputsWithoutLabel: number;
  imagesWithoutAlt: number;
  imagesWithoutDimensions: number;

  // Best Practices
  hasDoctype: boolean;
  mixedContentCount: number;
  externalLinksWithoutNoopener: string[];
  passwordInputOnHttp: boolean;

  // SEO
  hasTitle: boolean;
  titleLength: number;
  title: string;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  metaDescriptionText: string;
  hasCanonical: boolean;
  canonicalUrl: string;
  isNoIndex: boolean;
  hasRobotsMeta: boolean;
  h1Count: number;
  h1Texts: string[];
  hasStructuredData: boolean;
  structuredDataTypes: string[];
  hasOgTags: boolean;
  ogTitle: string;

  // Category scores
  categories: {
    performance: CategoryResult;
    accessibility: CategoryResult;
    bestPractices: CategoryResult;
    seo: CategoryResult;
  };
}

/* ── Utilities ───────────────────────────────────────────────────── */
function resolveUrl(src: string, base: string): string {
  try { return new URL(src, base).href; } catch { return src; }
}

function isExternal(src: string, base: string): boolean {
  try { return new URL(src).origin !== new URL(base).origin; } catch { return false; }
}

function hostname(src: string): string {
  try { return new URL(src).hostname; } catch { return src; }
}

/* ── Parsers ─────────────────────────────────────────────────────── */
function parseScripts(html: string, baseUrl: string): ResourceItem[] {
  const results: ResourceItem[] = [];
  const re = /<script([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const srcM = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcM) continue;
    const url = resolveUrl(srcM[1], baseUrl);
    results.push({ url, isExternal: isExternal(url, baseUrl), hasDefer: /\bdefer\b/i.test(attrs), hasAsync: /\basync\b/i.test(attrs) });
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
    const hrefM = /href=["']([^"']+)["']/i.exec(attrs);
    if (!hrefM) continue;
    const url = resolveUrl(hrefM[1], baseUrl);
    results.push({ url, isExternal: isExternal(url, baseUrl), hasDefer: false, hasAsync: false });
  }
  return results;
}

function parseImages(html: string, baseUrl: string): ImageItem[] {
  const results: ImageItem[] = [];
  const re = /<img([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const srcM = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcM) continue;
    const src = resolveUrl(srcM[1], baseUrl);
    const format = src.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    results.push({
      src,
      isExternal: isExternal(src, baseUrl),
      hasAlt: /\balt=["'][^"']*["']/i.test(attrs),
      hasDimensions: /\bwidth=["']?\d+/i.test(attrs) && /\bheight=["']?\d+/i.test(attrs),
      hasLazy: /\bloading=["']lazy["']/i.test(attrs),
      format,
    });
  }
  return results;
}

/* ── Category builders ───────────────────────────────────────────── */
function buildPerformance(d: Omit<PageAnalysis, "categories">): CategoryResult {
  const issues: AnalysisIssue[] = [];
  let deductions = 0;
  let checks = 0;
  let passed = 0;

  checks++;
  if (d.ttfb <= 600) { passed++; }
  else if (d.ttfb > 1500) {
    deductions += 25;
    issues.push({ id: "slow-ttfb", title: `Very slow server response (${d.ttfb} ms)`, description: "Server took over 1.5 s to respond. Use a CDN, server-side caching, or a faster hosting provider.", impact: "high" });
  } else {
    deductions += 12;
    issues.push({ id: "moderate-ttfb", title: `Slow server response (${d.ttfb} ms)`, description: "Aim for under 600 ms TTFB. Consider adding a CDN or enabling server-side caching.", impact: "medium" });
  }

  checks++;
  if (d.compressed) { passed++; }
  else if (d.htmlSize > 10_000) {
    deductions += 10;
    issues.push({ id: "no-compression", title: "Text compression not enabled", description: "Enable gzip or Brotli on your server to reduce HTML transfer size by 60–80%.", impact: "high" });
  } else { passed++; }

  checks++;
  if (d.htmlSize <= 150_000) { passed++; }
  else {
    deductions += d.htmlSize > 500_000 ? 15 : 7;
    issues.push({ id: "large-html", title: `Large HTML document (${Math.round(d.htmlSize / 1024)} KB)`, description: "Reduce server-rendered HTML. Large documents increase parse time and memory usage.", impact: d.htmlSize > 500_000 ? "high" : "medium" });
  }

  checks++;
  if (d.renderBlockingScripts.length === 0) { passed++; }
  else {
    const n = d.renderBlockingScripts.length;
    deductions += Math.min(n * 5, 20);
    issues.push({ id: "render-blocking-scripts", title: `${n} render-blocking script${n > 1 ? "s" : ""}`, description: "Scripts without defer or async block HTML parsing. Add defer or async to <head> scripts.", impact: n > 2 ? "high" : "medium", details: d.renderBlockingScripts.map(s => s.url) });
  }

  checks++;
  if (d.stylesheets.length <= 3) { passed++; }
  else {
    deductions += Math.min((d.stylesheets.length - 3) * 3, 12);
    issues.push({ id: "many-stylesheets", title: `${d.stylesheets.length} render-blocking stylesheets`, description: "Each external stylesheet blocks rendering. Combine CSS files or inline critical CSS.", impact: "medium", details: d.stylesheets.map(s => s.url) });
  }

  checks++;
  if (!d.hasViewport) {
    deductions += 10;
    issues.push({ id: "no-viewport", title: "Missing viewport meta tag", description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for correct mobile rendering.', impact: "high" });
  } else { passed++; }

  checks++;
  const lazyRatio = d.images.length > 3 ? d.lazyImageCount / (d.images.length - 1) : 1;
  if (d.images.length <= 3 || lazyRatio >= 0.5) { passed++; }
  else {
    deductions += 8;
    const missing = d.images.length - d.lazyImageCount - 1;
    issues.push({ id: "no-lazy-load", title: `${missing} image${missing > 1 ? "s" : ""} not lazy loaded`, description: 'Add loading="lazy" to below-the-fold images to defer loading and reduce initial page weight.', impact: "medium" });
  }

  checks++;
  if (d.modernImageCount > 0 || d.legacyImageCount === 0) { passed++; }
  else if (d.legacyImageCount > 0) {
    deductions += 5;
    issues.push({ id: "legacy-image-formats", title: `${d.legacyImageCount} image${d.legacyImageCount > 1 ? "s" : ""} using legacy formats`, description: "Use WebP or AVIF instead of JPEG/PNG to reduce image size by 25–35% with the same quality.", impact: "medium" });
  }

  checks++;
  if (d.thirdPartyDomains.length <= 3) { passed++; }
  else {
    deductions += Math.min((d.thirdPartyDomains.length - 3) * 2, 10);
    issues.push({ id: "many-third-parties", title: `${d.thirdPartyDomains.length} third-party domains`, description: "Each external domain adds DNS lookup and connection overhead. Audit and remove unused third-party scripts.", impact: "medium", details: d.thirdPartyDomains });
  }

  checks++;
  if (d.hasPreconnect || d.thirdPartyDomains.length === 0) { passed++; }
  else {
    deductions += 3;
    issues.push({ id: "no-preconnect", title: "No preconnect hints for third-party origins", description: 'Add <link rel="preconnect" href="..."> for critical third-party domains to reduce connection setup time.', impact: "low" });
  }

  return { score: Math.max(5, 100 - deductions), passed, total: checks, issues };
}

function buildAccessibility(d: Omit<PageAnalysis, "categories">): CategoryResult {
  const issues: AnalysisIssue[] = [];
  let deductions = 0;
  let checks = 0;
  let passed = 0;

  checks++;
  if (d.hasLang) { passed++; }
  else {
    deductions += 15;
    issues.push({ id: "no-lang", title: "HTML element has no lang attribute", description: 'Add a lang attribute to <html> (e.g. lang="en") so screen readers use the correct language.', impact: "high" });
  }

  checks++;
  if (d.imagesWithoutAlt === 0) { passed++; }
  else {
    deductions += Math.min(d.imagesWithoutAlt * 5, 20);
    issues.push({ id: "images-no-alt", title: `${d.imagesWithoutAlt} image${d.imagesWithoutAlt > 1 ? "s" : ""} missing alt text`, description: "Alt text is required for screen readers and shown when images fail to load.", impact: "high", details: d.images.filter(i => !i.hasAlt).map(i => i.src) });
  }

  checks++;
  if (d.imagesWithoutDimensions === 0) { passed++; }
  else {
    deductions += 5;
    issues.push({ id: "images-no-dimensions", title: `${d.imagesWithoutDimensions} image${d.imagesWithoutDimensions > 1 ? "s" : ""} without width/height`, description: "Setting explicit dimensions prevents layout shift (CLS) while images load.", impact: "medium", details: d.images.filter(i => !i.hasDimensions).map(i => i.src) });
  }

  checks++;
  if (d.hasCharset) { passed++; }
  else {
    deductions += 10;
    issues.push({ id: "no-charset", title: "No character set declared", description: 'Add <meta charset="UTF-8"> in the <head> to ensure correct text rendering across browsers.', impact: "high" });
  }

  checks++;
  if (d.buttonsWithoutLabel === 0) { passed++; }
  else {
    deductions += Math.min(d.buttonsWithoutLabel * 5, 15);
    issues.push({ id: "buttons-no-label", title: `${d.buttonsWithoutLabel} button${d.buttonsWithoutLabel > 1 ? "s" : ""} without accessible label`, description: "Buttons need visible text or an aria-label so screen reader users know their purpose.", impact: "high" });
  }

  checks++;
  if (d.inputsWithoutLabel === 0) { passed++; }
  else {
    deductions += Math.min(d.inputsWithoutLabel * 5, 15);
    issues.push({ id: "inputs-no-label", title: `${d.inputsWithoutLabel} input${d.inputsWithoutLabel > 1 ? "s" : ""} without associated label`, description: "Form inputs need a <label for='...'>, aria-label, or aria-labelledby for screen readers.", impact: "high" });
  }

  checks++;
  if (d.h1Count === 1) { passed++; }
  else if (d.h1Count === 0) {
    deductions += 5;
    issues.push({ id: "no-h1", title: "No H1 heading found", description: "Every page should have exactly one H1 heading to establish the main topic for screen readers.", impact: "medium" });
  } else {
    deductions += 5;
    issues.push({ id: "multiple-h1", title: `${d.h1Count} H1 headings found`, description: "Use only one H1 per page. Multiple H1s confuse the document outline for assistive technology.", impact: "medium" });
  }

  return { score: Math.max(5, 100 - deductions), passed, total: checks, issues };
}

function buildBestPractices(d: Omit<PageAnalysis, "categories">): CategoryResult {
  const issues: AnalysisIssue[] = [];
  let deductions = 0;
  let checks = 0;
  let passed = 0;

  checks++;
  if (d.https) { passed++; }
  else {
    deductions += 25;
    issues.push({ id: "no-https", title: "Page not served over HTTPS", description: "HTTPS encrypts data in transit and is required by modern browser features. It's also a Google ranking signal.", impact: "high" });
  }

  checks++;
  if (d.hasDoctype) { passed++; }
  else {
    deductions += 10;
    issues.push({ id: "no-doctype", title: "Missing <!DOCTYPE html>", description: "A proper DOCTYPE prevents browsers from using quirks mode, which causes inconsistent rendering.", impact: "high" });
  }

  checks++;
  if (d.hasCharset) { passed++; }
  else {
    deductions += 8;
    issues.push({ id: "no-charset-bp", title: "No charset meta tag", description: "Declare charset early in <head> to prevent security vulnerabilities and garbled text rendering.", impact: "medium" });
  }

  checks++;
  if (d.mixedContentCount === 0) { passed++; }
  else {
    deductions += Math.min(d.mixedContentCount * 5, 20);
    issues.push({ id: "mixed-content", title: `${d.mixedContentCount} insecure (HTTP) resource${d.mixedContentCount > 1 ? "s" : ""} loaded on HTTPS page`, description: "Loading HTTP resources on an HTTPS page causes mixed-content warnings and may be blocked by browsers.", impact: "high" });
  }

  checks++;
  if (d.hasCacheControl) { passed++; }
  else {
    deductions += 5;
    issues.push({ id: "no-cache", title: "No Cache-Control header", description: "Set cache headers to allow browsers to cache resources and speed up repeat visits.", impact: "low" });
  }

  checks++;
  if (d.externalLinksWithoutNoopener.length === 0) { passed++; }
  else {
    const n = d.externalLinksWithoutNoopener.length;
    deductions += 5;
    issues.push({ id: "no-noopener", title: `${n} external link${n > 1 ? "s" : ""} without rel="noopener"`, description: 'Add rel="noopener noreferrer" to target="_blank" links to prevent tabnapping security exploits.', impact: "medium", details: d.externalLinksWithoutNoopener });
  }

  checks++;
  if (!d.passwordInputOnHttp) { passed++; }
  else {
    deductions += 20;
    issues.push({ id: "password-on-http", title: "Password field on non-HTTPS page", description: "Never put password inputs on pages served over HTTP — credentials will be sent in plain text.", impact: "high" });
  }

  return { score: Math.max(5, 100 - deductions), passed, total: checks, issues };
}

function buildSeo(d: Omit<PageAnalysis, "categories">): CategoryResult {
  const issues: AnalysisIssue[] = [];
  let deductions = 0;
  let checks = 0;
  let passed = 0;

  checks++;
  if (d.hasTitle && d.titleLength >= 10 && d.titleLength <= 60) { passed++; }
  else if (!d.hasTitle) {
    deductions += 15;
    issues.push({ id: "no-title", title: "Missing <title> tag", description: "Every page must have a unique, descriptive title. It appears in search results and browser tabs.", impact: "high" });
  } else if (d.titleLength > 60) {
    deductions += 5;
    issues.push({ id: "long-title", title: `Title too long (${d.titleLength} chars)`, description: "Google truncates titles over ~60 characters in search results. Keep titles concise.", impact: "medium" });
  } else if (d.titleLength < 10) {
    deductions += 8;
    issues.push({ id: "short-title", title: `Title too short (${d.titleLength} chars)`, description: "A very short title may not describe your page well enough for search engines.", impact: "medium" });
  } else { passed++; }

  checks++;
  if (d.hasMetaDescription && d.metaDescriptionLength >= 50 && d.metaDescriptionLength <= 160) { passed++; }
  else if (!d.hasMetaDescription) {
    deductions += 10;
    issues.push({ id: "no-meta-desc", title: "Missing meta description", description: "Meta descriptions appear in search results and influence click-through rates.", impact: "high" });
  } else if (d.metaDescriptionLength > 160) {
    deductions += 3;
    issues.push({ id: "long-meta-desc", title: `Meta description too long (${d.metaDescriptionLength} chars)`, description: "Google truncates meta descriptions over ~160 characters. Aim for 50–160 characters.", impact: "low" });
  } else if (d.metaDescriptionLength < 50) {
    deductions += 5;
    issues.push({ id: "short-meta-desc", title: `Meta description too short (${d.metaDescriptionLength} chars)`, description: "A short meta description may not attract clicks. Aim for 50–160 characters.", impact: "medium" });
  } else { passed++; }

  checks++;
  if (d.hasLang) { passed++; }
  else {
    deductions += 8;
    issues.push({ id: "no-lang-seo", title: "Missing lang attribute on <html>", description: "Declare the page language to help search engines index content in the right language.", impact: "medium" });
  }

  checks++;
  if (d.h1Count === 1) { passed++; }
  else if (d.h1Count === 0) {
    deductions += 8;
    issues.push({ id: "no-h1-seo", title: "No H1 heading", description: "Search engines look for an H1 as the primary topic signal. Include exactly one H1 per page.", impact: "medium" });
  } else {
    deductions += 3;
    issues.push({ id: "multiple-h1-seo", title: `Multiple H1 headings (${d.h1Count})`, description: "Multiple H1s dilute keyword relevance signals. Use one H1 and H2–H6 for sub-sections.", impact: "low" });
  }

  checks++;
  if (!d.isNoIndex) { passed++; }
  else {
    issues.push({ id: "noindex", title: "Page has noindex meta tag", description: "This page is blocked from appearing in search results. Remove noindex if this is unintentional.", impact: "high" });
    deductions += 0;
  }

  checks++;
  if (d.hasCanonical) { passed++; }
  else {
    deductions += 5;
    issues.push({ id: "no-canonical", title: "No canonical URL declared", description: 'Add <link rel="canonical" href="..."> to prevent duplicate content issues if the page is accessible via multiple URLs.', impact: "low" });
  }

  checks++;
  if (d.hasOgTags) { passed++; }
  else {
    deductions += 3;
    issues.push({ id: "no-og-tags", title: "No Open Graph tags", description: "Add og:title, og:description, og:image tags so your page looks great when shared on social media.", impact: "low" });
  }

  checks++;
  if (d.hasStructuredData) { passed++; }
  else {
    issues.push({ id: "no-structured-data", title: "No structured data (JSON-LD)", description: "Add Schema.org structured data to enable rich results in Google Search.", impact: "low" });
  }

  return { score: Math.max(5, 100 - deductions), passed, total: checks, issues };
}

/* ── Route handler ───────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  let url: string;
  try { ({ url } = await req.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  if (!url || typeof url !== "string")
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  try { new URL(url); }
  catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }); }

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
    if (msg.includes("abort") || msg.includes("timeout"))
      return NextResponse.json({ error: "Request timed out — site took too long to respond." }, { status: 504 });
    return NextResponse.json({ error: `Could not reach the URL: ${msg}` }, { status: 502 });
  }
  const ttfb = Date.now() - start;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html"))
    return NextResponse.json({ error: "URL does not return an HTML page." }, { status: 422 });

  const html = await res.text();
  const finalUrl = res.url ?? url;
  const htmlSize = Buffer.byteLength(html, "utf8");
  const compressedSize = res.headers.get("content-length") ? parseInt(res.headers.get("content-length")!) : null;
  const compressed = /gzip|br|deflate/i.test(res.headers.get("content-encoding") ?? "");
  const https = finalUrl.startsWith("https://");
  const hasCacheControl = !!res.headers.get("cache-control");

  const scripts = parseScripts(html, finalUrl);
  const stylesheets = parseStylesheets(html, finalUrl);
  const images = parseImages(html, finalUrl);
  const renderBlockingScripts = scripts.filter(s => !s.hasDefer && !s.hasAsync);

  const inlineScripts = (html.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi) ?? []).length;
  const inlineStyles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).length;

  const allExternalResources = [
    ...scripts.filter(s => s.isExternal).map(s => hostname(s.url)),
    ...stylesheets.filter(s => s.isExternal).map(s => hostname(s.url)),
    ...images.filter(i => i.isExternal).map(i => hostname(i.src)),
  ];
  const thirdPartyDomains = [...new Set(allExternalResources)];

  // Performance hints
  const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
  const hasPreconnect = /<link[^>]+rel=["']preconnect["'][^>]*>/i.test(html);
  const hasPreload = /<link[^>]+rel=["']preload["'][^>]*>/i.test(html);
  const lazyImageCount = images.filter(i => i.hasLazy).length;
  const modernImageCount = images.filter(i => ["webp", "avif"].includes(i.format)).length;
  const legacyImageCount = images.filter(i => ["jpg", "jpeg", "png", "gif"].includes(i.format)).length;

  // Accessibility
  const hasLang = /<html[^>]+lang=["'][^"']+["'][^>]*>/i.test(html);
  const langM = /<html[^>]+lang=["']([^"']+)["'][^>]*>/i.exec(html);
  const lang = langM?.[1] ?? "";
  const hasCharset = /<meta[^>]+charset[^>]*>/i.test(html);
  const imagesWithoutAlt = images.filter(i => !i.hasAlt).length;
  const imagesWithoutDimensions = images.filter(i => !i.hasDimensions).length;

  const allButtons = [...html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi)];
  const buttonsWithoutLabel = allButtons.filter(b => {
    const attrs = b[1]; const content = b[2].replace(/<[^>]*>/g, "").trim();
    return !content && !/aria-label=/i.test(attrs) && !/aria-labelledby=/i.test(attrs) && !/title=/i.test(attrs);
  }).length;

  const allInputs = [...html.matchAll(/<input([^>]*)>/gi)];
  const labelledIds = new Set([...html.matchAll(/for=["']([^"']+)["']/gi)].map(m => m[1]));
  const inputsWithoutLabel = allInputs.filter(inp => {
    const attrs = inp[1];
    if (/type=["'](?:hidden|submit|button|reset|image|checkbox|radio)["']/i.test(attrs)) return false;
    const idM = /\bid=["']([^"']+)["']/i.exec(attrs);
    return !labelledIds.has(idM?.[1] ?? "") && !/aria-label=/i.test(attrs) && !/aria-labelledby=/i.test(attrs) && !/title=/i.test(attrs);
  }).length;

  // Accessibility extras
  const charsetM = /<meta[^>]+charset=["']?([^"'\s>]+)["']?[^>]*>/i.exec(html);
  const charsetValue = charsetM ? charsetM[1].toUpperCase() : "";

  // Best practices
  const hasDoctype = /^\s*<!doctype\s+html/i.test(html);
  const mixedContentCount = https
    ? [...html.matchAll(/(?:src|href)=["']http:\/\/[^"']+["']/gi)].length
    : 0;
  const externalLinksWithoutNoopener = [...html.matchAll(/<a([^>]+)>/gi)]
    .filter(m => {
      const a = m[1];
      return /target=["']_blank["']/i.test(a) && !/rel=["'][^"']*noopener[^"']*["']/i.test(a);
    })
    .map(m => { const h = /href=["']([^"']+)["']/i.exec(m[1]); return h?.[1] ?? ""; })
    .filter(Boolean);
  const passwordInputOnHttp = !https && /<input[^>]+type=["']password["'][^>]*>/i.test(html);

  // SEO
  const titleM = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  const hasTitle = !!titleM;
  const titleLength = titleM ? titleM[1].trim().length : 0;
  const title = titleM ? titleM[1].trim().slice(0, 80) : "";

  const metaDescM = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*/i.exec(html) ??
                    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*/i.exec(html);
  const hasMetaDescription = !!metaDescM;
  const metaDescriptionLength = metaDescM ? metaDescM[1].length : 0;
  const metaDescriptionText = metaDescM ? metaDescM[1].slice(0, 200) : "";

  const canonicalM = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*/i.exec(html) ??
                     /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*/i.exec(html);
  const hasCanonical = !!canonicalM;
  const canonicalUrl = canonicalM ? canonicalM[1] : "";

  const robotsM = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*/i.exec(html);
  const isNoIndex = /noindex/i.test(robotsM?.[1] ?? "");
  const hasRobotsMeta = !!robotsM;

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1Matches.length;
  const h1Texts = h1Matches.map(m => m[1].replace(/<[^>]*>/g, "").trim().slice(0, 80)).filter(Boolean);

  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const hasStructuredData = jsonLdMatches.length > 0;
  const structuredDataTypes: string[] = [];
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]) as Record<string, unknown>;
      const t = data["@type"];
      if (t) structuredDataTypes.push(Array.isArray(t) ? (t as string[]).join(", ") : String(t));
    } catch { /* invalid JSON */ }
  }

  const hasOgTags = /<meta[^>]+property=["']og:/i.test(html);
  const ogTitleM = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*/i.exec(html) ??
                   /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*/i.exec(html);
  const ogTitle = ogTitleM ? ogTitleM[1].slice(0, 80) : "";

  const base: Omit<PageAnalysis, "categories"> = {
    url, finalUrl, fetchTime: new Date().toISOString(), ttfb,
    htmlSize, compressedSize, compressed, https, hasCacheControl,
    scripts, stylesheets, images, renderBlockingScripts, inlineScripts, inlineStyles,
    thirdPartyDomains, hasViewport, hasPreconnect, hasPreload,
    lazyImageCount, modernImageCount, legacyImageCount,
    hasLang, lang, hasCharset, charsetValue, buttonsWithoutLabel, inputsWithoutLabel,
    imagesWithoutAlt, imagesWithoutDimensions,
    hasDoctype, mixedContentCount, externalLinksWithoutNoopener, passwordInputOnHttp,
    hasTitle, titleLength, title, hasMetaDescription, metaDescriptionLength, metaDescriptionText,
    hasCanonical, canonicalUrl, isNoIndex, hasRobotsMeta, h1Count, h1Texts,
    hasStructuredData, structuredDataTypes, hasOgTags, ogTitle,
  };

  return NextResponse.json({
    ...base,
    categories: {
      performance: buildPerformance(base),
      accessibility: buildAccessibility(base),
      bestPractices: buildBestPractices(base),
      seo: buildSeo(base),
    },
  } satisfies PageAnalysis);
}
