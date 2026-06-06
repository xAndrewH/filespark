import { NextRequest, NextResponse } from "next/server";

export interface OgPreviewResult {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  canonical: string;
  favicon: string;
  og: { title: string; description: string; image: string; url: string; siteName: string; type: string };
  twitter: { card: string; title: string; description: string; image: string; site: string; creator: string };
  resolved: { title: string; description: string; image: string; domain: string };
  warnings: string[];
}

function attr(attrs: string, attrName: string): string {
  const m = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, "i").exec(attrs);
  return m ? m[1].trim() : "";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&nbsp;/g, " ");
}

function resolveUrl(raw: string, origin: string, baseUrl: string): string {
  if (!raw) return "";
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("//")) {
    try {
      return new URL(baseUrl).protocol + v;
    } catch {
      return "https:" + v;
    }
  }
  try {
    return new URL(v, baseUrl || origin).href;
  } catch {
    if (v.startsWith("/")) return origin + v;
    return v;
  }
}

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;

  let parsedInput: URL;
  try {
    parsedInput = new URL(normalized);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!parsedInput.hostname.includes(".")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(normalized, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FileSparkBot/1.0; +https://filespark.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return NextResponse.json(
      { error: isTimeout ? "Request timed out after 10s" : "Failed to fetch URL — the site may be unreachable or blocking requests" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `The site responded with HTTP ${res.status}` },
      { status: 502 }
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType && !contentType.toLowerCase().includes("html")) {
    return NextResponse.json(
      { error: `Expected an HTML page but got "${contentType.split(";")[0]}"` },
      { status: 415 }
    );
  }

  const html = await res.text();
  const finalUrl = res.url || normalized;

  let origin = parsedInput.origin;
  try {
    origin = new URL(finalUrl).origin;
  } catch {
    /* keep input origin */
  }

  // <title>
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch ? decodeEntities(titleMatch[1].replace(/\s+/g, " ").trim()) : "";

  // collect meta tags
  const metas: { name: string; property: string; content: string }[] = [];
  const metaRe = /<meta\b([^>]*?)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html)) !== null) {
    const attrs = m[1];
    metas.push({
      name: attr(attrs, "name").toLowerCase(),
      property: attr(attrs, "property").toLowerCase(),
      content: decodeEntities(attr(attrs, "content")),
    });
  }

  // collect link tags
  const links: { rel: string; href: string }[] = [];
  const linkRe = /<link\b([^>]*?)\/?>/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const attrs = m[1];
    links.push({
      rel: attr(attrs, "rel").toLowerCase(),
      href: attr(attrs, "href"),
    });
  }

  const metaName = (n: string) => metas.find(t => t.name === n)?.content ?? "";
  const ogProp = (p: string) =>
    metas.find(t => t.property === p)?.content ??
    metas.find(t => t.name === p)?.content ??
    "";
  const twProp = (p: string) =>
    metas.find(t => t.name === p)?.content ??
    metas.find(t => t.property === p)?.content ??
    "";

  const description = metaName("description");

  const ogImageRaw = ogProp("og:image") || ogProp("og:image:url") || ogProp("og:image:secure_url");
  const twImageRaw = twProp("twitter:image") || twProp("twitter:image:src");

  const og = {
    title: ogProp("og:title"),
    description: ogProp("og:description"),
    image: resolveUrl(ogImageRaw, origin, finalUrl),
    url: ogProp("og:url"),
    siteName: ogProp("og:site_name"),
    type: ogProp("og:type"),
  };

  const twitter = {
    card: twProp("twitter:card"),
    title: twProp("twitter:title"),
    description: twProp("twitter:description"),
    image: resolveUrl(twImageRaw, origin, finalUrl),
    site: twProp("twitter:site"),
    creator: twProp("twitter:creator"),
  };

  const canonicalRaw = links.find(l => l.rel.split(/\s+/).includes("canonical"))?.href ?? "";
  const canonical = canonicalRaw ? resolveUrl(canonicalRaw, origin, finalUrl) : "";

  // favicon
  const iconLink =
    links.find(l => l.rel === "icon" || l.rel === "shortcut icon" || l.rel.split(/\s+/).includes("icon")) ||
    links.find(l => l.rel === "apple-touch-icon" || l.rel.split(/\s+/).includes("apple-touch-icon"));
  let favicon = iconLink ? resolveUrl(iconLink.href, origin, finalUrl) : "";
  if (!favicon) favicon = origin + "/favicon.ico";

  let domain = "";
  try {
    domain = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = parsedInput.hostname.replace(/^www\./, "");
  }

  const resolved = {
    title: og.title || twitter.title || title,
    description: og.description || twitter.description || description,
    image: og.image || twitter.image,
    domain,
  };

  const warnings: string[] = [];
  if (!og.image && !twitter.image) {
    warnings.push("No og:image — your link will show no preview image");
  } else if (ogImageRaw && !/^https?:\/\//i.test(ogImageRaw) && !ogImageRaw.startsWith("//")) {
    warnings.push("og:image is not an absolute URL — some platforms require a full https:// URL");
  }
  if (!og.title) warnings.push("No og:title — falling back to the page <title>");
  if (!og.description) warnings.push("No og:description — falling back to the meta description");
  if (!twitter.card) warnings.push("No twitter:card — X may render a small or no card");
  if (resolved.title && resolved.title.length > 60) {
    warnings.push(`Title is ${resolved.title.length} chars — over 60, it may be truncated`);
  }
  if (resolved.description && resolved.description.length > 200) {
    warnings.push(`Description is ${resolved.description.length} chars — over 200, it may be truncated`);
  }
  if (resolved.image) {
    warnings.push("Image dimensions unknown — recommended og:image is 1200×630 (1.91:1)");
  }

  const result: OgPreviewResult = {
    url: normalized,
    finalUrl,
    title,
    description,
    canonical,
    favicon,
    og,
    twitter,
    resolved,
    warnings,
  };

  return NextResponse.json(result);
}
