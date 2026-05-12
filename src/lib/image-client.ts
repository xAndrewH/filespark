// Formats canvas can encode as output
const CANVAS_MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
};

// Input formats the browser cannot decode (fall back to server)
const SERVER_INPUT_EXTS = new Set([
  "tiff", "tif", "psd", "cr2", "nef", "arw", "dng",
  "eps", "ai", "xcf", "dds", "pcx", "tga",
]);

// Output formats canvas cannot produce (fall back to server)
const SERVER_OUTPUT_EXTS = new Set([
  "tiff", "tif", "bmp", "ico", "avif", "heic", "heif",
  "psd", "cr2", "nef", "arw", "dng", "eps", "ai", "xcf",
]);

/** Returns true when the conversion must go to the server. */
export function imageNeedsServer(inputExt: string, outputExt: string): boolean {
  return (
    SERVER_INPUT_EXTS.has(inputExt.toLowerCase()) ||
    SERVER_OUTPUT_EXTS.has(outputExt.toLowerCase())
  );
}

function isHeic(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "heic" || ext === "heif";
}

/** Load a File into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Browser could not decode this image format."));
    img.src = src;
  });
}

/**
 * Convert an image file to the target format entirely in the browser.
 * Supports JPEG, PNG, and WEBP output. HEIC input is decoded via heic2any.
 */
export async function convertImageClient(
  file: File,
  targetFormat: string,
  quality: number,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const fmt  = targetFormat.toLowerCase();
  const mime = CANVAS_MIME[fmt];

  if (!mime) {
    throw new Error(
      `${targetFormat.toUpperCase()} output is not supported in-browser. Choose JPEG, PNG, or WEBP instead.`
    );
  }

  onProgress?.(10);

  let imgUrl: string;

  // HEIC needs a decode step before the browser can display it
  if (isHeic(file)) {
    const mod = await import("heic2any");
    // heic2any ships as a CJS default export; handle both ESM and CJS interop
    const fn = (mod as unknown as { default: unknown }).default ?? mod;
    const result = await (fn as (opts: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>)({ blob: file, toType: "image/png" });
    const decoded: Blob = Array.isArray(result) ? result[0] : result;
    imgUrl = URL.createObjectURL(decoded);
  } else {
    imgUrl = URL.createObjectURL(file);
  }

  onProgress?.(35);

  let img: HTMLImageElement;
  try {
    img = await loadImage(imgUrl);
  } finally {
    URL.revokeObjectURL(imgUrl);
  }

  onProgress?.(60);

  const canvas = document.createElement("canvas");
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // JPEG has no transparency — fill white so transparent areas don't go black
  if (fmt === "jpg" || fmt === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  onProgress?.(85);

  // PNG is lossless — quality parameter is ignored by the browser
  const q = fmt === "png" ? undefined : quality / 100;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) { onProgress?.(100); resolve(blob); }
        else reject(new Error("Conversion failed — browser could not encode this format."));
      },
      mime,
      q
    );
  });
}
