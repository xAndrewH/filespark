"use client";

import { useState } from "react";
import Link from "next/link";

export default function JsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = (raw: string, spaces: number) => {
    setError("");
    if (!raw.trim()) { setOutput(""); return; }
    try {
      const parsed = JSON.parse(raw);
      setOutput(JSON.stringify(parsed, null, spaces));
    } catch (e) {
      setOutput("");
      setError((e as Error).message);
    }
  };

  const handleInput = (v: string) => {
    setInput(v);
    format(v, indent);
  };

  const handleIndent = (n: number) => {
    setIndent(n);
    format(input, n);
  };

  const minify = () => {
    setError("");
    if (!input.trim()) return;
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">JSON Formatter</h1>
        <p className="text-slate-500 text-sm mb-8">Validate, format, and minify JSON instantly.</p>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-sm">Indent</span>
            {[2, 4].map(n => (
              <button key={n} onClick={() => handleIndent(n)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${indent === n ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {n}
              </button>
            ))}
          </div>
          <button onClick={minify}
            className="px-4 py-2 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-400 hover:text-white text-sm transition-colors">
            Minify
          </button>
          {output && (
            <button onClick={copy}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors">
              {copied ? "Copied!" : "Copy output"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Input JSON</label>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder={'{\n  "hello": "world"\n}'}
              spellCheck={false}
              className="w-full h-96 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
            {error && <p className="text-red-400 text-xs mt-2 font-mono">{error}</p>}
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Formatted output</label>
            <textarea
              readOnly
              value={output}
              placeholder="Formatted JSON will appear here…"
              spellCheck={false}
              className="w-full h-96 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
