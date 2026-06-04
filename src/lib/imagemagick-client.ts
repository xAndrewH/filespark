import { initializeImageMagick, ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";

let ready: Promise<void> | null = null;

function ensureLoaded(): Promise<void> {
  if (!ready) {
    ready = initializeImageMagick(new URL("/magick.wasm", typeof window !== "undefined" ? window.location.origin : "http://localhost"));
  }
  return ready;
}

const FORMAT_MAP: Record<string, string> = {
  jpg: "JPEG", jpeg: "JPEG", png: "PNG", webp: "WEBP", avif: "AVIF",
  gif: "GIF", tiff: "TIFF", tif: "TIFF", bmp: "BMP", ico: "ICO",
  tga: "TGA", psd: "PSD", eps: "EPS", ai: "AI", xcf: "XCF",
  pdf: "PDF", svg: "SVG",
};

function toMagickFormat(ext: string): string {
  return FORMAT_MAP[ext.toLowerCase()] ?? ext.toUpperCase();
}

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  avif: "image/avif", gif: "image/gif", tiff: "image/tiff", tif: "image/tiff",
  bmp: "image/bmp", ico: "image/x-icon", tga: "image/x-tga",
  pdf: "application/pdf", svg: "image/svg+xml",
};

export async function convertWithImageMagick(file: File, targetFormat: string): Promise<Blob> {
  await ensureLoaded();

  const outFmt = targetFormat.toLowerCase();
  const magickOutFmt = toMagickFormat(outFmt) as MagickFormat;
  const inputBytes = new Uint8Array(await file.arrayBuffer());

  const result: Uint8Array = await ImageMagick.read(inputBytes, async (img) => {
    // ICO format has a hard 256×256 limit
    if (outFmt === "ico" && (img.width > 256 || img.height > 256)) {
      const scale = Math.min(256 / img.width, 256 / img.height);
      img.resize(Math.round(img.width * scale), Math.round(img.height * scale));
    }
    return img.write(magickOutFmt, (data) => data.slice());
  });

  const buf = new ArrayBuffer(result.byteLength);
  new Uint8Array(buf).set(result);
  return new Blob([buf], { type: MIME_MAP[outFmt] ?? "application/octet-stream" });
}
