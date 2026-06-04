"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

function minifyJs(js: string): string {
  return js
    // Remove single-line comments (not inside strings)
    .replace(/(?<!:)\/\/[^\n]*/g, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Collapse whitespace (not inside strings - basic approach)
    .replace(/[ \t]+/g, " ")
    // Remove newlines
    .replace(/\n+/g, "\n")
    // Remove spaces around operators and punctuation
    .replace(/ *([=+\-*/%&|^!<>?:;,{}()\[\]]) */g, "$1")
    // Remove trailing newlines/spaces
    .trim();
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

export default function JsMinifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const minify = useCallback(() => {
    setOutput(minifyJs(input));
  }, [input]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "script.min.js";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;
  const savings = inputBytes > 0 && outputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">JS Minifier</h1>
        <p className="text-slate-500 text-sm mb-8">Strip comments and whitespace from JavaScript to reduce file size.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Input JavaScript</label>
              {inputBytes > 0 && <span className="text-xs text-slate-500">{formatBytes(inputBytes)}</span>}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your JavaScript here…"
              rows={18}
              className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Minified Output</label>
              {outputBytes > 0 && (
                <span className="text-xs text-green-400">{formatBytes(outputBytes)} · {savings}% smaller</span>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Minified JavaScript will appear here…"
              rows={18}
              className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            onClick={minify}
            disabled={!input.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
          >
            Minify JS
          </button>
          {output && (
            <>
              <button
                onClick={copy}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-sm font-medium text-slate-200 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={download}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-sm font-medium text-slate-200 transition-colors"
              >
                Download .min.js
              </button>
            </>
          )}
          {input && (
            <button
              onClick={() => { setInput(""); setOutput(""); }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-sm font-medium text-slate-400 transition-colors ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
