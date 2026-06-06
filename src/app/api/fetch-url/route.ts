import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  let url: string;
  try {
    ({ url } = await req.json());
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return new NextResponse("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return new NextResponse("Only http/https URLs are supported", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { "User-Agent": "FileSpark/1.0 (file converter)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return new NextResponse(
      timedOut ? "Timed out — the site took too long to respond (15s limit)" : "Failed to fetch URL",
      { status: timedOut ? 504 : 502 }
    );
  }

  if (!upstream.ok) {
    return new NextResponse(`Remote returned ${upstream.status}`, { status: 502 });
  }

  const contentLength = upstream.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
    return new NextResponse("File is too large (max 50 MB)", { status: 413 });
  }

  const buffer = await upstream.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return new NextResponse("File is too large (max 50 MB)", { status: 413 });
  }

  // Extract filename from Content-Disposition or URL path
  const disposition = upstream.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
  const filename = match?.[1] ?? parsed.pathname.split("/").pop() ?? "file";

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "x-filename": decodeURIComponent(filename),
    },
  });
}
