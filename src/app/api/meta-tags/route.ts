import { NextRequest, NextResponse } from "next/server";

export interface MetaTag {
  type: "meta" | "link" | "title";
  name?: string;
  property?: string;
  httpEquiv?: string;
  content?: string;
  rel?: string;
  href?: string;
  raw: string;
}

export interface MetaTagResult {
  url: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  viewport: string;
  charset: string;
  og: { property: string; content: string }[];
  twitter: { name: string; content: string }[];
  other: MetaTag[];
  issues: string[];
  score: number;
}

function attr(attrs: string, attrName: string): string {
  const m = new RegExp(`${attrName}=["']([^"']*)["']`, "i").exec(attrs);
  return m ? m[1] : "";
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const normalized = url.startsWith("http") ? url : `https://${url}`;

    const res = await fetch(normalized, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MetaTagAnalyzer/1.0)" },
      signal: AbortSignal.timeout(10000),
    });

    const html = await res.text();

    const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const metaTags: MetaTag[] = [];
    const metaRe = /<meta([^>]*?)(?:\s*\/)?>/gi;
    let m: RegExpExecArray | null;
    while ((m = metaRe.exec(html)) !== null) {
      const raw = m[0];
      const attrs = m[1];
      const name = attr(attrs, "name");
      const property = attr(attrs, "property");
      const httpEquiv = attr(attrs, "http-equiv");
      const content = attr(attrs, "content");
      const charset = attr(attrs, "charset");
      metaTags.push({
        type: "meta",
        name: name || undefined,
        property: property || undefined,
        httpEquiv: httpEquiv || undefined,
        content: content || charset || undefined,
        raw,
      });
    }

    const linkTags: MetaTag[] = [];
    const linkRe = /<link([^>]*?)(?:\s*\/)?>/gi;
    while ((m = linkRe.exec(html)) !== null) {
      const raw = m[0];
      const attrs = m[1];
      const rel = attr(attrs, "rel");
      const href = attr(attrs, "href");
      linkTags.push({ type: "link", rel: rel || undefined, href: href || undefined, raw });
    }

    const description = metaTags.find(t => t.name?.toLowerCase() === "description")?.content ?? "";
    const robots = metaTags.find(t => t.name?.toLowerCase() === "robots")?.content ?? "";
    const viewport = metaTags.find(t => t.name?.toLowerCase() === "viewport")?.content ?? "";
    let charset = "";
    const csm = /<meta[^>]+charset=["']?([^"'\s>]+)/i.exec(html);
    if (csm) charset = csm[1];
    if (!charset) {
      charset = metaTags.find(t => t.httpEquiv?.toLowerCase() === "content-type")?.content ?? "";
    }

    const canonical = linkTags.find(t => t.rel?.toLowerCase() === "canonical")?.href ?? "";

    const og = metaTags
      .filter(t => t.property?.toLowerCase().startsWith("og:"))
      .map(t => ({ property: t.property!, content: t.content ?? "" }));

    const twitter = metaTags
      .filter(t => t.name?.toLowerCase().startsWith("twitter:") || t.property?.toLowerCase().startsWith("twitter:"))
      .map(t => ({ name: (t.name ?? t.property)!, content: t.content ?? "" }));

    const knownNames = new Set([
      "description", "robots", "viewport",
      ...og.map(o => o.property.toLowerCase()),
      ...twitter.map(t => t.name.toLowerCase()),
    ]);
    const other: MetaTag[] = [
      ...metaTags.filter(t => {
        const n = (t.name ?? t.property ?? t.httpEquiv ?? "").toLowerCase();
        return n && !knownNames.has(n);
      }),
      ...linkTags.filter(t => t.rel?.toLowerCase() !== "canonical"),
    ];

    const issues: string[] = [];
    let score = 100;

    if (!title) { issues.push("Missing <title> tag"); score -= 15; }
    else if (title.length > 60) { issues.push(`Title too long (${title.length} chars, max 60)`); score -= 5; }
    else if (title.length < 30) { issues.push(`Title too short (${title.length} chars, min 30)`); score -= 5; }

    if (!description) { issues.push("Missing meta description"); score -= 10; }
    else if (description.length > 160) { issues.push(`Meta description too long (${description.length} chars, max 160)`); score -= 5; }

    if (!canonical) { issues.push("Missing canonical URL"); score -= 5; }

    const ogTitleTags = og.filter(o => o.property.toLowerCase() === "og:title");
    if (ogTitleTags.length === 0) { issues.push("Missing og:title"); score -= 5; }
    else if (ogTitleTags.length > 1) { issues.push("Duplicate og:title tags"); score -= 5; }

    if (!og.find(o => o.property.toLowerCase() === "og:description")) { issues.push("Missing og:description"); score -= 5; }
    if (!og.find(o => o.property.toLowerCase() === "og:image")) { issues.push("Missing og:image"); score -= 5; }
    if (!twitter.find(t => t.name.toLowerCase() === "twitter:card")) { issues.push("Missing twitter:card"); score -= 5; }

    const result: MetaTagResult = {
      url: normalized,
      title,
      description,
      canonical,
      robots,
      viewport,
      charset,
      og,
      twitter,
      other,
      issues,
      score: Math.max(0, score),
    };

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
