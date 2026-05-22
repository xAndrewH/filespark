"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}

type Harmony = "complementary" | "triadic" | "analogous" | "split-complementary" | "tetradic" | "shades";

function generatePalette(base: string, harmony: Harmony): { hex: string; label: string }[] {
  const [h, s, l] = hexToHsl(base);
  const col = (hue: number, sat = s, lig = l, label = "") => ({
    hex: hslToHex(((hue % 360) + 360) % 360, sat, lig), label,
  });

  if (harmony === "complementary") return [
    col(h, s, l, "Base"), col(h + 180, s, l, "Complement"),
    col(h, s, Math.min(l + 15, 95), "Light"), col(h, s, Math.max(l - 15, 5), "Dark"),
    col(h + 180, s, Math.min(l + 15, 95), "Comp Light"),
  ];
  if (harmony === "triadic") return [
    col(h, s, l, "Base"), col(h + 120, s, l, "Triadic 2"), col(h + 240, s, l, "Triadic 3"),
    col(h, s, Math.min(l + 20, 95), "Light"), col(h, s, Math.max(l - 20, 5), "Dark"),
  ];
  if (harmony === "analogous") return [
    col(h - 40, s, l, "-40°"), col(h - 20, s, l, "-20°"),
    col(h, s, l, "Base"),
    col(h + 20, s, l, "+20°"), col(h + 40, s, l, "+40°"),
  ];
  if (harmony === "split-complementary") return [
    col(h, s, l, "Base"), col(h + 150, s, l, "Split 1"), col(h + 210, s, l, "Split 2"),
    col(h, s, Math.min(l + 20, 95), "Light"), col(h, s, Math.max(l - 20, 5), "Dark"),
  ];
  if (harmony === "tetradic") return [
    col(h, s, l, "Base"), col(h + 90, s, l, "90°"), col(h + 180, s, l, "180°"), col(h + 270, s, l, "270°"),
    col(h, s, Math.min(l + 20, 95), "Light"),
  ];
  // shades
  return [90, 75, 60, 45, 30, 15, 5].map((lig, i) => col(h, s, lig, `${i === 0 ? "50" : i === 1 ? "100" : i === 2 ? "200" : i === 3 ? "400" : i === 4 ? "600" : i === 5 ? "800" : "950"}`));
}

const HARMONIES: { value: Harmony; label: string }[] = [
  { value: "complementary",      label: "Complementary" },
  { value: "triadic",            label: "Triadic" },
  { value: "analogous",          label: "Analogous" },
  { value: "split-complementary",label: "Split Complementary" },
  { value: "tetradic",           label: "Tetradic" },
  { value: "shades",             label: "Shades" },
];

export default function PalettePage() {
  const [base, setBase] = useState("#6366f1");
  const [harmony, setHarmony] = useState<Harmony>("complementary");
  const [copied, setCopied] = useState<string | null>(null);

  const palette = useMemo(() => generatePalette(base, harmony), [base, harmony]);

  const copy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = () => {
    navigator.clipboard.writeText(palette.map(p => p.hex).join(", "));
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Color Palette Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate harmonious color palettes from a base color.</p>

        <div className="space-y-5">
          {/* Base color + harmony */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl border-2 border-white/10 cursor-pointer" style={{ background: base }} />
                <input type="color" value={base} onChange={e => setBase(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
              <div>
                <p className="text-white font-mono text-lg font-bold">{base.toUpperCase()}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {(() => { const { r, g, b } = hexToRgb(base); return `rgb(${r}, ${g}, ${b})`; })()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {HARMONIES.map(h => (
                <button key={h.value} onClick={() => setHarmony(h.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${harmony === h.value ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Palette strip */}
          <div className="h-20 rounded-2xl overflow-hidden flex border border-slate-800">
            {palette.map((p, i) => (
              <div key={i} className="flex-1" style={{ background: p.hex }} />
            ))}
          </div>

          {/* Color cards */}
          <div className="grid grid-cols-1 gap-2">
            {palette.map((p, i) => {
              const { r, g, b } = hexToRgb(p.hex);
              const [ph, ps, pl] = hexToHsl(p.hex);
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl shrink-0 border border-white/10" style={{ background: p.hex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-mono font-bold">{p.hex.toUpperCase()}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{p.label} · rgb({r}, {g}, {b}) · hsl({ph}, {ps}%, {pl}%)</p>
                  </div>
                  <button onClick={() => copy(p.hex)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                    {copied === p.hex ? "Copied!" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={copyAll}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">
            {copied === "all" ? "Copied all!" : "Copy all as comma-separated HEX"}
          </button>
        </div>
      </div>
    </div>
  );
}
