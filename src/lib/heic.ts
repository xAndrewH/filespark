/**
 * HEIC pre-processing utility.
 *
 * Sharp's bundled libheif on Windows is built without HEVC codec support
 * (error 11.6003 / heif_suberror_Unsupported_codec). heic-convert ships its
 * own WASM-compiled libheif that includes HEVC decoding, so we decode HEIC
 * first and hand the resulting JPEG buffer to Sharp.
 */

export const HEIC_EXTS = new Set(["heic", "heif", "hif"]);

export function isHeic(ext: string): boolean {
  return HEIC_EXTS.has(ext.toLowerCase());
}

/**
 * Decode a HEIC/HEIF buffer to JPEG using heic-convert's WASM libheif.
 * Returns the original buffer unchanged for non-HEIC inputs.
 *
 * We use `as Buffer<ArrayBuffer>` casts throughout to satisfy TypeScript's
 * strict generic Buffer<ArrayBufferLike> vs Buffer<ArrayBuffer> constraints —
 * at runtime all buffers here are backed by plain ArrayBuffers.
 */
export async function maybeDecodeHeic(
  buffer: Buffer,
  ext: string
): Promise<Buffer> {
  if (!isHeic(ext)) return buffer;

  // Dynamic import keeps heic-convert out of the cold-start bundle for routes
  // that never touch HEIC files.
  const { default: convert } = await import("heic-convert");

  const result = await convert({ buffer, format: "JPEG", quality: 0.95 });
  return Buffer.from(result);
}
