import { NextRequest, NextResponse } from "next/server";
import { assertPublicUrl, SsrfError } from "@/lib/ssrf";

export interface HeaderAnalysisResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  headers: { name: string; value: string; category: string; description: string }[];
  redirectChain: string[];
  responseTime: number;
}

const SECURITY_HEADERS = new Set([
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-xss-protection",
]);

const CACHING_HEADERS = new Set([
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "age",
  "vary",
]);

const CONTENT_HEADERS = new Set([
  "content-type",
  "content-encoding",
  "content-length",
  "content-language",
]);

const CORS_HEADERS = new Set([
  "access-control-allow-origin",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-max-age",
]);

const SERVER_HEADERS = new Set([
  "server",
  "x-powered-by",
  "via",
  "x-request-id",
]);

const DESCRIPTIONS: Record<string, string> = {
  "strict-transport-security": "Forces HTTPS connections",
  "content-security-policy": "Defines allowed content sources",
  "x-frame-options": "Prevents clickjacking attacks",
  "x-content-type-options": "Prevents MIME type sniffing",
  "referrer-policy": "Controls referrer information sent with requests",
  "permissions-policy": "Controls browser feature permissions",
  "x-xss-protection": "Legacy XSS filter directive",
  "cache-control": "Browser and CDN caching directives",
  "etag": "Resource version identifier for caching",
  "last-modified": "Date the resource was last changed",
  "expires": "Date/time after which the response is stale",
  "vary": "Headers that affect cached response selection",
  "content-type": "Media type of the response body",
  "content-encoding": "Encoding applied to the response body",
  "content-length": "Size of the response body in bytes",
  "content-language": "Natural language of the response",
  "access-control-allow-origin": "Allowed origins for CORS requests",
  "access-control-allow-methods": "Allowed HTTP methods for CORS",
  "access-control-allow-headers": "Allowed request headers for CORS",
  "access-control-max-age": "How long CORS preflight results can be cached",
  "server": "Web server software identifier",
  "x-powered-by": "Technology powering the server",
  "via": "Proxy or gateway information",
};

function categorize(name: string): string {
  const lower = name.toLowerCase();
  if (SECURITY_HEADERS.has(lower) || lower.startsWith("cross-origin-")) return "security";
  if (CACHING_HEADERS.has(lower)) return "caching";
  if (CONTENT_HEADERS.has(lower)) return "content";
  if (CORS_HEADERS.has(lower)) return "cors";
  if (SERVER_HEADERS.has(lower)) return "server";
  return "other";
}

export async function POST(req: NextRequest) {
  let url: string;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    await assertPublicUrl(url);
  } catch (e) {
    if (e instanceof SsrfError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const redirectChain: string[] = [];
  const start = Date.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
  } catch (headErr: unknown) {
    const isMethodNotAllowed =
      headErr instanceof Error && headErr.message.includes("405");

    if (!isMethodNotAllowed) {
      try {
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
      }
    } else {
      try {
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
      }
    }
  }

  const responseTime = Date.now() - start;

  const headers: { name: string; value: string; category: string; description: string }[] = [];
  response.headers.forEach((value, name) => {
    headers.push({
      name,
      value,
      category: categorize(name),
      description: DESCRIPTIONS[name.toLowerCase()] ?? "",
    });
  });

  return NextResponse.json({
    url,
    finalUrl: response.url,
    statusCode: response.status,
    statusText: response.statusText,
    headers,
    redirectChain,
    responseTime,
  } satisfies HeaderAnalysisResult);
}
