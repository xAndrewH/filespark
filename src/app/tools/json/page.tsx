"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

function sortKeys(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortKeys);
  if (val !== null && typeof val === "object") {
    return Object.fromEntries(
      Object.keys(val as object).sort().map((k) => [k, sortKeys((val as Record<string, unknown>)[k])])
    );
  }
  return val;
}

export default function JsonPage() {
  const [input, setInput]     = useState("");
  const [output, setOutput]   = useState("");
  const [error, setError]     = useState("");
  const [indent, setIndent]   = useState(2);
  const [sorted, setSorted]   = useState(false);
  const [copied, setCopied]   = useState(false);
  const [stats, setStats]     = useState<{ keys: number; depth: number } | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const countKeys = (val: unknown, depth = 0): { keys: number; depth: number } => {
    if (Array.isArray(val)) {
      const results = val.map((v) => countKeys(v, depth + 1));
      return { keys: results.reduce((a, r) => a + r.keys, 0), depth: Math.max(depth, ...results.map((r) => r.depth)) };
    }
    if (val !== null && typeof val === "object") {
      const keys = Object.keys(val as object);
      const results = Object.values(val as object).map((v) => countKeys(v, depth + 1));
      return { keys: keys.length + results.reduce((a, r) => a + r.keys, 0), depth: Math.max(depth + 1, ...results.map((r) => r.depth)) };
    }
    return { keys: 0, depth };
  };

  const format = useCallback((raw: string, spaces: number, sort: boolean) => {
    setError("");
    if (!raw.trim()) { setOutput(""); setStats(null); return; }
    try {
      const parsed = JSON.parse(raw);
      const processed = sort ? sortKeys(parsed) : parsed;
      setOutput(JSON.stringify(processed, null, spaces));
      setStats(countKeys(parsed));
    } catch (e) {
      setOutput("");
      setStats(null);
      setError((e as Error).message);
    }
  }, []);

  const handleInput = (v: string) => { setInput(v); format(v, indent, sorted); };
  const handleIndent = (n: number) => { setIndent(n); format(input, n, sorted); };
  const handleSort = (s: boolean) => { setSorted(s); format(input, indent, s); };

  const minify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(sorted ? sortKeys(parsed) : parsed));
      setError("");
    } catch (e) { setError((e as Error).message); }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadOutput = () => { if (output) { setInput(output); format(output, indent, sorted); } };
  const clear = () => { setInput(""); setOutput(""); setError(""); setStats(null); };

  const loadSample = () => {
    const sample = `{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"Springfield","zip":"12345"},"tags":["developer","designer"],"active":true}`;
    handleInput(sample);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleInput(ev.target?.result as string ?? "");
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">JSON Formatter</h1>
        <p className="text-slate-500 text-sm mb-8">Validate, format, minify, and sort JSON instantly.</p>

        {/* Toolbar */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-1.5">
            <span className="text-slate-400 text-xs mr-1">Indent</span>
            {[2, 4].map((n) => (
              <button key={n} onClick={() => handleIndent(n)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${indent === n ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {n}
              </button>
            ))}
          </div>

          <button onClick={minify}
            className="px-3 py-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-400 hover:text-white text-xs transition-colors">
            Minify
          </button>

          <button onClick={() => handleSort(!sorted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
              sorted ? "bg-blue-500/15 border-blue-500/40 text-blue-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"
            }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort keys
          </button>

          <button onClick={loadSample}
            className="px-3 py-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-400 hover:text-white text-xs transition-colors">
            Sample
          </button>

          {input && (
            <button onClick={clear}
              className="px-3 py-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-400 hover:text-red-400 text-xs transition-colors">
              Clear
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            {output && (
              <button onClick={loadOutput}
                className="px-3 py-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
                title="Send formatted output back to input">
                ← Use output
              </button>
            )}
            {output && (
              <button onClick={copy}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
                {copied ? "✓ Copied" : "Copy output"}
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex gap-4 mb-3 text-xs text-slate-500">
            <span><span className="text-slate-400 font-mono">{stats.keys}</span> total keys</span>
            <span><span className="text-slate-400 font-mono">{stats.depth}</span> max depth</span>
            <span><span className="text-slate-400 font-mono">{output.length.toLocaleString()}</span> chars</span>
          </div>
        )}

        {/* Editors */}
        <div
          ref={dropRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Input JSON <span className="text-slate-600">(or drop a .json file)</span></label>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={'{\n  "hello": "world"\n}'}
              spellCheck={false}
              className="w-full h-[420px] bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
            {error && (
              <div className="mt-2 flex items-start gap-2 text-red-400 text-xs">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-mono">{error}</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Formatted output</label>
            <textarea
              readOnly
              value={output}
              placeholder="Formatted JSON will appear here…"
              spellCheck={false}
              className="w-full h-[420px] bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-green-300/90 text-sm font-mono resize-none focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
