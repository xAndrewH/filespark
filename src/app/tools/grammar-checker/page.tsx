"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Match {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { category: { name: string }; id: string };
}

export default function GrammarCheckerPage() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const check = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setChecked(false);
    setMatches([]);
    setActiveIdx(null);
    try {
      const body = new URLSearchParams({ text, language: "en-US" });
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      setMatches(data.matches ?? []);
      setChecked(true);
    } catch {
      setMatches([]);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const applyFix = (match: Match, replacement: string) => {
    const before = text.slice(0, match.offset);
    const after = text.slice(match.offset + match.length);
    const newText = before + replacement + after;
    setText(newText);
    setMatches([]);
    setChecked(false);
    setActiveIdx(null);
  };

  const categoryColor: Record<string, string> = {
    "GRAMMAR": "text-red-400 bg-red-950/40 border-red-800/50",
    "SPELLING": "text-yellow-400 bg-yellow-950/40 border-yellow-800/50",
    "PUNCTUATION": "text-orange-400 bg-orange-950/40 border-orange-800/50",
    "STYLE": "text-blue-400 bg-blue-950/40 border-blue-800/50",
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

  const highlighted = renderHighlighted();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Grammar &amp; Spell Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Check grammar, spelling, and style powered by LanguageTool.</p>

        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setChecked(false); setMatches([]); }}
              placeholder="Paste or type your text here to check for grammar and spelling mistakes…"
              rows={8}
              className="w-full bg-transparent px-4 py-4 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
              <span className="text-slate-600 text-xs">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button onClick={check} disabled={loading || !text.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? "Checking…" : "Check text"}
              </button>
            </div>
          </div>

          {/* Highlighted preview */}
          {highlighted && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-2">Click a highlighted word to see suggestions</p>
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{highlighted}</div>
            </div>
          )}

          {checked && matches.length === 0 && (
            <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4">
              <span className="text-emerald-400 text-lg">✓</span>
              <p className="text-emerald-400 text-sm">No issues found!</p>
            </div>
          )}

          {matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm font-medium">{matches.length} issue{matches.length !== 1 ? "s" : ""} found</p>
              {matches.map((m, i) => (
                <div key={i}
                  onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${getColor(m.rule.category.name)} ${activeIdx === i ? "ring-1 ring-blue-500/50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{m.rule.category.name}</span>
                        <code className="text-xs opacity-50 font-mono">"{text.slice(m.offset, m.offset + m.length)}"</code>
                      </div>
                      <p className="text-sm leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                  {m.replacements.length > 0 && activeIdx === i && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs opacity-60">Suggestions:</span>
                      {m.replacements.slice(0, 5).map((r, ri) => (
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
