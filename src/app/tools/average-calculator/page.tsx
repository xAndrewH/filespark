"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function toSigFigs(n: number, sig: number): string {
  if (!isFinite(n)) return String(n);
  if (n === 0) return "0";
  return parseFloat(n.toPrecision(sig)).toString();
}

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

interface Stats {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  sum: number;
  count: number;
  sorted: number[];
}

function computeStats(nums: number[]): Stats | null {
  if (nums.length === 0) return null;

  const sorted = [...nums].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  const mean = sum / count;

  let median: number;
  if (count % 2 === 1) {
    median = sorted[Math.floor(count / 2)];
  } else {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  }

  // Mode
  const freq = new Map<number, number>();
  for (const n of sorted) freq.set(n, (freq.get(n) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  const mode = maxFreq > 1 ? [...freq.entries()].filter(([, f]) => f === maxFreq).map(([n]) => n) : [];

  const range = sorted[count - 1] - sorted[0];

  return { mean, median, mode, range, sum, count, sorted };
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
      <div className="text-slate-500 text-xs mb-1">{label}</div>
      <div className="text-white text-xl font-bold truncate">{value}</div>
    </div>
  );
}

export default function AverageCalculatorPage() {
  const [raw, setRaw] = useState("");

  const numbers = useMemo(() => parseNumbers(raw), [raw]);
  const stats = useMemo(() => computeStats(numbers), [numbers]);

  const fmt = (n: number) => toSigFigs(n, 4);
  const dash = "|";

  const modeDisplay = stats
    ? stats.mode.length === 0
      ? "None"
      : stats.mode.map(fmt).join(", ")
    : dash;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Average Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">
          Paste or type numbers to instantly compute mean, median, mode, and more.
        </p>

        {/* Input area */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden mb-6">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"Enter numbers separated by commas, spaces, or newlines\ne.g.  4, 8, 15, 16, 23, 42"}
            className="w-full h-32 bg-transparent px-5 py-5 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-600 font-mono"
            spellCheck={false}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/60">
            <span className="text-slate-500 text-xs">
              {numbers.length} valid number{numbers.length !== 1 ? "s" : ""} detected
            </span>
            <button
              onClick={() => setRaw("")}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard label="Mean (Average)" value={stats ? fmt(stats.mean) : dash} />
          <StatCard label="Median" value={stats ? fmt(stats.median) : dash} />
          <StatCard label="Mode" value={stats ? modeDisplay : dash} />
          <StatCard label="Range" value={stats ? fmt(stats.range) : dash} />
          <StatCard label="Sum" value={stats ? fmt(stats.sum) : dash} />
          <StatCard label="Count" value={stats ? String(stats.count) : dash} />
        </div>

        {/* Sorted list */}
        {stats && stats.sorted.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="text-slate-500 text-xs mb-3">Sorted (ascending)</div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {stats.sorted.map((n, i) => (
                <span
                  key={i}
                  className="bg-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
