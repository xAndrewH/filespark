"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

export default function SvgToPngPage() {
  const [svg, setSvg] = useState("");
  const [scale, setScale] = useState(2);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const renderSvg = (svgText: string, scaleFactor: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const w = (img.naturalWidth || 800) * scaleFactor;
        const h = (img.naturalHeight || 600) * scaleFactor;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to render SVG.")); };
      img.src = url;
    });
  };

  const process = async (svgText: string, scaleFactor: number) => {
    setError("");
    setPreview(null);
    if (!svgText.trim()) return;
    try {
      const dataUrl = await renderSvg(svgText, scaleFactor);
      setPreview(dataUrl);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setSvg(text);
      process(text, scale);
    };
    reader.readAsText(file);
  };

  const download = async () => {
    if (!svg) return;
    setDownloading(true);
    try {
      const dataUrl = await renderSvg(svg, scale);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "converted.png";
      a.click();
    } catch (e) {
      setError((e as Error).message);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">SVG to PNG</h1>
        <p className="text-slate-500 text-sm mb-8">Convert SVG files or code to PNG, processed entirely in your browser.</p>

        <div className="space-y-5">
          {/* Upload */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            <p className="text-slate-400 text-sm">Drop an SVG file here or <span className="text-blue-400">browse</span></p>
            <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Paste SVG */}
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Or paste SVG code</label>
            <textarea
              value={svg}
              onChange={e => { setSvg(e.target.value); process(e.target.value, scale); }}
              placeholder="<svg xmlns=…>…</svg>"
              spellCheck={false}
              className="w-full h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
          </div>

          {/* Scale */}
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Output scale</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <button key={s} onClick={() => { setScale(s); process(svg, s); }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${scale === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <ErrorAlert message={error} />

          {/* Preview */}
          {preview && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-3">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="PNG preview" className="max-w-full rounded-lg border border-slate-700" />
            </div>
          )}

          {svg && (
            <button onClick={download} disabled={downloading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              {downloading ? "Rendering…" : "Download PNG"}
            </button>
          )}
        </div>

        <RelatedTools current="/tools/svg-to-png" />
      </div>
    </div>
  );
}
