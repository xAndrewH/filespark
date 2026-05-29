"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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

function colorDist(a: string, b: string): number {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return Math.sqrt((ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2);
}

function extractPaletteFromCanvas(canvas: HTMLCanvasElement, count: number): string[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  // Quantize to 5 bits per channel (32 values per channel)
  const buckets = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent pixels
    const r = data[i] >> 3;
    const g = data[i + 1] >> 3;
    const b = data[i + 2] >> 3;
    const key = (r << 10) | (g << 5) | b;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Sort by frequency
  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);

  // Convert back to hex and filter similar colors
  const result: string[] = [];
  for (const [key] of sorted) {
    const r = ((key >> 10) & 0x1F) << 3;
    const g = ((key >>  5) & 0x1F) << 3;
    const b = (key         & 0x1F) << 3;
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    // Ensure minimum distance from already selected colors
    if (result.every(existing => colorDist(existing, hex) > 40)) {
      result.push(hex);
      if (result.length >= count) break;
    }
  }
  return result;
}

type Harmony = "complementary" | "triadic" | "analogous" | "split-complementary" | "tetradic" | "shades";
type Source = "color" | "image";

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
  const [source, setSource] = useState<Source>("color");
  const [imgPalette, setImgPalette] = useState<string[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgCount, setImgCount] = useState(6);
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const palette = useMemo(() => generatePalette(base, harmony), [base, harmony]);

  const copy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = (colors: string[]) => {
    navigator.clipboard.writeText(colors.join(", "));
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = imgCanvasRef.current;
      if (!canvas) return;
      const maxW = 600, maxH = 400;
      const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImgLoaded(true);
      setImgPalette(extractPaletteFromCanvas(canvas, imgCount));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = "";
  };

  const reExtract = (n: number) => {
    setImgCount(n);
    if (imgCanvasRef.current && imgLoaded) {
      setImgPalette(extractPaletteFromCanvas(imgCanvasRef.current, n));
    }
  };

  const displayPalette = source === "image"
    ? imgPalette.map((hex, i) => ({ hex, label: `Color ${i + 1}` }))
    : palette;
  const displayColors = displayPalette.map(p => p.hex);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Color Palette Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate harmonious color palettes from a base color or extract from an image.</p>

        <div className="space-y-5">
          {/* Source toggle */}
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
            {([["color", "Color picker"], ["image", "From image"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => setSource(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${source === v ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>

          {source === "color" ? (
            /* Color picker + harmony */
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
          ) : (
            /* Image upload */
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-white text-sm font-medium">Upload an image to extract colors</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Colors:</span>
                  {[4, 5, 6, 8, 10].map(n => (
                    <button key={n} onClick={() => reExtract(n)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${imgCount === n ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => imgFileRef.current?.click()}
                    className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-lg transition-colors">
                    {imgLoaded ? "Change" : "Upload"}
                  </button>
                  <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
              {imgLoaded ? (
                <canvas ref={imgCanvasRef} className="block w-full rounded-lg border border-slate-700/60" />
              ) : (
                <button onClick={() => imgFileRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs hover:border-slate-600 hover:text-slate-400 transition-colors flex flex-col items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  Click to upload an image
                </button>
              )}
              {!imgLoaded && <canvas ref={imgCanvasRef} className="hidden" />}
            </div>
          )}

          {(source === "color" || (source === "image" && imgPalette.length > 0)) && (
            <>
              {/* Palette strip */}
              <div className="h-20 rounded-2xl overflow-hidden flex border border-slate-800">
                {displayPalette.map((p, i) => (
                  <div key={i} className="flex-1" style={{ background: p.hex }} />
                ))}
              </div>

              {/* Color cards */}
              <div className="grid grid-cols-1 gap-2">
                {displayPalette.map((p, i) => {
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

              <button onClick={() => copyAll(displayColors)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">
                {copied === "all" ? "Copied all!" : "Copy all as comma-separated HEX"}
              </button>
            </>
          )}

          {source === "image" && !imgLoaded && (
            <p className="text-slate-600 text-sm text-center">Upload an image above to extract its dominant colors.</p>
          )}
        </div>
      </div>
    </div>
  );
}
