"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";

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

function relativeLuminance(r: number, g: number, b: number) {
  const s = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(l1: number, l2: number) {
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLabel(ratio: number) {
  if (ratio >= 7)   return { label: "AAA",  color: "text-green-400" };
  if (ratio >= 4.5) return { label: "AA",   color: "text-green-400" };
  if (ratio >= 3)   return { label: "AA Large", color: "text-yellow-400" };
  return { label: "Fail", color: "text-red-400" };
}

const PRESETS = [
  "#ef4444","#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#8b5cf6","#ec4899","#ffffff","#64748b","#0f172a",
];

export default function ColorPickerPage() {
  const [color, setColorRaw] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [copied, setCopied]   = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Image pick state
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const setColor = useCallback((c: string) => {
    setColorRaw(c);
    setHexInput(c);
    setHistory((h) => {
      const next = [c, ...h.filter((x) => x !== c)].slice(0, 12);
      return next;
    });
  }, []);

  const rgb  = hexToRgb(color);
  const hsl  = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const lum      = relativeLuminance(rgb.r, rgb.g, rgb.b);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const addToPalette = () => {
    if (!palette.includes(color)) setPalette((p) => [...p, color]);
  };

  const formats = [
    { label: "HEX",  value: color.toUpperCase() },
    { label: "RGB",  value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL",  value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = imgCanvasRef.current;
      if (!canvas) return;
      const maxW = 420, maxH = 260;
      const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImgLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = "";
  };

  const getPixelColor = (e: React.MouseEvent<HTMLCanvasElement>): string | null => {
    const canvas = imgCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width  / rect.width));
    const y = Math.round((e.clientY - rect.top)  * (canvas.height / rect.height));
    const [r, g, b] = canvas.getContext("2d")!.getImageData(x, y, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = getPixelColor(e);
    if (c) setColor(c);
  };

  const onCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setHoverColor(getPixelColor(e));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Color Picker</h1>
        <p className="text-slate-500 text-sm mb-8">Pick a color and get HEX, RGB, HSL, CMYK, and contrast ratios.</p>

        <div className="space-y-4">
          {/* Picker */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-xl border-2 border-white/10 shadow-xl" style={{ background: color }} />
                <input type="color" value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl" />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHexInput(v);
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v.toLowerCase());
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500 uppercase"
                />
                <div className="flex gap-2">
                  <button onClick={addToPalette}
                    className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                    Save to palette
                  </button>
                  <button onClick={() => copy(color.toUpperCase(), "HEX")}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${copied === "HEX" ? "bg-green-600 text-white" : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"}`}>
                    {copied === "HEX" ? "Copied" : "Copy HEX"}
                  </button>
                </div>
              </div>
            </div>

            {/* Preset swatches */}
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((c) => (
                <button key={c} onClick={() => setColor(c)} title={c}
                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${color === c ? "border-white" : "border-slate-700"}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Image picker */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Pick from image</p>
              <div className="flex items-center gap-2">
                {hoverColor && imgLoaded && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <span className="w-4 h-4 rounded border border-white/10" style={{ background: hoverColor }} />
                    {hoverColor.toUpperCase()}
                  </span>
                )}
                <button onClick={() => imgFileRef.current?.click()}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                  {imgLoaded ? "Change image" : "Upload image"}
                </button>
                <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <canvas
              ref={imgCanvasRef}
              className={`block w-full rounded-lg border border-slate-700/60 cursor-crosshair ${imgLoaded ? "" : "hidden"}`}
              onClick={onCanvasClick}
              onMouseMove={onCanvasMove}
              onMouseLeave={() => setHoverColor(null)}
            />
            {!imgLoaded && (
              <button onClick={() => imgFileRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs hover:border-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Click to upload an image, then click any pixel to pick its color
              </button>
            )}
          </div>

          {/* Format values */}
          <div className="space-y-2">
            {formats.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-slate-500 text-xs font-mono w-12">{label}</span>
                <code className="flex-1 text-white text-sm font-mono">{value}</code>
                <button onClick={() => copy(value, label)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors shrink-0 ${copied === label ? "bg-green-600 text-white" : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"}`}>
                  {copied === label ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Contrast ratios */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Contrast ratios (WCAG)</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { bg: "#ffffff", label: "vs White", lum2: 1 },
                { bg: "#000000", label: "vs Black", lum2: 0 },
              ].map(({ bg, label, lum2 }) => {
                const ratio = contrastRatio(lum, lum2);
                const wcag  = wcagLabel(ratio);
                return (
                  <div key={label} className="rounded-xl overflow-hidden border border-slate-700">
                    <div className="h-10 flex items-center justify-center text-xs font-mono font-bold"
                      style={{ background: bg, color: color }}>
                      Aa
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xs font-mono">{ratio.toFixed(1)}:1</span>
                        <span className={`text-[10px] font-bold ${wcag.color}`}>{wcag.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent history */}
          {history.length > 1 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-medium mb-2">Recent colors</p>
              <div className="flex flex-wrap gap-2">
                {history.slice(1).map((c) => (
                  <button key={c} onClick={() => setColor(c)} title={c}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${color === c ? "border-white" : "border-transparent hover:border-slate-500"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          )}

          {/* Saved palette */}
          {palette.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-medium">Saved palette</p>
                <button onClick={() => setPalette([])} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button key={c} onClick={() => setColor(c)} title={c}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${c === color ? "border-white" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
              <button onClick={() => copy(palette.join(", "), "palette")}
                className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {copied === "palette" ? "Copied all HEX values" : "Copy all as CSV"}
              </button>
            </div>
          )}
        </div>

        <RelatedTools current="/tools/color-picker" />
      </div>
    </div>
  );
}
