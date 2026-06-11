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
  archive:  { label: "Archive",  emoji: "📦", mime: ".zip,.tar,.gz,.tar.gz",                                                    processor: "client" },
};

export const INPUT_FORMATS: Record<Category, string[]> = {
  video:    ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "mpeg", "mpg", "m4v", "3gp"],
  audio:    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma", "opus"],
  // gif and apng intentionally excluded | they belong to the gif category for FFmpeg handling
  image:    ["jpg", "jpeg", "jfif", "jpe", "png", "webp", "tiff", "bmp", "avif", "heic", "heif", "svg",
             "psd", "eps", "ai", "xcf", "tga", "ico", "dds", "pcx", "cr2", "nef", "arw", "dng"],
  pdf:      ["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"],
  document: ["docx", "doc", "xlsx", "xls", "pptx", "ppt", "odt", "ods", "odp", "rtf", "txt", "csv"],
  gif:      ["gif", "apng", "mp4", "avi", "mov", "webm", "mkv"],
  ebook:    ["epub", "mobi", "azw", "azw3", "fb2", "lit", "lrf", "pdb", "htmlz", "txtz", "cbz", "cbr", "chm", "djvu", "prc", "txt", "rtf"],
  font:     ["ttf", "otf", "woff", "woff2"],
  // Only formats the browser can extract and repack; bz2/7z/rar/xz have no server handler
  archive:  ["zip", "tar", "gz"],
};

export const OUTPUT_FORMATS: Record<Category, string[]> = {
  video:    ["mp4", "avi", "mov", "mkv", "webm", "flv", "mpeg", "gif", "mp3"],
  audio:    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus"],
  image:    ["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "svg", "pdf", "ico", "tga"],
  pdf:      ["jpg", "png", "webp", "docx", "epub"],
  document: ["pdf", "docx", "txt"],
  gif:      ["gif", "apng", "mp4", "webm"],
  ebook:    ["epub", "mobi", "azw3", "pdf", "fb2", "txt", "rtf", "htmlz", "docx", "lit"],
  font:     ["ttf", "otf", "woff", "woff2"],
  archive:  ["zip", "tar", "gz"],
};

// One-line descriptions for common formats, shown under options in format selectors.
export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  jpg:  "Small files, no transparency | best for photos",
  jpeg: "Small files, no transparency | best for photos",
  png:  "Lossless with transparency, larger files",
  webp: "Modern web format | smaller than JPG and PNG",
  avif: "Newest format, smallest files | slower to encode",
  gif:  "Animation support, 256 colors | large files",
  tiff: "Lossless print quality | very large files",
  bmp:  "Uncompressed bitmap | huge files, wide support",
  svg:  "Vector graphics | scales to any size",
  pdf:  "Universal document | layout preserved everywhere",
  docx: "Microsoft Word | editable text",
  xlsx: "Microsoft Excel | editable spreadsheet",
  pptx: "Microsoft PowerPoint | editable slides",
  txt:  "Plain text | no formatting",
  md:   "Markdown | plain text with light formatting",
  html: "Web page | opens in any browser",
  epub: "Standard eBook | reflows on any screen",
  mp4:  "Most compatible video | plays everywhere",
  webm: "Open web video | great compression",
  mov:  "Apple QuickTime video",
  avi:  "Legacy Windows video | large files",
  mkv:  "Flexible container | multiple tracks and subtitles",
  mp3:  "Universal audio | good size and quality",
  wav:  "Uncompressed audio | studio quality, large files",
  ogg:  "Open audio format | good compression",
  flac: "Lossless audio | perfect quality, larger files",
  aac:  "Efficient audio | used by Apple and YouTube",
  m4a:  "AAC audio in an MP4 container",
  zip:  "Universal archive | works everywhere",
};

export const ALL_INPUT_EXTS = [...new Set(Object.values(INPUT_FORMATS).flat())];

// Formats Sharp can't handle | route to ImageMagick WASM instead
// svg: Sharp needs librsvg; bmp: Sharp doesn't support output; pdf/gif: canvas can't encode them
const IMAGEMAGICK_INPUT_EXTS  = new Set(["psd", "eps", "ai", "xcf", "tga", "dds", "pcx", "cr2", "nef", "arw", "dng", "svg"]);
const IMAGEMAGICK_OUTPUT_EXTS = new Set(["ico", "tga", "eps", "bmp", "pdf", "svg", "gif"]);

export function needsImageMagick(inputExt: string, targetFormat: string): boolean {
  return IMAGEMAGICK_INPUT_EXTS.has(inputExt.toLowerCase()) || IMAGEMAGICK_OUTPUT_EXTS.has(targetFormat.toLowerCase());
}

export function detectCategory(filename: string): Category | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  // Check gif category before image to avoid gif/apng being swallowed by image
  const ORDER: Category[] = ["gif", "video", "audio", "image", "pdf", "document", "ebook", "font", "archive"];
  for (const cat of ORDER) {
    if (INPUT_FORMATS[cat].includes(ext)) return cat;
  }
  return null;
}

// Returns only the output formats that are actually supported for a given input extension.
export function getCompatibleOutputs(category: Category, inputExt: string): string[] {
  const ext = inputExt.toLowerCase();

  if (category === "pdf") {
    // Images → PDF only; PDF → raster/docx/epub
    return ext === "pdf" ? ["jpg", "png", "webp", "docx", "epub"] : ["pdf"];
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
      return ["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "pdf"];
    }
    if (["tga", "ico"].includes(ext)) {
      return ["jpg", "png", "webp", "bmp", "tiff"];
    }
  }

  if (category === "document") {
    if (["xlsx", "xls", "ods", "csv"].includes(ext)) return ["pdf", "txt"];
    if (["pptx", "ppt", "odp"].includes(ext))         return ["pdf"];
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
  if (category === "pdf" && ["docx", "epub"].includes(targetFormat)) return true;
  return false;
}
