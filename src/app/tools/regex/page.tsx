"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function RegexPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const result = useMemo(() => {
    if (!pattern || !text) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (!result || result.error || result.matches.length === 0 || !pattern) return null;
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: { text: string; match: boolean }[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
        parts.push({ text: m[0] || " ", match: true });
        last = m.index + Math.max(m[0].length, 1);
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < text.length) parts.push({ text: text.slice(last), match: false });
      return parts;
    } catch {
      return null;
    }
  }, [pattern, flags, text, result]);

  const toggleFlag = (f: string) =>
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);

  const FLAG_OPTS = [
    { f: "g", label: "g", title: "Global" },
    { f: "i", label: "i", title: "Ignore case" },
    { f: "m", label: "m", title: "Multiline" },
    { f: "s", label: "s", title: "Dot all" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Regex Tester</h1>
        <p className="text-slate-500 text-sm mb-8">Test regular expressions with live match highlighting.</p>

        <div className="space-y-4">
          {/* Pattern + flags */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
            <span className="text-slate-500 font-mono text-lg select-none">/</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="pattern"
              spellCheck={false}
              className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-600"
            />
            <span className="text-slate-500 font-mono text-lg select-none">/</span>
            <div className="flex gap-1">
              {FLAG_OPTS.map(({ f, label, title }) => (
                <button key={f} onClick={() => toggleFlag(f)} title={title}
                  className={`w-7 h-7 rounded font-mono text-sm transition-colors ${flags.includes(f) ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {result?.error && (
            <p className="text-red-400 text-sm font-mono">{result.error}</p>
          )}

          {/* Test string */}
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Test string</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste text to test against…"
              spellCheck={false}
              className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
          </div>

          {/* Highlighted preview */}
          {highlighted && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-2">
                {result?.matches.length ?? 0} match{result?.matches.length !== 1 ? "es" : ""}
              </p>
              <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                {highlighted.map((part, i) =>
                  part.match
                    ? <mark key={i} className="bg-blue-500/30 text-blue-300 rounded px-0.5">{part.text}</mark>
                    : <span key={i} className="text-slate-300">{part.text}</span>
                )}
              </div>
            </div>
          )}

          {/* Match list */}
          {result && result.matches.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
              <p className="text-white text-sm font-medium mb-2">Matches</p>
              {result.matches.map((m, i) => (
                <div key={i} className="flex items-start gap-3 text-xs font-mono">
                  <span className="text-slate-600 w-5 shrink-0">{i + 1}</span>
                  <span className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded break-all">{m.match || "(empty)"}</span>
                  <span className="text-slate-500">@{m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-slate-400">groups: [{m.groups.map(g => g ?? "undefined").join(", ")}]</span>
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
