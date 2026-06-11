"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { RelatedTools } from "@/components/RelatedTools";

interface Shadow {
  x: number; y: number; blur: number; spread: number;
  color: string; opacity: number; inset: boolean;
}

const DEFAULT: Shadow = { x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 25, inset: false };

function shadowToCss(s: Shadow): string {
  const hex = s.color.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = (s.opacity / 100).toFixed(2);
  const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${rgba}`;
}

const SLIDERS: { key: keyof Shadow; label: string; min: number; max: number }[] = [
  { key: "x",       label: "Horizontal",  min: -100, max: 100 },
  { key: "y",       label: "Vertical",    min: -100, max: 100 },
  { key: "blur",    label: "Blur",        min: 0,    max: 100 },
  { key: "spread",  label: "Spread",      min: -50,  max: 50  },
  { key: "opacity", label: "Opacity",     min: 0,    max: 100 },
];

export default function BoxShadowPage() {
  const [shadows, setShadows] = useState<Shadow[]>([{ ...DEFAULT }]);
  const [active, setActive] = useState(0);
  const [bgColor, setBgColor] = useState("#1e293b");
  const [boxColor, setBoxColor] = useState("#ffffff");

  const css = `box-shadow: ${shadows.map(shadowToCss).join(",\n             ")};`;

  const update = useCallback((key: keyof Shadow, val: number | boolean | string) => {
    setShadows(prev => prev.map((s, i) => i === active ? { ...s, [key]: val } : s));
  }, [active]);

  const addLayer = () => {
    setShadows(s => [...s, { ...DEFAULT }]);
    setActive(shadows.length);
  };

  const removeLayer = (i: number) => {
    if (shadows.length === 1) return;
    setShadows(s => s.filter((_, idx) => idx !== i));
    setActive(Math.max(0, active - 1));
  };

  const s = shadows[active];

  const PRESETS: { label: string; shadows: Shadow[] }[] = [
    { label: "Soft",      shadows: [{ x: 0, y: 4,  blur: 16, spread: 0,   color: "#000000", opacity: 12, inset: false }] },
    { label: "Medium",    shadows: [{ x: 0, y: 8,  blur: 24, spread: 0,   color: "#000000", opacity: 25, inset: false }] },
    { label: "Hard",      shadows: [{ x: 4, y: 4,  blur: 0,  spread: 0,   color: "#000000", opacity: 40, inset: false }] },
    { label: "Elevated",  shadows: [{ x: 0, y: 2,  blur: 4,  spread: 0,   color: "#000000", opacity: 10, inset: false }, { x: 0, y: 20, blur: 40, spread: 0, color: "#000000", opacity: 20, inset: false }] },
    { label: "Inset",     shadows: [{ x: 0, y: 2,  blur: 8,  spread: -2,  color: "#000000", opacity: 30, inset: true  }] },
    { label: "Neon Blue", shadows: [{ x: 0, y: 0,  blur: 20, spread: 4,   color: "#3b82f6", opacity: 80, inset: false }] },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Box Shadow Builder</h1>
        <p className="text-slate-500 text-sm mb-8">Build CSS box shadows visually with multiple layers.</p>

        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-2xl border border-slate-800 h-52 flex items-center justify-center transition-all"
            style={{ background: bgColor }}>
            <div className="w-36 h-36 rounded-2xl transition-all duration-200"
              style={{ background: boxColor, boxShadow: shadows.map(shadowToCss).join(", ") }} />
          </div>

          {/* CSS output */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
            <code className="flex-1 text-blue-300 text-xs font-mono break-all whitespace-pre">{css}</code>
            <CopyButton text={css} label="Copy CSS" className="shrink-0" />
          </div>

          {/* Background / box colors */}
          <div className="flex gap-4">
            {[["Background", bgColor, setBgColor], ["Box color", boxColor, setBoxColor]].map(([label, val, set]) => (
              <div key={label as string} className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2">
                <span className="text-slate-400 text-sm">{label as string}</span>
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg border border-white/10 cursor-pointer" style={{ background: val as string }} />
                  <input type="color" value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Layers */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">Layers</p>
              <button onClick={addLayer} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">+ Add layer</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {shadows.map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button onClick={() => setActive(i)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${active === i ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    Layer {i + 1}
                  </button>
                  {shadows.length > 1 && (
                    <button onClick={() => removeLayer(i)} className="text-slate-600 hover:text-red-400 transition-colors text-sm px-1">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            {SLIDERS.map(({ key, label, min, max }) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-blue-400 font-mono text-sm">{s[key] as number}{key === "opacity" ? "%" : "px"}</span>
                </div>
                <input type="range" min={min} max={max} value={s[key] as number}
                  onChange={e => update(key, +e.target.value)} className="w-full" />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Color</span>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg border border-white/10" style={{ background: s.color }} />
                  <input type="color" value={s.color} onChange={e => update("color", e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={s.inset} onChange={e => update("inset", e.target.checked)} className="accent-blue-500" />
                <span className="text-slate-400 text-sm">Inset</span>
              </label>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setShadows(p.shadows); setActive(0); }}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white"
                    style={{ boxShadow: p.shadows.map(shadowToCss).join(", ") }} />
                  <span className="text-slate-400 text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <RelatedTools current="/tools/box-shadow" />
      </div>
    </div>
  );
}
