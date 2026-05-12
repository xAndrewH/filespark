import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { maybeDecodeHeic } from "@/lib/heic";

const SHARP_FORMAT_MAP: Record<string, string> = {
  jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp",
  avif: "avif", gif: "gif", tiff: "tiff", bmp: "bmp",
};

const MIME_MAP: Record<string, string> = {
  jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  avif: "image/avif", gif: "image/gif", tiff: "image/tiff", bmp: "image/bmp",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string | null)?.toLowerCase();

    if (!file) return new NextResponse("Missing file", { status: 400 });
    if (!format) return new NextResponse("Missing format", { status: 400 });

    const sharpFmt = SHARP_FORMAT_MAP[format];
    if (!sharpFmt) return new NextResponse(`Unsupported format: ${format}`, { status: 400 });

    const inputExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const buffer = await maybeDecodeHeic(
      Buffer.from(await file.arrayBuffer()),
      inputExt
    );

    const converted = await sharp(buffer, { failOn: "none" })
      .toFormat(sharpFmt as Parameters<ReturnType<typeof sharp>["toFormat"]>[0])
      .toBuffer();

    const ext = format === "jpeg" ? "jpg" : format;

    return new NextResponse(converted as unknown as BodyInit, {
      headers: {
        "Content-Type": MIME_MAP[sharpFmt] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${ext}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/image]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Image conversion failed",
      { status: 500 }
    );
  }
}
