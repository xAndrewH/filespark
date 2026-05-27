"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

function simplifyRatio(w: number, h: number) {
  const d = gcd(Math.round(w), Math.round(h));
  return { rw: Math.round(w) / d, rh: Math.round(h) / d };
}

const PRESETS = [
  { label: "16:9",   rw: 16,  rh: 9   },
  { label: "4:3",    rw: 4,   rh: 3   },
  { label: "1:1",    rw: 1,   rh: 1   },
  { label: "3:2",    rw: 3,   rh: 2   },
  { label: "21:9",   rw: 21,  rh: 9   },
  { label: "9:16",   rw: 9,   rh: 16  },
  { label: "2:3",    rw: 2,   rh: 3   },
  { label: "5:4",    rw: 5,   rh: 4   },
];

export default function AspectRatioPage() {
  const [rw, setRw] = useState(16);
  const [rh, setRh] = useState(9);
  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("1080");
  const [locked, setLocked] = useState<"w" | "h">("h");

  const applyRatio = useCallback((newRw: number, newRh: number) => {
    setRw(newRw); setRh(newRh);
    if (locked === "h" && width) {
      const h = Math.round((parseFloat(width) / newRw) * newRh);
      setHeight(String(h));
    } else if (locked === "w" && height) {
      const w = Math.round((parseFloat(height) / newRh) * newRw);
      setWidth(String(w));
    }
  }, [locked, width, height]);

  const handleWidth = (val: string) => {
    setWidth(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0 && rh > 0) {
      setHeight(String(Math.round((n / rw) * rh)));
      setLocked("h");
    }
  };

  const handleHeight = (val: string) => {
    setHeight(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0 && rw > 0) {
      setWidth(String(Math.round((n / rh) * rw)));
      setLocked("w");
    }
  };

  const handleRw = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) applyRatio(n, rh);
    setRw(isNaN(parseFloat(val)) ? 0 : parseFloat(val));
  };

  const handleRh = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) applyRatio(rw, n);
    setRh(isNaN(parseFloat(val)) ? 0 : parseFloat(val));
  };

  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const simplified = rw && rh ? simplifyRatio(rw, rh) : null;
  const diagonal = w && h ? Math.sqrt(w * w + h * h).toFixed(1) : null;

  const previewW = 280;
  const previewH = rw > 0 && rh > 0 ? Math.round((previewW / rw) * rh) : 157;
  const clampedH = Math.min(previewH, 200);
  const clampedW = rh > 0 && rw > 0 ? Math.round((clampedH / rh) * rw) : previewW;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Aspect Ratio Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">Calculate dimensions while maintaining a given aspect ratio.</p>

        <div className="space-y-5">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyRatio(p.rw, p.rh)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${rw === p.rw && rh === p.rh ? "bg-blue-600 text-white" : "bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl h-52 flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border-2 border-blue-500/40 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{ width: clampedW, height: clampedH }}>
              <span className="text-blue-300 text-sm font-mono">{rw}:{rh}</span>
            </div>
          </div>

          {/* Ratio inputs */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Ratio</p>
            <div className="flex items-center gap-3">
              <input type="number" value={rw} onChange={e => handleRw(e.target.value)} min={0.1} step={0.1}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono text-center focus:outline-none focus:border-blue-500" />
              <span className="text-slate-400 text-xl font-bold">:</span>
              <input type="number" value={rh} onChange={e => handleRh(e.target.value)} min={0.1} step={0.1}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono text-center focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Dimension inputs */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Dimensions (px)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Width</label>
                <input type="number" value={width} onChange={e => handleWidth(e.target.value)} min={1}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Height</label>
                <input type="number" value={height} onChange={e => handleHeight(e.target.value)} min={1}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Stats */}
          {w > 0 && h > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Simplified", value: simplified && (simplified.rw !== rw || simplified.rh !== rh) ? `${simplified.rw}:${simplified.rh}` : `${rw}:${rh}` },
                { label: "Diagonal", value: diagonal ? `${diagonal} px` : "—" },
                { label: "Megapixels", value: w && h ? `${(w * h / 1000000).toFixed(2)} MP` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-white font-mono text-sm font-bold">{value}</p>
                  <p className="text-slate-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
