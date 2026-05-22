"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type CaseId = "sentence" | "lower" | "upper" | "capitalized" | "alternating" | "title" | "inverse" | "camel" | "pascal" | "snake" | "constant" | "kebab" | "dot" | "path";

interface CaseOption {
  id: CaseId;
  label: string;
  abbr: string;
  color: string;
  fn: (s: string) => string;
}

const CASES: CaseOption[] = [
  {
    id: "sentence", abbr: "Sc", label: "Sentence case", color: "bg-orange-700",
    fn: s => s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  },
  {
    id: "lower", abbr: "lc", label: "lower case", color: "bg-green-700",
    fn: s => s.toLowerCase(),
  },
  {
    id: "upper", abbr: "UC", label: "UPPER CASE", color: "bg-blue-700",
    fn: s => s.toUpperCase(),
  },
  {
    id: "capitalized", abbr: "CC", label: "Capitalized Case", color: "bg-purple-700",
    fn: s => s.replace(/\b\w/g, c => c.toUpperCase()),
  },
  {
    id: "alternating", abbr: "aC", label: "aLtErNaTiNg cAsE", color: "bg-yellow-600",
    fn: s => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(""),
  },
  {
    id: "title", abbr: "TC", label: "Title Case", color: "bg-teal-700",
    fn: s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  },
  {
    id: "inverse", abbr: "iC", label: "InVeRsE CaSe", color: "bg-pink-700",
    fn: s => s.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""),
  },
  {
    id: "camel", abbr: "cC", label: "camelCase", color: "bg-indigo-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map((x, i) => i === 0 ? x.toLowerCase() : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(""); },
  },
  {
    id: "pascal", abbr: "PC", label: "PascalCase", color: "bg-violet-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(""); },
  },
  {
    id: "snake", abbr: "sc", label: "snake_case", color: "bg-amber-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.toLowerCase()).join("_"); },
  },
  {
    id: "constant", abbr: "SC", label: "CONSTANT_CASE", color: "bg-red-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.toUpperCase()).join("_"); },
  },
  {
    id: "kebab", abbr: "kc", label: "kebab-case", color: "bg-cyan-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.toLowerCase()).join("-"); },
  },
  {
    id: "dot", abbr: "dc", label: "dot.case", color: "bg-lime-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.toLowerCase()).join("."); },
  },
  {
    id: "path", abbr: "pc", label: "path/case", color: "bg-rose-700",
    fn: s => { const w = s.match(/[a-zA-Z0-9]+/g) ?? []; return w.map(x => x.toLowerCase()).join("/"); },
  },
];

export default function CaseConverterPage() {
  const [text, setText] = useState("");
  const [activeCase, setActiveCase] = useState<CaseId>("sentence");
  const [copied, setCopied] = useState(false);

  const applyCase = useCallback((id: CaseId) => {
    setActiveCase(id);
    const c = CASES.find(c => c.id === id)!;
    setText(t => c.fn(t));
  }, []);

  const copy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const download = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "converted.txt";
    a.click();
  }, [text]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const lineCount = text.split("\n").length;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Case Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Type or paste text, then click a case button to transform it.</p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste your content here"
            rows={10}
            className="w-full bg-transparent px-5 py-5 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
            spellCheck={false}
          />

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              {/* Copy */}
              <button onClick={copy} title="Copy" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              {/* Download */}
              <button onClick={download} title="Download" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
              {/* Clear */}
              <button onClick={() => setText("")} title="Clear" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                </svg>
              </button>
              {copied && <span className="text-green-400 text-xs ml-1">Copied!</span>}
            </div>
            <span className="text-slate-500 text-xs">
              Character Count: {charCount} | Word Count: {wordCount} | Line Count: {lineCount}
            </span>
          </div>

          {/* Case buttons */}
          <div className="flex flex-wrap gap-2 px-4 py-4 border-t border-slate-800/60 bg-slate-900/40">
            {CASES.map(c => (
              <button
                key={c.id}
                onClick={() => applyCase(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeCase === c.id
                    ? "border-white/30 text-white " + c.color
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white ${c.color}`}>
                  {c.abbr[0]}
                </span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
