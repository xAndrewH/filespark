import type { Category } from "@/types";

export const CATEGORIES: Record<Category, { label: string; emoji: string; mime: string; processor: "client" | "server" }> = {
  video:    { label: "Video",    emoji: "🎬", mime: "video/*",                                                                   processor: "client" },
  audio:    { label: "Audio",    emoji: "🎵", mime: "audio/*",                                                                   processor: "client" },
  image:    { label: "Image",    emoji: "🖼️", mime: "image/*,.psd,.ai,.eps,.xcf,.tga,.dds,.pcx,.cr2,.nef,.arw,.dng",            processor: "server" },
  pdf:      { label: "PDF",      emoji: "📄", mime: "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif",     processor: "server" },
  document: { label: "Document", emoji: "📝", mime: ".docx,.doc,.xlsx,.xls,.pptx,.ppt,.odt,.ods,.odp,.rtf,.txt,.csv",           processor: "server" },
  gif:      { label: "GIF",      emoji: "🎞️", mime: "image/gif,image/apng,video/mp4,video/webm,video/quicktime,video/x-msvideo", processor: "client" },
  ebook:    { label: "eBook",    emoji: "📚", mime: ".epub,.mobi,.azw,.azw3,.fb2,.lit,.lrf,.pdb,.htmlz,.txtz,.cbz,.cbr,.chm,.djvu,.prc", processor: "server" },
  font:     { label: "Font",     emoji: "🔤", mime: ".ttf,.otf,.woff,.woff2",                                                   processor: "server" },
  archive:  { label: "Archive",  emoji: "📦", mime: ".zip,.tar,.gz,.bz2,.7z,.rar,.xz,.tar.gz,.tar.bz2,.tar.xz",                processor: "server" },
};

export const INPUT_FORMATS: Record<Category, string[]> = {
  video:    ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "mpeg", "mpg", "m4v", "3gp"],
  audio:    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma", "opus"],
  image:    ["jpg", "jpeg", "jfif", "jpe", "png", "webp", "gif", "tiff", "bmp", "avif", "heic", "heif", "svg", "apng",
             "psd", "eps", "ai", "xcf", "tga", "ico", "dds", "pcx", "cr2", "nef", "arw", "dng"],
  pdf:      ["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"],
  document: ["docx", "doc", "xlsx", "xls", "pptx", "ppt", "odt", "ods", "odp", "rtf", "txt", "csv"],
  gif:      ["gif", "apng", "mp4", "avi", "mov", "webm", "mkv"],
  ebook:    ["epub", "mobi", "azw", "azw3", "fb2", "lit", "lrf", "pdb", "htmlz", "txtz", "cbz", "cbr", "chm", "djvu", "prc", "txt", "rtf"],
  font:     ["ttf", "otf", "woff", "woff2"],
  archive:  ["zip", "tar", "gz", "bz2", "7z", "rar", "xz"],
};

export const OUTPUT_FORMATS: Record<Category, string[]> = {
  video:    ["mp4", "avi", "mov", "mkv", "webm", "flv", "mpeg", "gif", "mp3"],
  audio:    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus"],
  image:    ["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "svg", "pdf", "ico", "tga"],
  pdf:      ["pdf", "jpg", "png", "docx", "epub"],
  document: ["pdf", "docx", "txt"],
  gif:      ["gif", "apng", "mp4", "webm"],
  ebook:    ["epub", "mobi", "azw3", "pdf", "fb2", "txt", "rtf", "htmlz", "docx", "lit"],
  font:     ["ttf", "otf", "woff", "woff2"],
  archive:  ["zip", "tar", "gz", "7z"],
};

export const ALL_INPUT_EXTS = [...new Set(Object.values(INPUT_FORMATS).flat())];

// Formats Sharp can't handle — route to ImageMagick instead
const IMAGEMAGICK_INPUT_EXTS  = new Set(["psd", "eps", "ai", "xcf", "tga", "dds", "pcx", "cr2", "nef", "arw", "dng"]);
// bmp: Sharp doesn't support it; pdf/svg/gif: canvas can't encode them
const IMAGEMAGICK_OUTPUT_EXTS = new Set(["ico", "tga", "eps", "bmp", "pdf", "svg", "gif"]);

export function needsImageMagick(inputExt: string, targetFormat: string): boolean {
  return IMAGEMAGICK_INPUT_EXTS.has(inputExt.toLowerCase()) || IMAGEMAGICK_OUTPUT_EXTS.has(targetFormat.toLowerCase());
}

export function detectCategory(filename: string): Category | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  for (const [cat, formats] of Object.entries(INPUT_FORMATS)) {
    if (formats.includes(ext)) return cat as Category;
  }
  return null;
}

// Returns only the output formats that are actually supported for a given input extension.
export function getCompatibleOutputs(category: Category, inputExt: string): string[] {
  const ext = inputExt.toLowerCase();

  if (category === "pdf") {
    // Images dropped into the PDF converter can only produce a PDF
    return ext === "pdf" ? ["jpg", "png", "docx", "epub"] : ["pdf"];
  }

  if (category === "image") {
    // RAW / exotic inputs: ImageMagick handles these but output is limited to common rasters
    if (["cr2", "nef", "arw", "dng", "psd", "xcf", "dds", "pcx"].includes(ext)) {
      return ["jpg", "png", "webp", "tiff", "bmp"];
    }
    if (["eps", "ai"].includes(ext)) {
      return ["jpg", "png", "webp", "tiff", "pdf"];
    }
    if (ext === "svg") {
      // SVG → raster works; raster → SVG is not meaningful
      return ["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "pdf"];
    }
    if (["tga", "ico"].includes(ext)) {
      return ["jpg", "png", "webp", "bmp", "tiff"];
    }
  }

  if (category === "document") {
    // Spreadsheets and presentations don't convert well to docx
    if (["xlsx", "xls", "ods", "csv"].includes(ext)) return ["pdf", "txt"];
    if (["pptx", "ppt", "odp"].includes(ext))         return ["pdf"];
  }

  if (category === "archive") {
    // RAR is read-only — can extract but can't create RAR; bz2/xz only repack to common formats
    return ["zip", "tar", "gz", "7z"];
  }

  return OUTPUT_FORMATS[category];
}

export function getDefaultOutput(category: Category, inputExt: string): string {
  const outs = getCompatibleOutputs(category, inputExt);
  const norm = inputExt === "jpg" ? "jpeg" : inputExt === "jpeg" ? "jpg" : inputExt;
  const filtered = outs.filter((f) => f !== inputExt && f !== norm);
  return filtered[0] ?? outs[0];
}

export function needsLibreOffice(category: Category, targetFormat: string): boolean {
  if (category === "document") return true;
  if (category === "pdf" && ["docx", "jpg", "jpeg", "png", "epub"].includes(targetFormat)) return true;
  return false;
}
