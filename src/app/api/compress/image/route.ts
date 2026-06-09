import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import sharp from "sharp";
import { maybeDecodeHeic, isHeic } from "@/lib/heic";

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "compress-image", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const quality = Math.max(1, Math.min(100, Number(formData.get("quality")) || 80));

    if (!file) return new NextResponse("Missing file", { status: 400 });
    if (file.size > MAX_UPLOAD) return new NextResponse("File too large (max 100MB)", { status: 413 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    // Pre-decode HEIC to JPEG before Sharp (Sharp's libheif lacks HEVC on Windows)
    const buffer = await maybeDecodeHeic(
      Buffer.from(await file.arrayBuffer()),
      ext
    );

    // If input was HEIC, output as JPEG
    const outputExt = isHeic(ext) ? "jpg" : ext;

    let result: Buffer;
    let mime: string;

    switch (outputExt) {
      case "png":
        result = await sharp(buffer).png({ quality, compressionLevel: 9 }).toBuffer();
        mime = "image/png";
        break;
      case "webp":
        result = await sharp(buffer).webp({ quality }).toBuffer();
        mime = "image/webp";
        break;
      case "avif":
        result = await sharp(buffer).avif({ quality }).toBuffer();
        mime = "image/avif";
        break;
      case "tiff":
        result = await sharp(buffer).tiff({ quality }).toBuffer();
        mime = "image/tiff";
        break;
      default:
        result = await sharp(buffer).jpeg({ quality, mozjpeg: true }).toBuffer();
        mime = "image/jpeg";
    }

    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="compressed.${outputExt}"`,
      },
    });
  } catch (err) {
    console.error("[api/compress/image]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Image compression failed",
      { status: 500 }
    );
  }
}
