"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Film, Download, Loader2, RotateCcw } from "lucide-react";
import { loadFFmpeg } from "@/lib/ffmpeg-client";
import { fetchFile } from "@ffmpeg/util";
import { formatBytes } from "@/lib/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

interface ImgFile {
  id: string;
  file: File;
  url: string;
}

const WIDTH_OPTIONS = ["240", "320", "480", "640", "original"];

export default function ImagesToGifPage() {
  const [images, setImages]   = useState<ImgFile[]>([]);
  const [delay, setDelay]     = useState(0.5);
  const [width, setWidth]     = useState("480");
  const [colors, setColors]   = useState(128);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus]   = useState<"loading" | "rendering" | "encoding" | "">("");
  const [progress, setProgress] = useState(0);
  const [error, setError]     = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) { setError("Please select image files (PNG, JPG, WEBP)."); return; }
    setError("");
    if (resultUrl) { URL.revokeObjectURL(resultUrl); setResultUrl(""); setResultSize(0); }
    setImages((prev) => [
      ...prev,
      ...valid.map((f) => ({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f) })),
    ]);
  }, [resultUrl]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (id: string) => setImages((prev) => {
    const target = prev.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.url);
    return prev.filter((i) => i.id !== id);
  });

  const moveUp   = (idx: number) => setImages((p) => { const n = [...p]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  const moveDown = (idx: number) => setImages((p) => { const n = [...p]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });

  const reset = () => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImages([]);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
    setStatus("");
  };

  const loadImg = (file: File): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)); };
    img.src = url;
  });

  const createGif = async () => {
    if (images.length < 2) { setError("Add at least 2 images."); return; }
    setProcessing(true);
    setError("");
    setProgress(0);
    setStatus("loading");
    if (resultUrl) { URL.revokeObjectURL(resultUrl); setResultUrl(""); setResultSize(0); }

    let ff;
    const written: string[] = [];
    try {
      const imgs = await Promise.all(images.map((i) => loadImg(i.file)));

      let canvasW: number, canvasH: number;
      if (width === "original") {
        canvasW = imgs[0].naturalWidth;
        canvasH = imgs[0].naturalHeight;
      } else {
        canvasW = Number(width);
        canvasH = Math.round(canvasW * (imgs[0].naturalHeight / imgs[0].naturalWidth));
      }
      canvasW -= canvasW % 2;
      canvasH -= canvasH % 2;

      setStatus("rendering");
      ff = await loadFFmpeg();
      setStatus("encoding");

      const onProgress = ({ progress: p }: { progress: number }) => {
        setProgress(Math.min(99, Math.round(p * 100)));
      };
      ff.on("progress", onProgress);

      for (let i = 0; i < imgs.length; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasW, canvasH);
        const scale = Math.min(canvasW / imgs[i].naturalWidth, canvasH / imgs[i].naturalHeight);
        const dw = imgs[i].naturalWidth * scale;
        const dh = imgs[i].naturalHeight * scale;
        ctx.drawImage(imgs[i], (canvasW - dw) / 2, (canvasH - dh) / 2, dw, dh);
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("Failed to encode frame"))), "image/png")
        );
        const name = `frame_${String(i + 1).padStart(3, "0")}.png`;
        await ff.writeFile(name, await fetchFile(blob));
        written.push(name);
      }

      const fps = +(1 / delay).toFixed(4);
      const filter = `split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer`;
      await ff.exec(["-framerate", String(fps), "-i", "frame_%03d.png", "-vf", filter, "-loop", "0", "output.gif"]);

      const data = await ff.readFile("output.gif");
      const blob = new Blob([data as unknown as BlobPart], { type: "image/gif" });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setProgress(100);

      ff.off("progress", onProgress);
      written.push("output.gif");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create GIF. Please try again.");
    } finally {
      if (ff) {
        for (const name of written) await ff.deleteFile(name).catch(() => {});
      }
      setProcessing(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Film className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-slate-100">Images to GIF</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8">Combine a sequence of images into an animated GIF, right in your browser.</p>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-dashed cursor-pointer transition-all mb-5 ${
            isDragging
              ? "border-blue-500/70 bg-blue-500/8 text-blue-400"
              : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-18 0V6A2.25 2.25 0 015.25 3.75h13.5A2.25 2.25 0 0121 6v10.5m-18 0h18" />
          </svg>
          <div className="text-center">
            <p className="font-medium text-sm">Drop images here</p>
            <p className="text-xs opacity-60 mt-0.5">or click to browse — added in order, reorder below</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <ErrorAlert message={error} className="mb-4" />

        {/* Image list */}
        {images.length > 0 && (
          <div className="space-y-2 mb-5">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.file.name} className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{img.file.name}</p>
                  <p className="text-slate-500 text-xs">{formatBytes(img.file.size)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button onClick={() => remove(img.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors ml-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-5 mb-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Frame delay: <span className="text-slate-400">{delay.toFixed(1)}s per image</span>
            </label>
            <input type="range" min={0.1} max={2} step={0.1} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Width</label>
              <select value={width} onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors">
                {WIDTH_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w === "original" ? "Original (first image)" : `${w}px`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Quality (colors): <span className="text-slate-400">{colors}</span>
              </label>
              <input type="range" min={32} max={256} step={1} value={colors} onChange={(e) => setColors(Number(e.target.value))} className="w-full accent-blue-500 mt-3" />
            </div>
          </div>

          <p className="text-slate-500 text-xs">
            Images of different sizes are centered and letterboxed onto a common canvas based on the first image&apos;s aspect ratio.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={createGif}
              disabled={processing || images.length < 2}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              {processing ? "Working…" : "Create GIF"}
            </button>
            {images.length > 0 && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            )}
          </div>

          {processing && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {status === "loading" ? "Loading FFmpeg… (first run can take a few seconds)" : status === "rendering" ? "Preparing frames…" : "Encoding…"}
                </span>
                {status === "encoding" && <span>{progress}%</span>}
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: status === "encoding" ? `${progress}%` : "100%" }} />
              </div>
            </div>
          )}
        </div>

        {resultUrl && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <p className="text-sm text-slate-300 mb-3">Your GIF is ready</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Generated GIF" className="w-full max-h-80 object-contain rounded-lg bg-black" />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">{formatBytes(resultSize)}</span>
              <a href={resultUrl} download="animation.gif"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        )}

        <RelatedTools current="/tools/images-to-gif" />
      </div>
    </div>
  );
}
