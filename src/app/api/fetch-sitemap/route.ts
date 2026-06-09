import { NextRequest, NextResponse } from "next/server";
import { assertPublicUrl, SsrfError } from "@/lib/ssrf";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

function extractUrlEntries(xml: string): SitemapEntry[] {
  const urls: SitemapEntry[] = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = urlRegex.exec(xml)) !== null) {
    const block = m[1];
    const loc = block.match(/<loc>\s*(.*?)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    urls.push({
      loc,
      lastmod:    block.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/)?.[1],
      changefreq: block.match(/<changefreq>\s*(.*?)\s*<\/changefreq>/)?.[1],
      priority:   block.match(/<priority>\s*(.*?)\s*<\/priority>/)?.[1],
    });
  }
  return urls;
}

function extractChildSitemaps(xml: string): string[] {
  const locs: string[] = [];
  const re = /<sitemap>([\s\S]*?)<\/sitemap>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1].match(/<loc>\s*(.*?)\s*<\/loc>/)?.[1];
    if (loc) locs.push(loc);
  }
  return locs;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    await assertPublicUrl(url);
  } catch {
    return null;
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FileSpark/1.0 Sitemap Checker)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let raw: string;
  try {
    ({ domain: raw } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const base = raw.trim().startsWith("http")
    ? raw.trim().replace(/\/$/, "")
    : `https://${raw.trim().replace(/\/$/, "")}`;

  try {
    await assertPublicUrl(base);
  } catch (e) {
    if (e instanceof SsrfError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  // Discover sitemap URLs from robots.txt first
  const sitemapQueue: string[] = [];
  const robotsTxt = await fetchText(`${base}/robots.txt`);
  if (robotsTxt) {
    for (const m of robotsTxt.matchAll(/^Sitemap:\s*(.+)$/gim)) {
      sitemapQueue.push(m[1].trim());
    }
  }
  if (sitemapQueue.length === 0) {
    sitemapQueue.push(`${base}/sitemap.xml`, `${base}/sitemap_index.xml`);
  }

  const visited = new Set<string>();
  const sources: string[] = [];
  const allEntries: SitemapEntry[] = [];
  const MAX_SITEMAPS = 10;
  const MAX_URLS = 2000;

  while (sitemapQueue.length > 0 && sources.length < MAX_SITEMAPS && allEntries.length < MAX_URLS) {
    const url = sitemapQueue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const xml = await fetchText(url);
    if (!xml) continue;

    sources.push(url);

    // Sitemap index | queue child sitemaps
    if (xml.includes("<sitemapindex") || xml.includes("<sitemap>")) {
      sitemapQueue.push(...extractChildSitemaps(xml).slice(0, 20));
    }

    const entries = extractUrlEntries(xml);
    allEntries.push(...entries.slice(0, MAX_URLS - allEntries.length));
  }

  if (allEntries.length === 0) {
    const msg = sources.length === 0
      ? "No sitemap found. Make sure your site has a /sitemap.xml or a Sitemap: entry in /robots.txt."
      : "Sitemap was found but contains no <url> entries.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }

  return NextResponse.json({ entries: allEntries, sources, total: allEntries.length });
}
