"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Edits {
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  quality: number;
}

export default function ImageEditorPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [original, setOriginal]       = useState<HTMLImageElement | null>(null);
  const [edits, setEdits]             = useState<Edits>({ width: 0, height: 0, rotation: 0, flipH: false, flipV: false, quality: 92 });
  const [lockAspect, setLockAspect]   = useState(true);
  const [isDragging, setIsDragging]   = useState(false);
  const [outputFmt, setOutputFmt]     = useState<"png" | "jpeg" | "webp">("jpeg");
  const previewRef  = useRef<HTMLCanvasElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal(img);
      setEdits((e) => ({ ...e, width: img.naturalWidth, height: img.naturalHeight, rotation: 0, flipH: false, flipV: false }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  // Render preview on canvas
  useEffect(() => {
    if (!original || !previewRef.current) return;
    const canvas = previewRef.current;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;

    const rad  = (edits.rotation * Math.PI) / 180;
    const absC = Math.abs(Math.cos(rad));
    const absS = Math.abs(Math.sin(rad));
    const outW = Math.round(edits.width * absC + edits.height * absS);
    const outH = Math.round(edits.width * absS + edits.height * absC);

    canvas.width  = outW;
    canvas.height = outH;

    ctx.clearRect(0, 0, outW, outH);
    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.scale(edits.flipH ? -1 : 1, edits.flipV ? -1 : 1);
    ctx.drawImage(original, -edits.width / 2, -edits.height / 2, edits.width, edits.height);
    ctx.restore();
  }, [original, edits]);

  const setWidth = (w: number) => {
    if (!original) return;
    setEdits((e) => ({
      ...e,
      width: w,
      height: lockAspect ? Math.round(w / (original.naturalWidth / original.naturalHeight)) : e.height,
    }));
  };

  const setHeight = (h: number) => {
    if (!original) return;
    setEdits((e) => ({
      ...e,
      height: h,
      width: lockAspect ? Math.round(h * (original.naturalWidth / original.naturalHeight)) : e.width,
    }));
  };

  const rotate90 = (dir: 1 | -1) => setEdits((e) => ({ ...e, rotation: ((e.rotation + dir * 90) + 360) % 360 }));

  const resetEdits = () => {
    if (!original) return;
    setEdits((e) => ({ ...e, width: original.naturalWidth, height: original.naturalHeight, rotation: 0, flipH: false, flipV: false }));
  };

  const download = () => {
    if (!previewRef.current || !file) return;
    const mime = outputFmt === "png" ? "image/png" : outputFmt === "webp" ? "image/webp" : "image/jpeg";
    const quality = outputFmt === "png" ? undefined : edits.quality / 100;
    previewRef.current.toBlob((blob) => {
      if (!blob) return;
      const link  = document.createElement("a");
      const base  = file.name.replace(/\.[^.]+$/, "");
      link.href   = URL.createObjectURL(blob);
      link.download = `${base}_edited.${outputFmt}`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, mime, quality);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) setFile(f);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Image Editor</h1>
          <p className="text-slate-500 text-sm">Resize, rotate, and flip images. All processing happens in your browser.</p>
        </div>

        {!file ? (
          /* Drop zone */
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border border-dashed cursor-pointer transition-all ${
              isDragging ? "border-blue-500/70 bg-blue-500/8 text-blue-400" : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <div className="text-center">
              <p className="font-semibold text-base">Drop an image here</p>
              <p className="text-xs opacity-60 mt-1">or click to browse · JPG, PNG, WEBP, GIF, BMP…</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="space-y-5">
              {/* Resize */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-semibold">Resize</h3>
                  <button
                    onClick={() => setLockAspect((l) => !l)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-colors ${
                      lockAspect ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-500"
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={lockAspect
                        ? "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        : "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      } />
                    </svg>
                    {lockAspect ? "Locked" : "Free"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={edits.width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={edits.height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
                {original && (
                  <p className="text-slate-600 text-xs">Original: {original.naturalWidth}×{original.naturalHeight}px</p>
                )}
              </div>

              {/* Rotate & Flip */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <h3 className="text-white text-sm font-semibold">Rotate &amp; Flip</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => rotate90(-1)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3" />
                    </svg>
                    ↺ 90°
                  </button>
                  <button onClick={() => rotate90(1)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15l6 6m0 0l6-6m-6 6V9a6 6 0 00-12 0v3" />
                    </svg>
                    ↻ 90°
                  </button>
                  <button onClick={() => setEdits((e) => ({ ...e, flipH: !e.flipH }))} className={`py-2 border text-xs rounded-lg transition-colors ${edits.flipH ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}>
                    Flip Horizontal
                  </button>
                  <button onClick={() => setEdits((e) => ({ ...e, flipV: !e.flipV }))} className={`py-2 border text-xs rounded-lg transition-colors ${edits.flipV ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}>
                    Flip Vertical
                  </button>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Custom angle: {edits.rotation}°</label>
                  <input
                    type="range" min={0} max={359} value={edits.rotation}
                    onChange={(e) => setEdits((ed) => ({ ...ed, rotation: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Output */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <h3 className="text-white text-sm font-semibold">Output</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["jpeg", "png", "webp"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFmt(fmt)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors ${
                        outputFmt === fmt ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                {outputFmt !== "png" && (
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Quality: {edits.quality}%</label>
                    <input
                      type="range" min={1} max={100} value={edits.quality}
                      onChange={(e) => setEdits((ed) => ({ ...ed, quality: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={resetEdits} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors">
                  Reset
                </button>
                <button
                  onClick={() => { setFile(null); setOriginal(null); }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
                >
                  New Image
                </button>
              </div>

              <button
                onClick={download}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {outputFmt.toUpperCase()}
              </button>
            </div>

            {/* Canvas preview */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-center min-h-[400px] overflow-auto">
                <canvas
                  ref={previewRef}
                  className="max-w-full max-h-[600px] rounded-lg shadow-xl object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              {original && (
                <p className="text-slate-600 text-xs text-center mt-2">
                  Output: {edits.width}×{edits.height}px
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
