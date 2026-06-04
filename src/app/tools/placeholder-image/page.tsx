"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

const PRESETS = [
  { label: "16:9 HD",     width: 1280, height: 720 },
  { label: "1:1",         width: 800,  height: 800 },
  { label: "4:3",         width: 800,  height: 600 },
  { label: "OG Image",    width: 1200, height: 630 },
  { label: "Twitter Card",width: 1200, height: 600 },
  { label: "Thumbnail",   width: 640,  height: 360 },
  { label: "Avatar",      width: 200,  height: 200 },
  { label: "Banner",      width: 1500, height: 500 },
];

const BG_PRESETS = [
  "#334155", "#1e3a5f", "#3b1a5f", "#1a3a2a", "#3a2010",
  "#475569", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#ffffff", "#000000", "#94a3b8",
];

export default function PlaceholderImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState("#334155");
  const [textColor, setTextColor] = useState("#94a3b8");
  const [customText, setCustomText] = useState("");
  const [showDimensions, setShowDimensions] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState(90);
  const [fontStyle, setFontStyle] = useState<"normal" | "bold">("bold");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const PREVIEW_MAX = 480;
    const scale = Math.min(PREVIEW_MAX / width, PREVIEW_MAX / height, 1);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid pattern
    ctx.strokeStyle = textColor + "18";
    ctx.lineWidth = 1;
    const step = Math.max(20, Math.round(Math.min(width, height) / 12)) * scale;
    for (let x = 0; x <= canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Diagonal lines
    ctx.strokeStyle = textColor + "12";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(canvas.width, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width, 0); ctx.lineTo(0, canvas.height); ctx.stroke();

    const label = customText || (showDimensions ? `${width} × ${height}` : "");
    if (label) {
      const fontSize = Math.max(12, Math.min(canvas.width / 10, canvas.height / 6, 40));
      ctx.font = `${fontStyle} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, canvas.width / 2, canvas.height / 2);
    }
  }, [width, height, bgColor, textColor, customText, showDimensions, fontStyle]);

  useEffect(() => { draw(); }, [draw]);

  const download = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = textColor + "18";
    ctx.lineWidth = 1;
    const step = Math.max(20, Math.round(Math.min(width, height) / 12));
    for (let x = 0; x <= width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y <= height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    ctx.strokeStyle = textColor + "12";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(width, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width, 0); ctx.lineTo(0, height); ctx.stroke();

    const label = customText || (showDimensions ? `${width} × ${height}` : "");
    if (label) {
      const fontSize = Math.max(12, Math.min(width / 10, height / 6, 80));
      ctx.font = `${fontStyle} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, width / 2, height / 2);
    }

    const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const q = format === "png" ? undefined : quality / 100;
    const dataUrl = canvas.toDataURL(mimeType, q);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `placeholder-${width}x${height}.${format}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Placeholder Image Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate placeholder images at any size with custom colors and text.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            {/* Presets */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-medium text-slate-300">Quick Sizes</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setWidth(p.width); setHeight(p.height); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${width === p.width && height === p.height ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-700"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-medium text-slate-300">Dimensions</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Width (px)</label>
                  <input type="number" min={1} max={4096} value={width} onChange={e => setWidth(Math.max(1, Math.min(4096, Number(e.target.value))))} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Height (px)</label>
                  <input type="number" min={1} max={4096} value={height} onChange={e => setHeight(Math.max(1, Math.min(4096, Number(e.target.value))))} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-medium text-slate-300">Colors</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Background</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Text</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BG_PRESETS.map(c => (
                  <button key={c} onClick={() => setBgColor(c)} title={c}
                    className={`w-6 h-6 rounded border transition-all ${bgColor === c ? "border-white scale-110" : "border-slate-700"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Text & Format */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-medium text-slate-300">Text & Export</p>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Custom label (leave blank for dimensions)</label>
                <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder={`${width} × ${height}`} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
              </div>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showDimensions} onChange={e => setShowDimensions(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-xs text-slate-400">Show dimensions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fontStyle === "bold"} onChange={e => setFontStyle(e.target.checked ? "bold" : "normal")} className="w-4 h-4 rounded" />
                  <span className="text-xs text-slate-400">Bold text</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Format</label>
                  <select value={format} onChange={e => setFormat(e.target.value as "png" | "jpeg" | "webp")} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors">
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                {format !== "png" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500">Quality: {quality}%</label>
                    <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-medium text-slate-300">Preview</p>
              <div className="flex items-center justify-center bg-slate-800/40 rounded-xl p-4 min-h-[200px]">
                <canvas ref={canvasRef} className="max-w-full rounded shadow-lg" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{width} × {height} px</span>
                <span>{format.toUpperCase()}{format !== "png" ? ` · ${quality}%` : ""}</span>
              </div>
            </div>
            <button onClick={download} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors">
              Download {width}×{height}.{format}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
