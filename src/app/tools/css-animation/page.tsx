"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Keyframe {
  offset: number; // 0-100 (%)
  properties: { [key: string]: string };
}

const ANIMATABLE_PROPS = [
  "opacity",
  "transform",
  "background-color",
  "color",
  "border-color",
  "border-radius",
  "box-shadow",
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  "margin",
  "padding",
  "font-size",
  "letter-spacing",
  "filter",
];

const EASING_OPTIONS = [
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
  "cubic-bezier(0.25, 0.1, 0.25, 1)",
  "steps(4, end)",
  "steps(6, start)",
];

const PRESETS: { name: string; name_: string; keyframes: Keyframe[]; duration: string; timing: string; iterCount: string }[] = [
  {
    name: "Fade In",
    name_: "fadeIn",
    duration: "0.6s",
    timing: "ease-out",
    iterCount: "1",
    keyframes: [
      { offset: 0, properties: { opacity: "0" } },
      { offset: 100, properties: { opacity: "1" } },
    ],
  },
  {
    name: "Slide Up",
    name_: "slideUp",
    duration: "0.5s",
    timing: "ease-out",
    iterCount: "1",
    keyframes: [
      { offset: 0, properties: { opacity: "0", transform: "translateY(20px)" } },
      { offset: 100, properties: { opacity: "1", transform: "translateY(0)" } },
    ],
  },
  {
    name: "Bounce",
    name_: "bounce",
    duration: "0.8s",
    timing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    iterCount: "infinite",
    keyframes: [
      { offset: 0, properties: { transform: "translateY(0)" } },
      { offset: 50, properties: { transform: "translateY(-20px)" } },
      { offset: 100, properties: { transform: "translateY(0)" } },
    ],
  },
  {
    name: "Pulse",
    name_: "pulse",
    duration: "1.5s",
    timing: "ease-in-out",
    iterCount: "infinite",
    keyframes: [
      { offset: 0, properties: { transform: "scale(1)", opacity: "1" } },
      { offset: 50, properties: { transform: "scale(1.05)", opacity: "0.8" } },
      { offset: 100, properties: { transform: "scale(1)", opacity: "1" } },
    ],
  },
  {
    name: "Shake",
    name_: "shake",
    duration: "0.5s",
    timing: "linear",
    iterCount: "1",
    keyframes: [
      { offset: 0, properties: { transform: "translateX(0)" } },
      { offset: 20, properties: { transform: "translateX(-10px)" } },
      { offset: 40, properties: { transform: "translateX(10px)" } },
      { offset: 60, properties: { transform: "translateX(-10px)" } },
      { offset: 80, properties: { transform: "translateX(10px)" } },
      { offset: 100, properties: { transform: "translateX(0)" } },
    ],
  },
  {
    name: "Spin",
    name_: "spin",
    duration: "1s",
    timing: "linear",
    iterCount: "infinite",
    keyframes: [
      { offset: 0, properties: { transform: "rotate(0deg)" } },
      { offset: 100, properties: { transform: "rotate(360deg)" } },
    ],
  },
];

function generateCss(name: string, keyframes: Keyframe[], duration: string, timing: string, iterCount: string, delay: string, fillMode: string): string {
  const kfBlock = keyframes
    .map(kf => {
      const props = Object.entries(kf.properties)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `    ${k}: ${v};`)
        .join("\n");
      return `  ${kf.offset}% {\n${props}\n  }`;
    })
    .join("\n");

  const animName = name.replace(/\s+/g, "-").toLowerCase() || "my-animation";
  const animValue = [duration, timing, delay, iterCount, fillMode].filter(Boolean).join(" ");

  return `@keyframes ${animName} {\n${kfBlock}\n}\n\n.animated {\n  animation: ${animName} ${animValue};\n}`;
}

export default function CssAnimationPage() {
  const [animName, setAnimName] = useState("my-animation");
  const [duration, setDuration] = useState("1s");
  const [timing, setTiming] = useState("ease");
  const [iterCount, setIterCount] = useState("1");
  const [delay, setDelay] = useState("0s");
  const [fillMode, setFillMode] = useState("none");
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { offset: 0, properties: { opacity: "0", transform: "translateY(20px)" } },
    { offset: 100, properties: { opacity: "1", transform: "translateY(0)" } },
  ]);
  const [newPropKey, setNewPropKey] = useState("opacity");
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const css = generateCss(animName, keyframes, duration, timing, iterCount, delay, fillMode);

  const addKeyframe = () => {
    const offsets = keyframes.map(k => k.offset);
    const mid = Math.round((Math.min(...offsets) + Math.max(...offsets)) / 2);
    const next = mid === Math.max(...offsets) ? Math.min(100, Math.max(...offsets) + 25) : mid;
    setKeyframes(prev => [...prev, { offset: next, properties: {} }].sort((a, b) => a.offset - b.offset));
  };

  const removeKeyframe = (i: number) => {
    if (keyframes.length <= 2) return;
    setKeyframes(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateOffset = (i: number, val: number) => {
    setKeyframes(prev => {
      const next = [...prev];
      next[i] = { ...next[i], offset: Math.max(0, Math.min(100, val)) };
      return next.sort((a, b) => a.offset - b.offset);
    });
  };

  const updateProp = (kfIdx: number, key: string, value: string) => {
    setKeyframes(prev => {
      const next = [...prev];
      next[kfIdx] = { ...next[kfIdx], properties: { ...next[kfIdx].properties, [key]: value } };
      return next;
    });
  };

  const addPropToAll = () => {
    if (!newPropKey) return;
    setKeyframes(prev => prev.map(kf => ({
      ...kf,
      properties: { ...kf.properties, [newPropKey]: kf.properties[newPropKey] ?? "" },
    })));
  };

  const removeProp = useCallback((key: string) => {
    setKeyframes(prev => prev.map(kf => {
      const p = { ...kf.properties };
      delete p[key];
      return { ...kf, properties: p };
    }));
  }, []);

  const loadPreset = (p: typeof PRESETS[0]) => {
    setAnimName(p.name_);
    setDuration(p.duration);
    setTiming(p.timing);
    setIterCount(p.iterCount);
    setKeyframes(p.keyframes);
  };

  const allPropKeys = Array.from(new Set(keyframes.flatMap(kf => Object.keys(kf.properties))));

  const triggerPlay = () => {
    setPlaying(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
    if (iterCount !== "infinite") {
      const ms = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000) + parseFloat(delay || "0") * 1000;
      setTimeout(() => setPlaying(false), ms + 100);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">CSS Animation Builder</h1>
        <p className="text-slate-500 text-sm mb-8">Build keyframe animations visually and export the CSS.</p>

        {/* Presets */}
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => loadPreset(p)} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-slate-300 transition-colors">
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {/* Settings */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-medium text-slate-300">Animation Settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-500">Name</label>
                  <input value={animName} onChange={e => setAnimName(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Duration</label>
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="1s" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Delay</label>
                  <input value={delay} onChange={e => setDelay(e.target.value)} placeholder="0s" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Iterations</label>
                  <input value={iterCount} onChange={e => setIterCount(e.target.value)} placeholder="1" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Fill Mode</label>
                  <select value={fillMode} onChange={e => setFillMode(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors">
                    {["none", "forwards", "backwards", "both"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-slate-500">Timing Function</label>
                  <select value={timing} onChange={e => setTiming(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors">
                    {EASING_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Keyframes */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Keyframes</p>
                <button onClick={addKeyframe} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Add keyframe</button>
              </div>

              {/* Add property row */}
              <div className="flex gap-2 items-center">
                <select value={newPropKey} onChange={e => setNewPropKey(e.target.value)} className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-blue-500/60 transition-colors">
                  {ANIMATABLE_PROPS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={addPropToAll} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition-colors whitespace-nowrap">Add to all</button>
              </div>

              {/* Keyframe table */}
              {allPropKeys.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left text-slate-500 font-normal pb-2 w-16">%</th>
                        {allPropKeys.map(k => (
                          <th key={k} className="text-left text-slate-500 font-normal pb-2 min-w-[100px]">
                            <span className="flex items-center gap-1">
                              {k}
                              <button onClick={() => removeProp(k)} className="text-slate-600 hover:text-red-400 transition-colors">×</button>
                            </span>
                          </th>
                        ))}
                        <th className="w-6" />
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {keyframes.map((kf, i) => (
                        <tr key={i}>
                          <td className="pr-2 pb-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={kf.offset}
                              onChange={e => updateOffset(i, Number(e.target.value))}
                              className="w-14 bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500/60"
                            />
                          </td>
                          {allPropKeys.map(k => (
                            <td key={k} className="pr-2 pb-2">
                              <input
                                value={kf.properties[k] ?? ""}
                                onChange={e => updateProp(i, k, e.target.value)}
                                placeholder="|"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500/60"
                              />
                            </td>
                          ))}
                          <td className="pb-2">
                            <button onClick={() => removeKeyframe(i)} disabled={keyframes.length <= 2} className="text-slate-600 hover:text-red-400 disabled:opacity-30 transition-colors">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {allPropKeys.length === 0 && (
                <p className="text-slate-600 text-xs">Add a property above to get started.</p>
              )}
            </div>
          </div>

          {/* Preview + Output */}
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-medium text-slate-300">Preview</p>
              <div className="h-32 flex items-center justify-center bg-slate-800/40 rounded-xl">
                <style>{playing ? `${css.replace(".animated {", "#preview-box {").replace("}", "}")}` : ""}</style>
                <div
                  id="preview-box"
                  className="w-16 h-16 rounded-xl bg-blue-500"
                />
              </div>
              <button onClick={triggerPlay} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-sm text-slate-200 transition-colors">
                ▶ Play Preview
              </button>
            </div>

            {/* CSS Output */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">CSS Output</p>
                <button onClick={copy} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono bg-slate-800/40 rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                {css}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
