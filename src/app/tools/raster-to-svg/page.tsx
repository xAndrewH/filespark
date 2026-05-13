"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────────────
   Raster → SVG   (PNG / JPG / WEBP → traced vector SVG)

   Uses ImageTracer.js (loaded from CDN) for full-color tracing, and
   a built-in threshold+potrace-style path-builder for B&W mode.
────────────────────────────────────────────────────────────────── */

type Mode = "color" | "bw" | "embed";

interface Options {
  mode: Mode;
  colors: number;        // color mode
  threshold: number;     // bw mode 0-255
  blur: number;          // pre-blur radius
  scale: number;         // output scale multiplier
  smoothing: number;     // path corner threshold
}

declare global {
  interface Window {
    ImageTracer?: {
      imageToSVG: (url: string, callback: (svg: string) => void, opts?: object) => void;
    };
  }
}

async function loadImageTracer(): Promise<void> {
  if (window.ImageTracer) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js";
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error("Failed to load ImageTracer"));
    document.head.appendChild(s);
  });
}

function embedSVG(url: string, w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image href="${url}" width="${w}" height="${h}"/></svg>`;
}

async function traceColor(url: string, opts: Options): Promise<string> {
  await loadImageTracer();
  return new Promise((resolve, reject) => {
    if (!window.ImageTracer) { reject(new Error("ImageTracer not loaded")); return; }
    window.ImageTracer.imageToSVG(url, (svg: string) => resolve(svg), {
      numberofcolors: opts.colors,
      blurradius:     opts.blur,
      corsenabled:    false,
      scale:          opts.scale,
      ltres:          opts.smoothing,
      qtres:          opts.smoothing,
    });
  });
}

function getImageData(url: string, blur: number): Promise<{ data: ImageData; w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (blur > 0) { ctx.filter = `blur(${blur}px)`; }
      ctx.drawImage(img, 0, 0);
      resolve({ data: ctx.getImageData(0, 0, canvas.width, canvas.height), w: canvas.width, h: canvas.height });
    };
    img.src = url;
  });
}

async function traceBW(url: string, opts: Options): Promise<string> {
  const { data, w, h } = await getImageData(url, opts.blur);
  const threshold = opts.threshold;
  // Build a simple <rect> grid SVG from pixel luminance (quick B&W trace)
  // For production you'd use a marching-squares contour tracer; this gives a clean result for logos
  let paths = "";
  const px = data.data;
  // Run-length encode rows
  for (let y = 0; y < h; y++) {
    let runStart = -1;
    for (let x = 0; x <= w; x++) {
      const idx = (y * w + Math.min(x, w - 1)) * 4;
      const lum = 0.299 * px[idx] + 0.587 * px[idx+1] + 0.114 * px[idx+2];
      const dark = lum < threshold && px[idx+3] > 128;
      if (dark && runStart === -1) runStart = x;
      else if (!dark && runStart !== -1) {
        paths += `<rect x="${runStart}" y="${y}" width="${x - runStart}" height="1"/>`;
        runStart = -1;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g fill="#000000">${paths}</g></svg>`;
}

export default function RasterToSvgPage() {
  const [original, setOriginal]   = useState<string | null>(null);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [svgBlob, setSvgBlob]     = useState<string | null>(null);
  const [processing, setProc]     = useState(false);
  const [progress, setProgress]   = useState("");
  const [error, setError]         = useState("");
  const [fileName, setFileName]   = useState("image");
  const [opts, setOpts]           = useState<Options>({
    mode: "color", colors: 16, threshold: 128, blur: 0, scale: 1, smoothing: 1,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Options>(k: K, v: Options[K]) => setOpts((o) => ({ ...o, [k]: v }));

  const convert = useCallback(async (url: string, name: string, options: Options) => {
    setProc(true);
    setError("");
    setSvgResult(null);
    setSvgBlob(null);
    try {
      let svg: string;
      if (options.mode === "embed") {
        setProgress("Embedding…");
        const { data: { width: w, height: h } } = await new Promise<{ data: { width: number; height: number } }>((res) => {
          const img = new Image(); img.onload = () => res({ data: { width: img.naturalWidth, height: img.naturalHeight } }); img.src = url;
        });
        svg = embedSVG(url, w, h);
      } else if (options.mode === "bw") {
        setProgress("Tracing (B&W)…");
        svg = await traceBW(url, options);
      } else {
        setProgress("Loading tracer…");
        await loadImageTracer();
        setProgress("Tracing colors…");
        svg = await traceColor(url, options);
      }
      const blob = new Blob([svg], { type: "image/svg+xml" });
      setSvgResult(URL.createObjectURL(blob));
      setSvgBlob(svg);
    } catch (e) {
      setError((e as Error).message);
    }
    setProgress("");
    setProc(false);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const name = file.name.replace(/\.[^.]+$/, "");
    setFileName(name);
    const url = URL.createObjectURL(file);
    setOriginal(url);
    convert(url, name, opts);
  };

  const rerun = () => { if (original) convert(original, fileName, opts); };

  const download = () => {
    if (!svgBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svgBlob], { type: "image/svg+xml" }));
    a.download = `${fileName}.svg`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">PNG / JPG → SVG</h1>
        <p className="text-slate-500 text-sm mb-8">Vectorize raster images to scalable SVG — color trace, B&amp;W trace, or embed.</p>

        <div className="space-y-4">
          {/* Mode + options */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            {/* Mode */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm w-20 shrink-0">Mode</span>
              <div className="flex gap-2 flex-wrap">
                {([
                  ["color", "Color Trace", "Full-color vectorization (slower)"],
                  ["bw",    "B&W Trace",   "Black & white pixel trace (fast)"],
                  ["embed", "Embed",        "Wrap the raster image inside SVG"],
                ] as [Mode, string, string][]).map(([id, label, tip]) => (
                  <button key={id} onClick={() => set("mode", id)} title={tip}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${opts.mode === id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color options */}
            {opts.mode === "color" && (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm w-20 shrink-0">Colors</span>
                  <input type="range" min={2} max={64} value={opts.colors} onChange={(e) => set("colors", +e.target.value)} className="flex-1 accent-blue-500" />
                  <span className="text-blue-400 font-mono text-sm w-8 text-right">{opts.colors}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm w-20 shrink-0">Smoothing</span>
                  <input type="range" min={0} max={5} step={0.5} value={opts.smoothing} onChange={(e) => set("smoothing", +e.target.value)} className="flex-1 accent-blue-500" />
                  <span className="text-blue-400 font-mono text-sm w-8 text-right">{opts.smoothing}</span>
                </div>
              </>
            )}

            {/* B&W threshold */}
            {opts.mode === "bw" && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-20 shrink-0">Threshold</span>
                <input type="range" min={0} max={255} value={opts.threshold} onChange={(e) => set("threshold", +e.target.value)} className="flex-1 accent-blue-500" />
                <span className="text-blue-400 font-mono text-sm w-8 text-right">{opts.threshold}</span>
              </div>
            )}

            {/* Blur (color + bw) */}
            {opts.mode !== "embed" && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-20 shrink-0">Pre-blur</span>
                <input type="range" min={0} max={5} value={opts.blur} onChange={(e) => set("blur", +e.target.value)} className="flex-1 accent-blue-500" />
                <span className="text-blue-400 font-mono text-sm w-8 text-right">{opts.blur}px</span>
              </div>
            )}

            {original && (
              <button onClick={rerun} disabled={processing}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors disabled:opacity-40">
                ↺ Re-convert with current settings
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {processing ? (
              <div className="space-y-2">
                <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">{progress}</p>
                {opts.mode === "color" && <p className="text-slate-600 text-xs">Color tracing may take a moment for large images.</p>}
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Drop a PNG, JPG, or WEBP or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">Best results with logos, icons, and flat-color artwork</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Before/after */}
          {original && svgResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-2">Original (raster)</p>
                <div className="rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center min-h-32"
                  style={{ background: "repeating-conic-gradient(#374151 0% 25%,#1e293b 0% 50%) 0 0/12px 12px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={original} alt="Original" className="w-full max-h-60 object-contain" />
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-2">SVG output (scalable)</p>
                <div className="rounded-lg overflow-hidden flex items-center justify-center min-h-32"
                  style={{ background: "repeating-conic-gradient(#374151 0% 25%,#1e293b 0% 50%) 0 0/12px 12px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={svgResult} alt="SVG" className="w-full max-h-60 object-contain" />
                </div>
              </div>
            </div>
          )}

          {svgBlob && (
            <div className="space-y-2">
              <button onClick={download}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                Download SVG
              </button>
              <p className="text-slate-600 text-xs text-center">
                SVG size: ~{Math.round(new Blob([svgBlob]).size / 1024)} KB
                {opts.mode === "embed" && " (embeds original raster — not a true vector)"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
