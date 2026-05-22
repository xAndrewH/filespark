"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

export default function GlassmorphismPage() {
  const [blur, setBlur] = useState(12);
  const [opacity, setOpacity] = useState(15);
  const [saturation, setSaturation] = useState(100);
  const [borderOpacity, setBorderOpacity] = useState(20);
  const [borderRadius, setBorderRadius] = useState(16);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bg, setBg] = useState("gradient");
  const [copied, setCopied] = useState(false);

  const hex = bgColor.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const bgRgba = `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
  const borderRgba = `rgba(${r}, ${g}, ${b}, ${(borderOpacity / 100).toFixed(2)})`;

  const css = `background: ${bgRgba};
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: 1px solid ${borderRgba};
border-radius: ${borderRadius}px;`;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [css]);

  const BACKGROUNDS: Record<string, string> = {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    sunset:   "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    ocean:    "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    forest:   "linear-gradient(135deg, #4ade80 0%, #059669 100%)",
    dark:     "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Glassmorphism Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Build glass-effect UI cards and copy the CSS instantly.</p>

        <div className="space-y-5">
          {/* Preview */}
          <div className="h-64 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-800"
            style={{ background: BACKGROUNDS[bg] }}>
            <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-30">
              {[40, 80, 120].map(s => (
                <div key={s} className="rounded-full" style={{ width: s, height: s, background: "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
            <div className="relative px-8 py-6 text-center"
              style={{
                background: bgRgba,
                backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                border: `1px solid ${borderRgba}`,
                borderRadius: borderRadius,
              }}>
              <p className="text-white font-semibold text-lg">Glass Card</p>
              <p className="text-white/70 text-sm mt-1">Your content here</p>
            </div>
          </div>

          {/* Background picker */}
          <div className="flex gap-2 flex-wrap">
            {Object.keys(BACKGROUNDS).map(k => (
              <button key={k} onClick={() => setBg(k)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${bg === k ? "bg-blue-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"}`}>
                {k}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            {[
              { label: "Blur", value: blur, set: setBlur, min: 0, max: 40, unit: "px" },
              { label: "Background opacity", value: opacity, set: setOpacity, min: 0, max: 80, unit: "%" },
              { label: "Saturation", value: saturation, set: setSaturation, min: 0, max: 200, unit: "%" },
              { label: "Border opacity", value: borderOpacity, set: setBorderOpacity, min: 0, max: 100, unit: "%" },
              { label: "Border radius", value: borderRadius, set: setBorderRadius, min: 0, max: 48, unit: "px" },
            ].map(({ label, value, set, min, max, unit }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-blue-400 font-mono text-sm">{value}{unit}</span>
                </div>
                <input type="range" min={min} max={max} value={value}
                  onChange={e => set(+e.target.value)} className="w-full accent-blue-500" />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">Glass color</span>
              <div className="relative">
                <div className="w-8 h-8 rounded-lg border border-white/10" style={{ background: bgColor }} />
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
              <code className="text-slate-500 text-xs font-mono">{bgColor.toUpperCase()}</code>
            </div>
          </div>

          {/* CSS */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">CSS</p>
              <button onClick={copy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-blue-300 text-xs font-mono whitespace-pre-wrap">{css}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
