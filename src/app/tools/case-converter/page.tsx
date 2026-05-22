"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const conversions = [
  {
    id: "lower",
    label: "lowercase",
    fn: (s: string) => s.toLowerCase(),
  },
  {
    id: "upper",
    label: "UPPERCASE",
    fn: (s: string) => s.toUpperCase(),
  },
  {
    id: "title",
    label: "Title Case",
    fn: (s: string) =>
      s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  },
  {
    id: "sentence",
    label: "Sentence case",
    fn: (s: string) =>
      s.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()).replace(/(?<=[.!?]\s+)\w/g, c => c.toUpperCase()),
  },
  {
    id: "camel",
    label: "camelCase",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    },
  },
  {
    id: "pascal",
    label: "PascalCase",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    },
  },
  {
    id: "snake",
    label: "snake_case",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.toLowerCase()).join("_");
    },
  },
  {
    id: "constant",
    label: "CONSTANT_CASE",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.toUpperCase()).join("_");
    },
  },
  {
    id: "kebab",
    label: "kebab-case",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.toLowerCase()).join("-");
    },
  },
  {
    id: "dot",
    label: "dot.case",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.toLowerCase()).join(".");
    },
  },
  {
    id: "path",
    label: "path/case",
    fn: (s: string) => {
      const words = s.match(/[a-zA-Z0-9]+/g) ?? [];
      return words.map(w => w.toLowerCase()).join("/");
    },
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg",
    fn: (s: string) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(""),
  },
];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Case Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert text between camelCase, snake_case, kebab-case, and more.</p>

        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <label className="block text-white text-sm font-medium mb-2">Input text</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your text here…"
              rows={4}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
            />
          </div>

          {input.trim() && (
            <div className="grid grid-cols-1 gap-3">
              {conversions.map(({ id, label, fn }) => {
                const result = fn(input);
                return (
                  <div key={id} className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-500 text-xs mb-1">{label}</p>
                      <p className="text-slate-200 text-sm font-mono truncate">{result}</p>
                    </div>
                    <button
                      onClick={() => copy(result, id)}
                      className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                      {copied === id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!input.trim() && (
            <div className="text-center py-12 text-slate-600 text-sm">
              Results will appear here as you type
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
