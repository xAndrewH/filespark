"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  Film,
  Download,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { loadFFmpeg } from "@/lib/ffmpeg-client";
import { fetchFile } from "@ffmpeg/util";

const FPS_OPTIONS = [5, 10, 15, 20, 24];
const WIDTH_OPTIONS = ["240", "320", "480", "640", "original"];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function VideoToGifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [start, setStart] = useState(0);
  const [clipLen, setClipLen] = useState(3);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState("480");
  const [colors, setColors] = useState(128);

  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<"loading" | "converting" | "">("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }
    setError("");
    setResultUrl("");
    setResultSize(0);
    setStart(0);
    setClipLen(3);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setVideoUrl("");
    setDuration(0);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
    setStatus("");
    setStart(0);
    setClipLen(3);
    setFps(12);
    setWidth("480");
    setColors(128);
  };

  const createGif = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    setStatus("loading");
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const inputName = `input.${ext}`;

    const onProgress = ({ progress: p }: { progress: number }) => {
      setProgress(Math.min(99, Math.round(p * 100)));
    };

    let ff;
    try {
      ff = await loadFFmpeg();
      setStatus("converting");
      ff.on("progress", onProgress);

      await ff.writeFile(inputName, await fetchFile(file));

      const scalePart =
        width === "original" ? "" : `,scale=${width}:-1:flags=lanczos`;
      const filter = `fps=${fps}${scalePart},split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer`;

      await ff.exec([
        "-ss",
        String(start),
        "-t",
        String(clipLen),
        "-i",
        inputName,
        "-vf",
        filter,
        "-loop",
        "0",
        "output.gif",
      ]);

      const data = await ff.readFile("output.gif");
      const blob = new Blob([data as unknown as BlobPart], {
        type: "image/gif",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create GIF. Please try again."
      );
    } finally {
      if (ff) {
        ff.off("progress", onProgress);
        await ff.deleteFile(inputName).catch(() => {});
        await ff.deleteFile("output.gif").catch(() => {});
      }
      setProcessing(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Film className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-slate-100">Video to GIF</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8">
          Trim a clip from any video and convert it to an animated GIF, right in
          your browser.
        </p>

        {!file && (
          <div
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-500/60 bg-blue-500/5"
                : "border-slate-700/60 hover:border-slate-600"
            }`}
          >
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 text-sm font-medium">
              Drop a video here, or click to browse
            </p>
            <p className="text-slate-500 text-xs mt-1">
              MP4, WebM, MOV and more
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {file && (
          <div className="space-y-5 mt-2">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-300 truncate">{file.name}</p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start over
                </button>
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={videoUrl}
                controls
                className="w-full max-h-64 rounded-lg bg-black"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d)) {
                    setDuration(d);
                    setClipLen((c) => Math.min(c, Math.max(1, Math.floor(d))));
                  }
                }}
              />
              <p className="text-slate-500 text-xs mt-2">
                Scrub to find the moment you want, then set the start time below.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Start time:{" "}
                  <span className="text-slate-400">{start.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, duration)}
                  step={0.1}
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Clip length: <span className="text-slate-400">{clipLen}s</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={clipLen}
                  onChange={(e) => setClipLen(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                {clipLen > 8 && (
                  <p className="text-amber-400/80 text-xs mt-1.5">
                    Long GIFs can get very large. Keep it short for smaller files.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Frame rate (FPS)
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  >
                    {FPS_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f} fps
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Width
                  </label>
                  <select
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  >
                    {WIDTH_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w === "original" ? "Original" : `${w}px`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Quality (colors):{" "}
                  <span className="text-slate-400">{colors}</span>
                </label>
                <input
                  type="range"
                  min={32}
                  max={256}
                  step={1}
                  value={colors}
                  onChange={(e) => setColors(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <p className="text-slate-500 text-xs">
                Higher FPS, width, and color count produce a better-looking GIF
                but a noticeably larger file.
              </p>

              <button
                onClick={createGif}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Film className="w-4 h-4" />
                )}
                {processing ? "Working…" : "Create GIF"}
              </button>

              {processing && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {status === "loading"
                        ? "Loading FFmpeg… (first run can take a few seconds)"
                        : "Converting…"}
                    </span>
                    {status === "converting" && <span>{progress}%</span>}
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: status === "loading" ? "100%" : `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {resultUrl && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <p className="text-sm text-slate-300 mb-3">Your GIF is ready</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Generated GIF"
                  className="w-full max-h-80 object-contain rounded-lg bg-black"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-500">
                    {formatSize(resultSize)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm px-3 py-2 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Start over
                    </button>
                    <a
                      href={resultUrl}
                      download="output.gif"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-slate-600 text-xs mt-8">
          All processing happens in your browser | your video is never uploaded.
        </p>
      </div>
    </div>
  );
}
