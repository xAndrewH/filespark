"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Result {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  format: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

async function compress(file: File, quality: number, format: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("Compression failed"));
      }, `image/${format}`, quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export default function ImageCompressorPage() {
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");
  const [results, setResults] = useState<Result[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    setProcessing(true);
    const newResults: Result[] = [];
    for (const file of files) {
      try {
        const blob = await compress(file, quality, format);
        const url = URL.createObjectURL(blob);
        newResults.push({
          name: file.name.replace(/\.[^.]+$/, "") + "." + format,
          originalSize: file.size,
          compressedSize: blob.size,
          url,
          format,
        });
      } catch {
        // skip failed
      }
    }
    setResults(r => [...r, ...newResults]);
    setProcessing(false);
  }, [quality, format]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    processFiles(Array.from(files).filter(f => f.type.startsWith("image/")));
  };

  const download = (r: Result) => {
    const a = document.createElement("a");
    a.href = r.url;
    a.download = r.name;
    a.click();
  };

  const downloadAll = () => results.forEach(download);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Image Compressor</h1>
        <p className="text-slate-500 text-sm mb-8">Compress images in your browser — no uploads, no size limits.</p>

        <div className="space-y-5">
          {/* Settings */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-white text-sm font-medium">Quality</label>
                <span className="text-blue-400 font-mono text-sm font-bold">{quality}%</span>
              </div>
              <input type="range" min={1} max={100} value={quality} onChange={e => setQuality(+e.target.value)} className="w-full" />
              <div className="flex justify-between text-slate-600 text-xs mt-1"><span>1%</span><span>100%</span></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium">Output format</span>
              <div className="flex gap-2">
                {["jpeg", "png", "webp"].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-1 rounded-lg text-sm uppercase font-mono transition-colors ${format === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
            <p className="text-slate-400 text-sm">{processing ? "Compressing…" : <>Drop images here or <span className="text-blue-400">browse</span></>}</p>
            <p className="text-slate-600 text-xs mt-1">JPEG, PNG, WEBP supported</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{results.length} image{results.length !== 1 ? "s" : ""} compressed</p>
                <div className="flex gap-2">
                  <button onClick={() => setResults([])} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Clear</button>
                  {results.length > 1 && (
                    <button onClick={downloadAll} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">Download all</button>
                  )}
                </div>
              </div>
              {results.map((r, i) => {
                const saved = Math.round((1 - r.compressedSize / r.originalSize) * 100);
                return (
                  <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{r.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {fmtSize(r.originalSize)} → {fmtSize(r.compressedSize)}
                        {saved > 0 && <span className="text-green-400 ml-1">−{saved}%</span>}
                        {saved < 0 && <span className="text-yellow-400 ml-1">+{Math.abs(saved)}%</span>}
                      </p>
                    </div>
                    <button onClick={() => download(r)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                      Download
                    </button>
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
