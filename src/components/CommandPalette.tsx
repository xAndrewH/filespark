"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tool-registry";

const MAX_RESULTS = 12;

const TOOLS = ALL_TOOLS.map(t => ({
  href: t.href,
  title: t.title,
  desc: t.description,
  cat: t.category,
}));


export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setIdx(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = query.trim()
    ? TOOLS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase()) ||
        t.cat.toLowerCase().includes(query.toLowerCase())
      ).slice(0, MAX_RESULTS)
    : TOOLS.slice(0, MAX_RESULTS);

  useEffect(() => {
    itemRefs.current[idx]?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-950/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div className="w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setIdx(0); }}
              onKeyDown={e => {
                if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)); }
                if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
                if (e.key === "Enter" && filtered[idx]) navigate(filtered[idx].href);
              }}
              placeholder="Search tools…"
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-600"
            />
            <kbd className="text-slate-600 text-xs bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 font-mono shrink-0">esc</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No tools found</p>
            ) : (
              filtered.map((tool, i) => (
                <button
                  key={tool.href}
                  ref={el => { itemRefs.current[i] = el; }}
                  onClick={() => navigate(tool.href)}
                  onMouseEnter={() => setIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === idx ? "bg-blue-600/20" : "hover:bg-slate-800/40"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${i === idx ? "text-white" : "text-slate-300"}`}>{tool.title}</p>
                    <p className="text-slate-500 text-xs truncate">{tool.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0 hidden sm:block">{tool.cat}</span>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-800/60 flex items-center gap-4 text-xs text-slate-600">
            <span><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">↵</kbd> open</span>
            <span className="ml-auto"><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">⌘K</kbd> toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
