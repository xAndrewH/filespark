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

// Splits any casing style into individual words so chaining always works.
// Handles: "hello world", "hello_world", "hello-world", "helloWorld", "HelloWorld", "HELLO_WORLD"
function splitWords(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")         // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")   // ACRONYMCase → ACRONYM Case
    .match(/[a-zA-Z0-9]+/g) ?? [];
}

const TITLE_MINOR = new Set([
  "a","an","the","and","but","or","for","nor","as","at","by","from",
  "in","into","near","of","off","on","onto","out","over","so","to",
  "up","via","with","yet",
]);

const CASES: CaseOption[] = [
  {
    id: "sentence", abbr: "Sc", label: "Sentence case", color: "bg-orange-700",
    fn: s => {
      const n = /\s/.test(s) ? s : splitWords(s).join(" ");
      return n.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
    },
  },
  {
    id: "lower", abbr: "lc", label: "lower case", color: "bg-green-700",
    fn: s => (/\s/.test(s) ? s : splitWords(s).join(" ")).toLowerCase(),
  },
  {
    id: "upper", abbr: "UC", label: "UPPER CASE", color: "bg-blue-700",
    fn: s => (/\s/.test(s) ? s : splitWords(s).join(" ")).toUpperCase(),
  },
  {
    id: "capitalized", abbr: "CC", label: "Capitalized Case", color: "bg-purple-700",
    fn: s => (/\s/.test(s) ? s : splitWords(s).join(" ")).toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase()),
  },
  {
    id: "alternating", abbr: "aC", label: "aLtErNaTiNg cAsE", color: "bg-yellow-600",
    fn: s => {
      const n = /\s/.test(s) ? s : splitWords(s).join(" ");
      let i = 0;
      return n.replace(/[a-zA-Z]/g, c => (i++ % 2 === 0 ? c.toLowerCase() : c.toUpperCase()));
    },
  },
  {
    id: "title", abbr: "TC", label: "Title Case", color: "bg-teal-700",
    fn: s => {
      const n = /\s/.test(s) ? s : splitWords(s).join(" ");
      const tokens = n.split(/(\s+)/);
      let wordIdx = 0;
      const wordCount = tokens.filter(t => !/^\s+$/.test(t)).length;
      return tokens.map(t => {
        if (/^\s+$/.test(t)) return t;
        const lower = t.toLowerCase();
        const isFirst = wordIdx === 0;
        const isLast = wordIdx === wordCount - 1;
        wordIdx++;
        if (!isFirst && !isLast && TITLE_MINOR.has(lower)) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }).join("");
    },
  },
  {
    id: "inverse", abbr: "iC", label: "InVeRsE CaSe", color: "bg-pink-700",
    fn: s => (/\s/.test(s) ? s : splitWords(s).join(" ")).split("").map(c => /[a-zA-Z]/.test(c) ? (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) : c).join(""),
  },
  {
    id: "camel", abbr: "cC", label: "camelCase", color: "bg-indigo-700",
    fn: s => { const w = splitWords(s); return w.map((x, i) => i === 0 ? x.toLowerCase() : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(""); },
  },
  {
    id: "pascal", abbr: "PC", label: "PascalCase", color: "bg-violet-700",
    fn: s => splitWords(s).map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(""),
  },
  {
    id: "snake", abbr: "sc", label: "snake_case", color: "bg-amber-700",
    fn: s => splitWords(s).map(x => x.toLowerCase()).join("_"),
  },
  {
    id: "constant", abbr: "SC", label: "CONSTANT_CASE", color: "bg-red-700",
    fn: s => splitWords(s).map(x => x.toUpperCase()).join("_"),
  },
  {
    id: "kebab", abbr: "kc", label: "kebab-case", color: "bg-cyan-700",
    fn: s => splitWords(s).map(x => x.toLowerCase()).join("-"),
  },
  {
    id: "dot", abbr: "dc", label: "dot.case", color: "bg-lime-700",
    fn: s => splitWords(s).map(x => x.toLowerCase()).join("."),
  },
  {
    id: "path", abbr: "pc", label: "path/case", color: "bg-rose-700",
    fn: s => splitWords(s).map(x => x.toLowerCase()).join("/"),
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 px-4 py-4 border-t border-slate-800/60 bg-slate-900/40">
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
