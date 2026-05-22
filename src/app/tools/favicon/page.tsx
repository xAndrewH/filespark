"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const SIZES = [16, 32, 48, 64, 96, 180, 192, 512];

function resizeToCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const aspect = img.naturalWidth / img.naturalHeight;
  const drawW = aspect >= 1 ? size : size * aspect;
  const drawH = aspect <= 1 ? size : size / aspect;
  ctx.drawImage(img, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);
  return canvas;
}

export default function FaviconPage() {
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [original, setOriginal] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setOriginal(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      const generated = SIZES.map(size => ({
        size,
        url: resizeToCanvas(img, size).toDataURL("image/png"),
      }));
      setPreviews(generated);
    };
    img.src = url;
  };

  const downloadAll = async () => {
    if (!imgEl) return;
    setDownloading(true);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const size of SIZES) {
      const canvas = resizeToCanvas(imgEl, size);
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/png"));
      zip.file(`favicon-${size}x${size}.png`, blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "favicons.zip";
    a.click();
    setDownloading(false);
  };

  const downloadOne = (url: string, size: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `favicon-${size}x${size}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Favicon Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Upload any image and get favicon PNGs at all standard sizes — processed in your browser.</p>

        <div className="space-y-5">
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {original ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={original} alt="Source" className="w-20 h-20 object-contain rounded-xl border border-slate-700" />
                <p className="text-slate-400 text-sm">Click to change image</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm">Drop an image here or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">Best results with a square image (at least 512×512)</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {previews.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {previews.map(({ size, url }) => (
                  <div key={size} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center w-16 h-16"
                      style={{ background: "repeating-conic-gradient(#374151 0% 25%, #1e293b 0% 50%) 0 0 / 12px 12px", borderRadius: "0.5rem" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${size}px`} style={{ width: Math.min(size, 56), height: Math.min(size, 56) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-mono">{size}×{size}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {size === 16 || size === 32 ? "Browser tab" :
                         size === 48 ? "Desktop shortcut" :
                         size === 180 ? "Apple Touch Icon" :
                         size === 192 ? "Android / PWA" :
                         size === 512 ? "PWA splash" : "General use"}
                      </p>
                    </div>
                    <button onClick={() => downloadOne(url, size)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                      ↓
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={downloadAll} disabled={downloading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                {downloading ? "Zipping…" : `Download all ${SIZES.length} sizes as ZIP`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
