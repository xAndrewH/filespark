"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Entry } from "./types";
import { tailwindEntries } from "./data/tailwind";
import { bootstrapEntries } from "./data/bootstrap";
import { sassEntries } from "./data/sass";
import { reactEntries } from "./data/react";
import { nextjsEntries } from "./data/nextjs";

type Framework = "tailwind" | "bootstrap" | "sass" | "react" | "nextjs";

const FRAMEWORKS: { id: Framework; label: string; color: string }[] = [
  { id: "tailwind",  label: "Tailwind CSS", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" },
  { id: "bootstrap", label: "Bootstrap",    color: "bg-purple-500/20 border-purple-500/40 text-purple-400" },
  { id: "sass",      label: "Sass",         color: "bg-pink-500/20 border-pink-500/40 text-pink-400" },
  { id: "react",     label: "React",        color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
  { id: "nextjs",    label: "Next.js",      color: "bg-slate-400/20 border-slate-400/40 text-slate-300" },
];

const ENTRIES: Record<Framework, Entry[]> = {
  tailwind: tailwindEntries,
  bootstrap: bootstrapEntries,
  sass: sassEntries,
  react: reactEntries,
  nextjs: nextjsEntries,
};

export default function FrameworkReferencePage() {
  const [fw, setFw] = useState<Framework>("tailwind");
  const [query, setQuery] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const current = FRAMEWORKS.find(f => f.id === fw)!;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ENTRIES[fw];
    return ENTRIES[fw].filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q)
    );
  }, [fw, query]);

  const copy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Framework Reference</h1>
        <p className="text-slate-500 text-sm mb-4">Searchable code snippets for Tailwind, Bootstrap, Sass, React, and Next.js.</p>
        <a href="https://devdocs.io" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-slate-900/60 border border-slate-700/60 hover:border-blue-500/60 rounded-xl text-sm text-slate-300 hover:text-blue-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Full API docs at devdocs.io
        </a>

        {/* Framework tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FRAMEWORKS.map(f => (
            <button key={f.id} onClick={() => { setFw(f.id); setQuery(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${fw === f.id ? f.color : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${current.label} snippets… (${ENTRIES[fw].length} total)`}
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">No snippets match &quot;{query}&quot;</p>
          )}
          {filtered.map((entry, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
              <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-3">
                <div>
                  <h3 className="text-white text-sm font-semibold">{entry.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{entry.description}</p>
                </div>
                <button
                  onClick={() => copy(entry.code, i)}
                  className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                  {copiedIdx === i ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="px-4 pb-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">{entry.code}</pre>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <p className="text-slate-600 text-xs text-center mt-6">{filtered.length} snippet{filtered.length !== 1 ? "s" : ""} shown</p>
        )}
      </div>
    </div>
  );
}
