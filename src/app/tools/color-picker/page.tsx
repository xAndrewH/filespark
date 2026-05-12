"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rp = r / 255, gp = g / 255, bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rp - k) / (1 - k)) * 100),
    m: Math.round(((1 - gp - k) / (1 - k)) * 100),
    y: Math.round(((1 - bp - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export default function ColorPickerPage() {
  const [color, setColor] = useState("#3b82f6");
  const [copied, setCopied] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const addToPalette = () => {
    if (!palette.includes(color)) setPalette(p => [...p, color]);
  };

  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Color Picker</h1>
        <p className="text-slate-500 text-sm mb-8">Pick a color and get HEX, RGB, HSL, and CMYK values.</p>

        <div className="space-y-5">
          {/* Picker */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl border-2 border-white/10 shadow-xl" style={{ background: color }} />
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={color}
                onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <button onClick={addToPalette}
                className="mt-2 w-full py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                Save to palette
              </button>
            </div>
          </div>

          {/* Format values */}
          <div className="space-y-2">
            {formats.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-slate-500 text-xs font-mono w-12">{label}</span>
                <code className="flex-1 text-white text-sm font-mono">{value}</code>
                <button onClick={() => copy(value, label)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                  {copied === label ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Palette */}
          {palette.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-medium">Saved palette</p>
                <button onClick={() => setPalette([])} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {palette.map(c => (
                  <button key={c} onClick={() => setColor(c)} title={c}
                    className="w-10 h-10 rounded-lg border-2 transition-colors hover:scale-110"
                    style={{ background: c, borderColor: c === color ? "white" : "transparent" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
