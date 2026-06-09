import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { writeFile, readFile, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const execFileAsync = promisify(execFile);

const MAGICK = process.env.MAGICK_PATH ?? "magick";

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", tiff: "image/tiff", bmp: "image/bmp",
  gif: "image/gif", ico: "image/x-icon", tga: "image/x-tga",
  pdf: "application/pdf", eps: "application/postscript",
  avif: "image/avif",
};

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "convert-imagemagick", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  const uid = randomBytes(8).toString("hex");
  const inputPath  = path.join(tmpdir(), `magick_${uid}_in`);
  let   outputPath = "";

  try {
    const formData = await request.formData();
    const file   = formData.get("file") as File | null;
    const format = (formData.get("format") as string | null)?.toLowerCase();

    if (!file)   return new NextResponse("Missing file", { status: 400 });
    if (file.size > MAX_UPLOAD) return new NextResponse("File too large (max 100MB)", { status: 413 });
    if (!format) return new NextResponse("Missing format", { status: 400 });

    const inputExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const inputFile = `${inputPath}.${inputExt}`;
    outputPath      = path.join(tmpdir(), `magick_${uid}_out.${format}`);

    await writeFile(inputFile, Buffer.from(await file.arrayBuffer()));

    // Build ImageMagick args | flatten multi-layer inputs (PSD/XCF) to first layer
    const args: string[] = [];
    if (["psd", "xcf"].includes(inputExt)) {
      // [0] selects the merged/composite layer
      args.push(`${inputFile}[0]`);
    } else {
      args.push(inputFile);
    }

    // ICO: create multi-resolution icon
    if (format === "ico") {
      args.push("-define", "icon:auto-resize=256,128,64,48,32,16");
    }

    // EPS output: set resolution
    if (format === "eps") {
      args.push("-density", "150");
    }

    args.push(outputPath);

    await execFileAsync(MAGICK, args, { timeout: 60_000 });

    if (!existsSync(outputPath)) {
      return new NextResponse("ImageMagick produced no output", { status: 500 });
    }

    const result = await readFile(outputPath);
    const ext    = format === "jpeg" ? "jpg" : format;

    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type":        MIME_MAP[format] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${ext}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/imagemagick]", err);
    if (err instanceof Error && err.message.includes("ENOENT")) {
      return new NextResponse(
        "ImageMagick is not installed. Install it from https://imagemagick.org and set MAGICK_PATH env if needed.",
        { status: 500 }
      );
    }
    return new NextResponse(
      err instanceof Error ? err.message : "ImageMagick conversion failed",
      { status: 500 }
    );
  } finally {
    const files = await readdir(tmpdir()).catch(() => [] as string[]);
    await Promise.all(
      files
        .filter((f) => f.startsWith(`magick_${uid}`))
        .map((f) => unlink(path.join(tmpdir(), f)).catch(() => {}))
    );
  }
}
