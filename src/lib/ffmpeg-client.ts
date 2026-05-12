import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return instance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ff = new FFmpeg();
    const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ff.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    });
    instance = ff;
    return ff;
  })();

  return loadPromise;
}

export async function convertWithFFmpeg(
  ff: FFmpeg,
  file: File,
  outputFormat: string,
  quality: number,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const inputExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const uid = Math.random().toString(36).slice(2, 8);
  const inputName = `in_${uid}.${inputExt}`;
  const outputName = `out_${uid}.${outputFormat}`;

  const onProg = ({ progress }: { progress: number }) => {
    onProgress(Math.min(98, Math.round(progress * 100)));
  };
  ff.on("progress", onProg);

  try {
    await ff.writeFile(inputName, await fetchFile(file));
    await ff.exec(buildArgs(inputName, outputName, outputFormat, quality, inputExt));
    const data = await ff.readFile(outputName);
    // FFmpeg returns Uint8Array<ArrayBufferLike>; cast to BlobPart is safe at runtime.
    return new Blob([data as unknown as BlobPart], { type: getMime(outputFormat) });
  } finally {
    ff.off("progress", onProg);
    await ff.deleteFile(inputName).catch(() => {});
    await ff.deleteFile(outputName).catch(() => {});
  }
}

function buildArgs(input: string, output: string, fmt: string, quality: number, inputExt: string): string[] {
  const crf = Math.round(18 + ((100 - quality) * 33) / 100);
  const audioBitrate = Math.max(64, Math.round(quality * 3.2));
  const maxColors = Math.round(16 + (quality / 100) * 240); // 16–256

  // GIF output
  if (fmt === "gif") {
    const palette = `fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${maxColors}[p];[s1][p]paletteuse`;
    return ["-i", input, "-vf", palette, "-loop", "0", output];
  }

  // APNG output
  if (fmt === "apng") {
    return ["-i", input, "-f", "apng", "-plays", "0", output];
  }

  // GIF compression (gif → gif)
  if (fmt === "gif" && inputExt === "gif") {
    const palette = `fps=10,scale=iw*0.9:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${maxColors}[p];[s1][p]paletteuse=dither=bayer`;
    return ["-i", input, "-vf", palette, "-loop", "0", output];
  }

  // Audio-only output
  if (["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus"].includes(fmt)) {
    return ["-i", input, "-vn", "-b:a", `${audioBitrate}k`, output];
  }

  // Video: mp4/mov/mkv → libx264
  if (["mp4", "mov", "mkv", "avi", "flv", "mpeg"].includes(fmt)) {
    return ["-i", input, "-c:v", "libx264", "-crf", String(crf), "-preset", "fast", "-c:a", "aac", "-b:a", `${audioBitrate}k`, output];
  }

  // Video: webm → libvpx-vp9
  if (fmt === "webm") {
    return ["-i", input, "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-c:a", "libopus", output];
  }

  return ["-i", input, output];
}

function getMime(fmt: string): string {
  const map: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", avi: "video/x-msvideo",
    mov: "video/quicktime", mkv: "video/x-matroska", flv: "video/x-flv",
    mpeg: "video/mpeg",
    gif: "image/gif", apng: "image/apng",
    mp3: "audio/mpeg", wav: "audio/wav", flac: "audio/flac",
    aac: "audio/aac", ogg: "audio/ogg", m4a: "audio/mp4", opus: "audio/opus",
  };
  return map[fmt] ?? "application/octet-stream";
}
