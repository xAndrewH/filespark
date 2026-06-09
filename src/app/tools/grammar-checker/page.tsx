"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

interface Match {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { category: { name: string }; id: string };
}

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-AU", label: "English (AU)" },
  { code: "de-DE", label: "German" },
  { code: "fr",    label: "French" },
  { code: "es",    label: "Spanish" },
  { code: "pt-BR", label: "Portuguese (BR)" },
  { code: "nl",    label: "Dutch" },
  { code: "it",    label: "Italian" },
  { code: "pl",    label: "Polish" },
];

export default function GrammarCheckerPage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    setText("");
    setMatches([]);
    setChecked(false);
    setActiveIdx(null);
    setError("");
  }, []);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }, [text]);

  const check = useCallback(async (t?: string, lang?: string) => {
    const src = t ?? text;
    const lng = lang ?? language;
    if (!src.trim()) return;
    setLoading(true);
    setChecked(false);
    setMatches([]);
    setActiveIdx(null);
    setError("");
    try {
      const body = new URLSearchParams({ text: src, language: lng });
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setMatches(data.matches ?? []);
      setChecked(true);
    } catch (e) {
      setMatches([]);
      setChecked(true);
      setError("Could not check grammar. Check your connection or try again.");
      void e;
    } finally {
      setLoading(false);
    }
  }, [text, language]);

  const applyFix = useCallback((match: Match, replacement: string) => {
    const newText = text.slice(0, match.offset) + replacement + text.slice(match.offset + match.length);
    setText(newText);
    // Remove the fixed match and shift remaining offsets
    const diff = replacement.length - match.length;
    setMatches(prev =>
      prev
        .filter(m => m !== match)
        .map(m => m.offset > match.offset ? { ...m, offset: m.offset + diff } : m)
    );
    setActiveIdx(null);
  }, [text]);

  const fixAll = useCallback(() => {
    // Apply all first-suggestion fixes from last to first to preserve offsets
    const fixable = [...matches]
      .filter(m => m.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset);
    let result = text;
    for (const m of fixable) {
      result = result.slice(0, m.offset) + m.replacements[0].value + result.slice(m.offset + m.length);
    }
    setText(result);
    setMatches([]);
    setChecked(false);
    setActiveIdx(null);
  }, [text, matches]);

  const categoryColor: Record<string, string> = {
    GRAMMAR: "text-red-400 bg-red-950/40 border-red-800/50",
    SPELLING: "text-yellow-400 bg-yellow-950/40 border-yellow-800/50",
    PUNCTUATION: "text-orange-400 bg-orange-950/40 border-orange-800/50",
    STYLE: "text-blue-400 bg-blue-950/40 border-blue-800/50",
  };
  const getColor = (cat: string) => categoryColor[cat] ?? "text-slate-400 bg-slate-800/60 border-slate-700/50";

  const renderHighlighted = () => {
    if (!checked || matches.length === 0) return null;
    const parts: { text: string; matchIdx: number | null }[] = [];
    let pos = 0;
    const sorted = [...matches].sort((a, b) => a.offset - b.offset);
    for (const [mi, m] of sorted.entries()) {
      if (m.offset > pos) parts.push({ text: text.slice(pos, m.offset), matchIdx: null });
      parts.push({ text: text.slice(m.offset, m.offset + m.length), matchIdx: mi });
      pos = m.offset + m.length;
    }
    if (pos < text.length) parts.push({ text: text.slice(pos), matchIdx: null });
    return parts.map((p, i) =>
      p.matchIdx !== null ? (
        <mark key={i}
          onClick={() => setActiveIdx(activeIdx === p.matchIdx ? null : p.matchIdx)}
          className="bg-yellow-500/30 border-b-2 border-yellow-400 cursor-pointer rounded-sm hover:bg-yellow-500/50 transition-colors">
          {p.text}
        </mark>
      ) : (
        <span key={i}>{p.text}</span>
      )
    );
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().split(/\s+/).filter(Boolean).length >= 5) {
      debounceRef.current = setTimeout(() => check(text, language), 1500);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, language]);

  const highlighted = renderHighlighted();
  const fixableCount = matches.filter(m => m.replacements.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Grammar &amp; Spell Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Check grammar, spelling, and style instantly — no signup required.</p>

        <div className="space-y-4">
          {/* Language selector */}
          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-xs shrink-0">Language:</label>
            <select value={language}
              onChange={e => { setLanguage(e.target.value); setChecked(false); setMatches([]); }}
              className="bg-slate-900/60 border border-slate-800/60 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/50">
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setChecked(false); setMatches([]); setActiveIdx(null); setError(""); }}
              placeholder="Paste or type your text here to check for grammar and spelling mistakes…"
              rows={8}
              className="w-full bg-transparent px-4 py-4 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-xs">{text.trim().split(/\s+/).filter(Boolean).length} words · {text.length} chars</span>
                {loading && <span className="text-slate-500 text-xs animate-pulse">Checking…</span>}
              </div>
              <div className="flex items-center gap-2">
                {text && (
                  <button onClick={copyText}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60">
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
                {text && (
                  <button onClick={clearAll}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60">
                    Clear
                  </button>
                )}
                {fixableCount > 0 && (
                  <button onClick={fixAll}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">
                    Fix all ({fixableCount})
                  </button>
                )}
                <button onClick={() => check()} disabled={loading || !text.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                  {loading ? "Checking…" : "Check now"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-2">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Highlighted preview */}
          {highlighted && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-2">Click a highlighted word to see and apply suggestions</p>
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{highlighted}</div>
            </div>
          )}

          {checked && matches.length === 0 && (
            <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4">
              <span className="text-emerald-400 text-lg">✓</span>
              <p className="text-emerald-400 text-sm">No issues found. Your text looks great!</p>
            </div>
          )}

          {matches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm font-medium">{matches.length} issue{matches.length !== 1 ? "s" : ""} found</p>
                {fixableCount > 0 && (
                  <button onClick={fixAll}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    Fix all {fixableCount} auto-fixable
                  </button>
                )}
              </div>
              {matches.map((m, i) => (
                <div key={i}
                  onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${getColor(m.rule.category.name)} ${activeIdx === i ? "ring-1 ring-blue-500/50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{m.rule.category.name}</span>
                        <code className="text-xs opacity-50 font-mono">&ldquo;{text.slice(m.offset, m.offset + m.length)}&rdquo;</code>
                      </div>
                      <p className="text-sm leading-relaxed">{m.message}</p>
                    </div>
                    {m.replacements.length > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); applyFix(m, m.replacements[0].value); }}
                        className="shrink-0 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs font-mono transition-colors border border-white/10">
                        → {m.replacements[0].value}
                      </button>
                    )}
                  </div>
                  {m.replacements.length > 1 && activeIdx === i && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs opacity-60">All suggestions:</span>
                      {m.replacements.slice(0, 6).map((r, ri) => (
                        <button key={ri} onClick={e => { e.stopPropagation(); applyFix(m, r.value); }}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs font-mono transition-colors">
                          {r.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
