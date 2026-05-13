"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Result {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  format: string;
  width: number;
  height: number;
  originalUrl: string;
  quality: number;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

async function compressImage(
  file: File, quality: number, format: string,
  maxW: number | null, maxH: number | null
): Promise<{ blob: Blob; width: number; height: number; originalUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (maxH && h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (format === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve({ blob, width: w, height: h, originalUrl: URL.createObjectURL(file) });
        else reject(new Error("Compression failed"));
      }, `image/${format}`, quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export default function ImageCompressorPage() {
  const [globalQuality, setGlobalQuality] = useState(80);
  const [format, setFormat]               = useState("jpeg");
  const [maxW, setMaxW]                   = useState<string>("");
  const [maxH, setMaxH]                   = useState<string>("");
  const [results, setResults]             = useState<Result[]>([]);
  const [processing, setProcessing]       = useState(false);
  const [preview, setPreview]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    setProcessing(true);
    const newResults: Result[] = [];
    for (const file of files) {
      try {
        const mw = maxW ? parseInt(maxW) : null;
        const mh = maxH ? parseInt(maxH) : null;
        const { blob, width, height, originalUrl } = await compressImage(file, globalQuality, format, mw, mh);
        newResults.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^.]+$/, "") + "." + format,
          originalSize: file.size,
          compressedSize: blob.size,
          url: URL.createObjectURL(blob),
          format, width, height, originalUrl,
          quality: globalQuality,
        });
      } catch { /* skip failed */ }
    }
    setResults((r) => [...r, ...newResults]);
    setProcessing(false);
  }, [globalQuality, format, maxW, maxH]);

  const recompress = async (r: Result, newQ: number) => {
    const resp = await fetch(r.originalUrl);
    const blob = await resp.blob();
    const file = new File([blob], r.name, { type: blob.type });
    const mw = maxW ? parseInt(maxW) : null;
    const mh = maxH ? parseInt(maxH) : null;
    const { blob: newBlob, width, height } = await compressImage(file, newQ, r.format, mw, mh);
    URL.revokeObjectURL(r.url);
    setResults((rs) => rs.map((x) => x.id === r.id ? { ...x, compressedSize: newBlob.size, url: URL.createObjectURL(newBlob), quality: newQ, width, height } : x));
  };

  const download = (r: Result) => {
    const a = document.createElement("a");
    a.href = r.url; a.download = r.name; a.click();
  };

  const downloadAll = async () => {
    if (results.length === 1) { download(results[0]); return; }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    await Promise.all(results.map(async (r) => {
      const res = await fetch(r.url);
      zip.file(r.name, await res.blob());
    }));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "compressed-images.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const totalSaved = results.reduce((s, r) => s + (r.originalSize - r.compressedSize), 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Image preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white text-xl w-9 h-9 bg-black/50 rounded-full flex items-center justify-center" onClick={() => setPreview(null)}>✕</button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Image Compressor</h1>
        <p className="text-slate-500 text-sm mb-8">Compress and resize images in your browser — no uploads, no limits.</p>

        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            {/* Format */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm w-20 shrink-0">Format</span>
              <div className="flex gap-2">
                {["jpeg","png","webp"].map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${format === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {/* Quality */}
            {format !== "png" && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-20 shrink-0">Quality</span>
                <input type="range" min={1} max={100} value={globalQuality}
                  onChange={(e) => setGlobalQuality(+e.target.value)}
                  className="flex-1 accent-blue-500" />
                <span className="text-blue-400 font-mono text-sm w-10 text-right">{globalQuality}%</span>
              </div>
            )}
            {/* Max dimensions */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm w-20 shrink-0">Max size</span>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Width" value={maxW} onChange={(e) => setMaxW(e.target.value)}
                  className="w-24 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder-slate-600" />
                <span className="text-slate-600 text-sm">×</span>
                <input type="number" placeholder="Height" value={maxH} onChange={(e) => setMaxH(e.target.value)}
                  className="w-24 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder-slate-600" />
                <span className="text-slate-600 text-xs">px (optional)</span>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const fs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")); if (fs.length) processFiles(fs); }}>
            {processing ? (
              <div className="space-y-2">
                <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Compressing…</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Drop images or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">JPEG · PNG · WEBP · GIF · multiple files OK</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { const fs = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/")); if (fs.length) processFiles(fs); }} />
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{results.length} image{results.length !== 1 ? "s" : ""}</p>
                  {totalSaved > 0 && <p className="text-green-400 text-xs">Saved {fmtSize(totalSaved)} total</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setResults([])} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Clear</button>
                  <button onClick={downloadAll} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                    {results.length === 1 ? "Download" : "Download ZIP"}
                  </button>
                </div>
              </div>

              {results.map((r) => {
                const saved = Math.round((1 - r.compressedSize / r.originalSize) * 100);
                return (
                  <div key={r.id} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <button onClick={() => setPreview(r.url)} className="shrink-0 hover:opacity-80 transition-opacity" title="Click to preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.url} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-700" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{r.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {r.width}×{r.height}px &nbsp;·&nbsp;
                          {fmtSize(r.originalSize)} → {fmtSize(r.compressedSize)}
                          {saved > 0 && <span className="text-green-400 ml-1.5 font-medium">−{saved}%</span>}
                          {saved < 0 && <span className="text-yellow-400 ml-1.5">+{Math.abs(saved)}%</span>}
                        </p>
                        {/* Per-image quality slider (jpeg/webp only) */}
                        {r.format !== "png" && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-slate-600 text-[11px]">Q</span>
                            <input type="range" min={1} max={100} defaultValue={r.quality}
                              onMouseUp={(e) => recompress(r, +(e.target as HTMLInputElement).value)}
                              onTouchEnd={(e) => recompress(r, +(e.target as HTMLInputElement).value)}
                              className="flex-1 h-1 accent-blue-500" />
                            <span className="text-slate-500 text-[11px] w-8">{r.quality}%</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => download(r)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
