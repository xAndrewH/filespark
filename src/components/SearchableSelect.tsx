"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}

export default function SearchableSelect({ value, options, onChange, className = "" }: Props) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
    setQuery("");
    setHighlighted(0);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setHighlighted(0);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    const item = listRef.current?.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-blue-500/70 hover:border-slate-600 transition-colors min-w-[70px]"
      >
        <span className="flex-1 text-left font-mono tracking-wide">{value.toUpperCase()}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-40 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
          {/* Search input */}
          {options.length > 6 && (
            <div className="p-1.5 border-b border-slate-800">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search…"
                className="w-full bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Options list */}
          <ul ref={listRef} className="max-h-48 overflow-y-auto scrollbar-thin py-1" onKeyDown={onKeyDown}>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-slate-500 text-xs text-center">No match</li>
            ) : (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  onMouseDown={() => select(opt)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer font-mono tracking-wide transition-colors ${
                    opt === value
                      ? "text-blue-300 bg-blue-500/10"
                      : i === highlighted
                      ? "text-white bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {opt.toUpperCase()}
                  {opt === value && (
                    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
