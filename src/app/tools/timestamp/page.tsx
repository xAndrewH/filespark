"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

const FORMATS = [
  { label: "Local",     fn: (d: Date) => d.toLocaleString() },
  { label: "UTC",       fn: (d: Date) => d.toUTCString() },
  { label: "ISO 8601",  fn: (d: Date) => d.toISOString() },
  { label: "Date only", fn: (d: Date) => d.toLocaleDateString() },
  { label: "Time only", fn: (d: Date) => d.toLocaleTimeString() },
  { label: "Unix (s)",  fn: (d: Date) => String(Math.floor(d.getTime() / 1000)) },
  { label: "Unix (ms)", fn: (d: Date) => String(d.getTime()) },
];

export default function TimestampPage() {
  const [now, setNow] = useState(() => new Date());
  const [input, setInput] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [live]);

  const parse = useCallback((val: string) => {
    setError("");
    if (!val.trim()) { setDate(null); return; }
    // Unix timestamp (seconds or ms)
    const num = Number(val.trim());
    if (!isNaN(num)) {
      const d = new Date(num > 1e10 ? num : num * 1000);
      if (isNaN(d.getTime())) { setError("Invalid timestamp"); return; }
      setDate(d);
      return;
    }
    const d = new Date(val.trim());
    if (isNaN(d.getTime())) { setError("Could not parse date string"); return; }
    setDate(d);
  }, []);

  const useNow = () => {
    const d = new Date();
    setInput(String(Math.floor(d.getTime() / 1000)));
    setDate(d);
    setError("");
  };

  const tryExample = () => {
    const sample = "1749600000";
    setInput(sample);
    parse(sample);
  };

  const display = date ?? (live ? now : null);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Timestamp Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert Unix timestamps to human-readable dates and back.</p>

        <div className="space-y-5">
          {/* Live clock */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs mb-1">Current Unix timestamp</p>
              <p className="text-white font-mono text-xl">{Math.floor(now.getTime() / 1000)}</p>
              <p className="text-slate-500 text-xs mt-1">{now.toUTCString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={useNow}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                Use now
              </button>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} className="accent-blue-500" />
                <span className="text-slate-400 text-xs">Live</span>
              </label>
            </div>
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">Enter a Unix timestamp or date string</label>
              <button onClick={tryExample}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs rounded-lg px-3 py-1.5">
                Try an example
              </button>
            </div>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); parse(e.target.value); }}
              placeholder="1715000000 or 2024-05-01T12:00:00Z"
              spellCheck={false}
              className={`w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none transition-colors ${error ? "border-red-500/50" : "border-slate-800/60 focus:border-blue-500/50"}`}
            />
            <ErrorAlert message={error} className="mt-1.5" />
          </div>

          {/* Results */}
          {display && (
            <div className="space-y-2">
              {FORMATS.map(({ label, fn }) => {
                const val = fn(display);
                return (
                  <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-slate-500 text-xs w-24 shrink-0">{label}</span>
                    <code className="flex-1 text-white text-sm font-mono truncate">{val}</code>
                    <CopyButton text={val} label="Copy" className="shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <RelatedTools current="/tools/timestamp" />
      </div>
    </div>
  );
}
