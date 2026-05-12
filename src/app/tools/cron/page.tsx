"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const PRESETS = [
  { label: "Every minute",       value: "* * * * *" },
  { label: "Every 5 minutes",    value: "*/5 * * * *" },
  { label: "Every 15 minutes",   value: "*/15 * * * *" },
  { label: "Every 30 minutes",   value: "*/30 * * * *" },
  { label: "Every hour",         value: "0 * * * *" },
  { label: "Every 6 hours",      value: "0 */6 * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at noon",  value: "0 12 * * *" },
  { label: "Every Monday",       value: "0 0 * * 1" },
  { label: "Every weekday",      value: "0 0 * * 1-5" },
  { label: "Every weekend",      value: "0 0 * * 6,0" },
  { label: "First of month",     value: "0 0 1 * *" },
  { label: "Every month",        value: "0 0 1 * *" },
  { label: "Every year",         value: "0 0 1 1 *" },
];

function parsePart(part: string, min: number, max: number): number[] {
  const nums: number[] = [];
  if (part === "*") {
    for (let i = min; i <= max; i++) nums.push(i);
    return nums;
  }
  for (const seg of part.split(",")) {
    if (seg.startsWith("*/")) {
      const step = parseInt(seg.slice(2));
      for (let i = min; i <= max; i += step) nums.push(i);
    } else if (seg.includes("-")) {
      const [a, b] = seg.split("-").map(Number);
      for (let i = a; i <= b; i++) nums.push(i);
    } else if (seg.includes("/")) {
      const [range, step] = seg.split("/");
      const [a, b] = range.includes("-") ? range.split("-").map(Number) : [min, max];
      for (let i = a; i <= b; i += parseInt(step)) nums.push(i);
    } else {
      nums.push(parseInt(seg));
    }
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}

function getNextRuns(expr: string, count = 5): Date[] {
  try {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return [];
    const [minPart, hourPart, domPart, monPart, dowPart] = parts;
    const minutes = parsePart(minPart, 0, 59);
    const hours = parsePart(hourPart, 0, 23);
    const doms = parsePart(domPart, 1, 31);
    const months = parsePart(monPart, 1, 12);
    const dows = parsePart(dowPart, 0, 6);

    const results: Date[] = [];
    const start = new Date();
    start.setSeconds(0, 0);
    start.setMinutes(start.getMinutes() + 1);

    const cur = new Date(start);
    let iterations = 0;
    while (results.length < count && iterations < 100000) {
      iterations++;
      if (!months.includes(cur.getMonth() + 1)) {
        cur.setMonth(cur.getMonth() + 1, 1);
        cur.setHours(0, 0, 0, 0);
        continue;
      }
      const domMatch = domPart === "*" || doms.includes(cur.getDate());
      const dowMatch = dowPart === "*" || dows.includes(cur.getDay());
      if (!(domMatch && dowMatch)) {
        cur.setDate(cur.getDate() + 1);
        cur.setHours(0, 0, 0, 0);
        continue;
      }
      if (!hours.includes(cur.getHours())) {
        cur.setHours(cur.getHours() + 1, 0, 0, 0);
        continue;
      }
      if (!minutes.includes(cur.getMinutes())) {
        cur.setMinutes(cur.getMinutes() + 1, 0, 0);
        continue;
      }
      results.push(new Date(cur));
      cur.setMinutes(cur.getMinutes() + 1, 0, 0);
    }
    return results;
  } catch {
    return [];
  }
}

function describe(expr: string): string {
  try {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return "Invalid expression";
    const [min, hour, dom, mon, dow] = parts;
    if (expr === "* * * * *") return "Every minute";
    if (min.startsWith("*/") && hour === "*" && dom === "*" && mon === "*" && dow === "*")
      return `Every ${min.slice(2)} minutes`;
    if (min !== "*" && hour.startsWith("*/") && dom === "*" && mon === "*" && dow === "*")
      return `At minute ${min} past every ${hour.slice(2)} hours`;
    if (min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "*")
      return "At the start of every hour";
    if (min === "0" && dom === "*" && mon === "*" && dow === "*")
      return `Every day at ${hour.padStart(2, "0")}:00`;
    if (min === "0" && hour === "0" && dom === "*" && mon === "*")
      return "Every day at midnight";
    return "Custom schedule";
  } catch {
    return "Invalid expression";
  }
}

export default function CronPage() {
  const [expr, setExpr] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);

  const nextRuns = useMemo(() => getNextRuns(expr), [expr]);
  const description = useMemo(() => describe(expr), [expr]);
  const isValid = nextRuns.length > 0;

  const copy = () => {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Cron Expression Builder</h1>
        <p className="text-slate-500 text-sm mb-8">Build, validate, and preview cron schedule expressions.</p>

        <div className="space-y-5">
          {/* Input */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <input
                value={expr}
                onChange={e => setExpr(e.target.value)}
                spellCheck={false}
                className={`flex-1 bg-slate-800 border rounded-lg px-4 py-2.5 text-white font-mono text-lg focus:outline-none transition-colors ${
                  isValid ? "border-slate-700 focus:border-blue-500" : "border-red-500/50 focus:border-red-500"
                }`}
              />
              <button onClick={copy}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors shrink-0">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {isValid ? (
              <p className="text-blue-400 text-sm mt-2">{description}</p>
            ) : (
              <p className="text-red-400 text-sm mt-2">Invalid cron expression</p>
            )}
            <div className="flex gap-3 text-slate-600 text-xs mt-3 font-mono">
              {["min", "hour", "day", "month", "weekday"].map(f => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Common presets</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => (
                <button key={p.value + p.label} onClick={() => setExpr(p.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    expr === p.value
                      ? "bg-blue-600/15 border border-blue-500/40 text-blue-300"
                      : "bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-white"
                  }`}>
                  <span>{p.label}</span>
                  <code className="text-xs opacity-60 font-mono ml-2 shrink-0">{p.value}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Next runs */}
          {isValid && nextRuns.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">Next 5 runs</p>
              <div className="space-y-2">
                {nextRuns.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 font-mono w-4">{i + 1}</span>
                    <span className="text-slate-400 text-xs w-8">{DAY_NAMES[d.getDay()]}</span>
                    <span className="text-white font-mono">
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {" at "}
                      {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field reference */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Field reference</p>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              {[
                ["Minute",  "0–59"],
                ["Hour",    "0–23"],
                ["Day",     "1–31"],
                ["Month",   "1–12"],
                ["Weekday", "0–6 (Sun=0)"],
              ].map(([f, r]) => (
                <div key={f} className="flex gap-4">
                  <span className="w-16 text-slate-500">{f}</span>
                  <span>{r}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex gap-4"><span className="w-8 text-blue-400">*</span><span>Any value</span></div>
                <div className="flex gap-4"><span className="w-8 text-blue-400">,</span><span>Value list (e.g. 1,3,5)</span></div>
                <div className="flex gap-4"><span className="w-8 text-blue-400">-</span><span>Range (e.g. 1-5)</span></div>
                <div className="flex gap-4"><span className="w-8 text-blue-400">/</span><span>Step (e.g. */15)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
