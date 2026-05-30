"use client";

import { useState } from "react";
import Link from "next/link";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const SUGGESTED_PAIRS = [
  { label: "White on Black", fg: "#ffffff", bg: "#000000" },
  { label: "Black on Yellow", fg: "#000000", bg: "#facc15" },
  { label: "Navy on White", fg: "#1e3a5f", bg: "#ffffff" },
  { label: "Dark on Light Blue", fg: "#1e293b", bg: "#bae6fd" },
  { label: "White on Navy", fg: "#ffffff", bg: "#1e3a5f" },
  { label: "Black on White", fg: "#000000", bg: "#ffffff" },
];

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function Badge({ pass, label, requirement }: { pass: boolean; label: string; requirement: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 ${pass ? "bg-green-500/20 border-green-500/40" : "bg-red-500/20 border-red-500/40"}`}>
      <span className={`text-xs font-semibold ${pass ? "text-green-300" : "text-red-300"}`}>
        {label}
      </span>
      <span className={`text-[11px] font-bold ${pass ? "text-green-400" : "text-red-400"}`}>
        {pass ? "Pass" : "Fail"}
      </span>
      <span className="text-[10px] text-slate-500">{requirement}</span>
    </div>
  );
}

export default function ColorContrastPage() {
  const [fg, setFgRaw] = useState("#ffffff");
  const [bg, setBgRaw] = useState("#1e293b");
  const [fgInput, setFgInput] = useState("#ffffff");
  const [bgInput, setBgInput] = useState("#1e293b");

  const setFg = (val: string) => {
    setFgRaw(val);
    setFgInput(val);
  };

  const setBg = (val: string) => {
    setBgRaw(val);
    setBgInput(val);
  };

  const swap = () => {
    const oldFg = fg;
    const oldBg = bg;
    setFg(oldBg);
    setBg(oldFg);
  };

  const ratio = isValidHex(fg) && isValidHex(bg) ? contrastRatio(fg, bg) : 1;

  const aaLarge = ratio >= 3;
  const aaNormal = ratio >= 4.5;
  const aaaLarge = ratio >= 4.5;
  const aaaNormal = ratio >= 7;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Color Contrast Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Check foreground/background color pairs against WCAG accessibility standards.</p>

        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium text-slate-400">Foreground</label>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="absolute inset-0" style={{ background: isValidHex(fg) ? fg : "#ffffff" }} />
                    <input
                      type="color"
                      value={isValidHex(fg) ? fg : "#ffffff"}
                      onChange={(e) => setFg(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={fgInput}
                    onChange={(e) => {
                      setFgInput(e.target.value);
                      if (isValidHex(e.target.value)) setFgRaw(e.target.value.toLowerCase());
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500 uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              <button
                onClick={swap}
                className="flex-shrink-0 mb-0.5 w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Swap colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>

              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium text-slate-400">Background</label>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="absolute inset-0" style={{ background: isValidHex(bg) ? bg : "#1e293b" }} />
                    <input
                      type="color"
                      value={isValidHex(bg) ? bg : "#1e293b"}
                      onChange={(e) => setBg(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={bgInput}
                    onChange={(e) => {
                      setBgInput(e.target.value);
                      if (isValidHex(e.target.value)) setBgRaw(e.target.value.toLowerCase());
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500 uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3" style={{ background: isValidHex(bg) ? bg : "#1e293b" }}>
            <p className="text-base" style={{ color: isValidHex(fg) ? fg : "#ffffff" }}>
              Normal text (16px) — The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-2xl font-bold" style={{ color: isValidHex(fg) ? fg : "#ffffff" }}>
              Large text (24px bold)
            </p>
            <span
              className="inline-block px-4 py-2 rounded-lg text-sm font-medium border"
              style={{
                color: isValidHex(fg) ? fg : "#ffffff",
                borderColor: isValidHex(fg) ? fg : "#ffffff",
              }}
            >
              UI Component
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 text-center">
            <p className="text-slate-500 text-xs mb-1">Contrast Ratio</p>
            <p className="text-5xl font-bold text-white tabular-nums">{ratio.toFixed(2)}<span className="text-2xl text-slate-400">:1</span></p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-3">WCAG Results</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Badge pass={aaNormal} label="AA Normal" requirement="≥ 4.5:1" />
              <Badge pass={aaLarge} label="AA Large" requirement="≥ 3:1" />
              <Badge pass={aaaNormal} label="AAA Normal" requirement="≥ 7:1" />
              <Badge pass={aaaLarge} label="AAA Large" requirement="≥ 4.5:1" />
            </div>
            <p className="text-slate-600 text-[11px] mt-3">Large text: 18pt+ regular or 14pt+ bold. UI Components use AA Large threshold.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-3">Suggested pairs</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PAIRS.map((pair) => {
                const r = contrastRatio(pair.fg, pair.bg);
                return (
                  <button
                    key={pair.label}
                    onClick={() => { setFg(pair.fg); setBg(pair.bg); }}
                    className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 transition-colors px-3 py-2 text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold border border-white/10"
                      style={{ background: pair.bg, color: pair.fg }}
                    >
                      Aa
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-300 text-xs font-medium truncate">{pair.label}</p>
                      <p className="text-slate-500 text-[11px]">{r.toFixed(1)}:1</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
