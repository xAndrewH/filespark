"use client";

import { useState } from "react";
import Link from "next/link";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b].reduce((sum, c, i) => {
    const s = c / 255;
    const lin = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    return sum + lin * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

const SUGGESTED_PAIRS = [
  { label: "White on Black",     fg: "#ffffff", bg: "#000000" },
  { label: "Black on Yellow",    fg: "#000000", bg: "#facc15" },
  { label: "Navy on White",      fg: "#1e3a5f", bg: "#ffffff" },
  { label: "Dark on Light Blue", fg: "#1e293b", bg: "#bae6fd" },
  { label: "White on Navy",      fg: "#ffffff", bg: "#1e3a5f" },
  { label: "Black on White",     fg: "#000000", bg: "#ffffff" },
];

function Badge({ pass, label, requirement }: { pass: boolean; label: string; requirement: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 ${pass ? "bg-green-500/15 border-green-500/30" : "bg-red-500/15 border-red-500/30"}`}>
      <span className={`text-xs font-semibold ${pass ? "text-green-300" : "text-red-300"}`}>{label}</span>
      <span className={`text-xs font-bold ${pass ? "text-green-400" : "text-red-400"}`}>{pass ? "Pass ✓" : "Fail ✗"}</span>
      <span className="text-[10px] text-slate-500">{requirement}</span>
    </div>
  );
}

function ColorInput({
  label, value, inputValue, onChange, onInputChange,
}: {
  label: string; value: string; inputValue: string;
  onChange: (v: string) => void; onInputChange: (v: string) => void;
}) {
  const valid = isValidHex(value);
  const rgb = hexToRgb(value);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">{label}</label>
      <div className="flex items-center gap-3">
        {/* Color swatch — click to open native picker */}
        <div className="relative w-12 h-12 flex-shrink-0 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
          <div className="absolute inset-0" style={{ background: valid ? value : "#888" }} />
          <input
            type="color"
            value={valid ? value : "#888888"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Pick a color"
          />
        </div>
        {/* HEX text input */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="#000000"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500/60 transition-colors uppercase tracking-widest"
            maxLength={7}
            spellCheck={false}
          />
        </div>
        {/* RGB readout */}
        {valid && (
          <span className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:block">
            {rgb.r}, {rgb.g}, {rgb.b}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ColorContrastPage() {
  const [fg, setFgRaw] = useState("#ffffff");
  const [bg, setBgRaw] = useState("#1e293b");
  const [fgInput, setFgInput] = useState("#ffffff");
  const [bgInput, setBgInput] = useState("#1e293b");

  const setFg = (val: string) => { setFgRaw(val); setFgInput(val); };
  const setBg = (val: string) => { setBgRaw(val); setBgInput(val); };

  const handleFgInput = (val: string) => {
    setFgInput(val);
    if (isValidHex(val)) setFgRaw(val.toLowerCase());
  };
  const handleBgInput = (val: string) => {
    setBgInput(val);
    if (isValidHex(val)) setBgRaw(val.toLowerCase());
  };

  const swap = () => { const f = fg, b = bg; setFg(b); setBg(f); };

  const validFg = isValidHex(fg) ? fg : "#ffffff";
  const validBg = isValidHex(bg) ? bg : "#1e293b";
  const ratio   = contrastRatio(validFg, validBg);

  const aaNormal  = ratio >= 4.5;
  const aaLarge   = ratio >= 3;
  const aaaNormal = ratio >= 7;
  const aaaLarge  = ratio >= 4.5;

  const ratioColor = ratio >= 7 ? "text-green-400" : ratio >= 4.5 ? "text-blue-400" : ratio >= 3 ? "text-yellow-400" : "text-red-400";

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

          {/* ── Color pickers ── */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <ColorInput
              label="Foreground"
              value={fg} inputValue={fgInput}
              onChange={setFg} onInputChange={handleFgInput}
            />

            {/* Swap button between the two */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <button
                onClick={swap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                title="Swap foreground and background"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Swap
              </button>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <ColorInput
              label="Background"
              value={bg} inputValue={bgInput}
              onChange={setBg} onInputChange={handleBgInput}
            />
          </div>

          {/* ── Preview ── */}
          <div className="rounded-2xl p-5 space-y-3 border border-slate-700/60" style={{ background: validBg }}>
            <p className="text-base leading-relaxed" style={{ color: validFg }}>
              Normal text (16px) — The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-2xl font-bold" style={{ color: validFg }}>
              Large text (24px bold)
            </p>
            <span
              className="inline-block px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ color: validFg, borderColor: validFg + "80" }}
            >
              UI Component
            </span>
          </div>

          {/* ── Contrast ratio ── */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 text-center">
            <p className="text-slate-500 text-xs mb-2">Contrast Ratio</p>
            <p className={`text-5xl font-black tabular-nums ${ratioColor}`}>
              {ratio.toFixed(2)}<span className="text-2xl text-slate-500">:1</span>
            </p>
            <p className="text-slate-600 text-xs mt-2">
              {ratio >= 7 ? "Excellent — passes all WCAG levels" :
               ratio >= 4.5 ? "Good — passes AA & AAA Large" :
               ratio >= 3 ? "Minimal — passes AA Large only" :
               "Poor — fails all WCAG levels"}
            </p>
          </div>

          {/* ── WCAG results ── */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-3">WCAG Results</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Badge pass={aaNormal}  label="AA Normal"  requirement="≥ 4.5:1" />
              <Badge pass={aaLarge}   label="AA Large"   requirement="≥ 3:1" />
              <Badge pass={aaaNormal} label="AAA Normal" requirement="≥ 7:1" />
              <Badge pass={aaaLarge}  label="AAA Large"  requirement="≥ 4.5:1" />
            </div>
            <p className="text-slate-600 text-[11px] mt-3">Large text: 18pt+ regular or 14pt+ bold. UI Components use AA Large threshold.</p>
          </div>

          {/* ── Suggested pairs ── */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-3">Suggested pairs</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PAIRS.map((pair) => {
                const r = contrastRatio(pair.fg, pair.bg);
                const passes = r >= 4.5;
                return (
                  <button
                    key={pair.label}
                    onClick={() => { setFg(pair.fg); setBg(pair.bg); }}
                    className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 transition-colors px-3 py-2.5 text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold border border-white/10"
                      style={{ background: pair.bg, color: pair.fg }}
                    >
                      Aa
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-300 text-xs font-medium truncate">{pair.label}</p>
                      <p className={`text-[11px] font-mono ${passes ? "text-green-400" : "text-yellow-400"}`}>{r.toFixed(1)}:1</p>
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
