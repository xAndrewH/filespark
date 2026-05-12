"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function BackgroundRemoverPage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("image");
  const fileRef = useRef<HTMLInputElement>(null);

  const process = async (file: File) => {
    setOriginal(URL.createObjectURL(file));
    setResult(null);
    setError("");
    setProcessing(true);
    setProgress("Loading AI model…");
    setFileName(file.name.replace(/\.[^.]+$/, ""));

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Removing background…");
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) setProgress(`Loading model: ${Math.round((current / total) * 100)}%`);
        },
      });
      setResult(URL.createObjectURL(blob));
      setProgress("");
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
      setProgress("");
    }
    setProcessing(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    process(file);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `${fileName}_no_bg.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Background Remover</h1>
        <p className="text-slate-500 text-sm mb-8">AI-powered background removal — processed entirely in your browser.</p>

        <div className="space-y-5">
          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {processing ? (
              <div className="space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">{progress}</p>
                <p className="text-slate-600 text-xs">This may take a moment on first use while the model loads.</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm">Drop an image here or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">Works best with portraits, products, and objects</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Before / After */}
          {(original || result) && (
            <div className="grid grid-cols-2 gap-4">
              {original && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-2">Original</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={original} alt="Original" className="w-full rounded-lg object-contain max-h-60" />
                </div>
              )}
              {result ? (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-2">Background removed</p>
                  <div className="rounded-lg overflow-hidden max-h-60 flex items-center justify-center"
                    style={{ background: "repeating-conic-gradient(#374151 0% 25%, #1e293b 0% 50%) 0 0 / 16px 16px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result} alt="Result" className="w-full object-contain max-h-60" />
                  </div>
                </div>
              ) : processing ? (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center justify-center min-h-40">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : null}
            </div>
          )}

          {result && (
            <button onClick={download}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Download PNG (transparent background)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
