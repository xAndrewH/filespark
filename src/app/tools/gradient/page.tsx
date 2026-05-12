"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Stop { color: string; position: number }

export default function GradientPage() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#6366f1", position: 0 },
    { color: "#ec4899", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const stopsStr = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`)
    .join(", ");

  const css = type === "linear"
    ? `linear-gradient(${angle}deg, ${stopsStr})`
    : `radial-gradient(circle, ${stopsStr})`;

  const full = `background: ${css};`;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [full]);

  const updateStop = (i: number, key: keyof Stop, val: string | number) => {
    setStops(s => s.map((stop, idx) => idx === i ? { ...stop, [key]: val } : stop));
  };

  const addStop = () => {
    const mid = Math.round((stops[0].position + stops[stops.length - 1].position) / 2);
    setStops(s => [...s, { color: "#ffffff", position: mid }].sort((a, b) => a.position - b.position));
  };

  const removeStop = (i: number) => {
    if (stops.length <= 2) return;
    setStops(s => s.filter((_, idx) => idx !== i));
  };

  const PRESETS = [
    { label: "Indigo → Pink", stops: [{ color: "#6366f1", position: 0 }, { color: "#ec4899", position: 100 }] },
    { label: "Sunset", stops: [{ color: "#f97316", position: 0 }, { color: "#ef4444", position: 50 }, { color: "#7c3aed", position: 100 }] },
    { label: "Ocean", stops: [{ color: "#06b6d4", position: 0 }, { color: "#3b82f6", position: 100 }] },
    { label: "Forest", stops: [{ color: "#4ade80", position: 0 }, { color: "#059669", position: 100 }] },
    { label: "Gold", stops: [{ color: "#fbbf24", position: 0 }, { color: "#f59e0b", position: 100 }] },
    { label: "Midnight", stops: [{ color: "#1e1b4b", position: 0 }, { color: "#312e81", position: 50 }, { color: "#0f172a", position: 100 }] },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">CSS Gradient Builder</h1>
        <p className="text-slate-500 text-sm mb-8">Build linear and radial gradients visually and copy the CSS.</p>

        <div className="space-y-5">
          {/* Preview */}
          <div className="h-40 rounded-2xl border border-slate-800 shadow-xl transition-all duration-300"
            style={{ background: css }} />

          {/* CSS output */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
            <code className="flex-1 text-blue-300 text-sm font-mono break-all">{full}</code>
            <button onClick={copy}
              className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Type + angle */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-medium w-16">Type</span>
              <div className="flex gap-2">
                {(["linear", "radial"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${type === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {type === "linear" && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm font-medium">Angle</span>
                  <span className="text-blue-400 font-mono text-sm">{angle}°</span>
                </div>
                <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(+e.target.value)} className="w-full" />
              </div>
            )}
          </div>

          {/* Color stops */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">Color stops</p>
              <button onClick={addStop}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                + Add stop
              </button>
            </div>
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg border border-white/10" style={{ background: stop.color }} />
                  <input type="color" value={stop.color} onChange={e => updateStop(i, "color", e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
                <code className="text-slate-400 text-xs font-mono w-20">{stop.color}</code>
                <div className="flex-1 flex items-center gap-2">
                  <input type="range" min={0} max={100} value={stop.position}
                    onChange={e => updateStop(i, "position", +e.target.value)} className="flex-1" />
                  <span className="text-slate-400 text-xs font-mono w-10 text-right">{stop.position}%</span>
                </div>
                <button onClick={() => removeStop(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                  disabled={stops.length <= 2}>
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(p => {
                const previewCss = `linear-gradient(135deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(", ")})`;
                return (
                  <button key={p.label} onClick={() => setStops(p.stops)}
                    className="group rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors">
                    <div className="h-10" style={{ background: previewCss }} />
                    <div className="px-2 py-1.5 bg-slate-800/60">
                      <p className="text-slate-400 text-xs group-hover:text-white transition-colors">{p.label}</p>
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
