"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

type MatchResult = {
  match: string;
  index: number;
  groups: string[];
  namedGroups: Record<string, string> | null;
};

const FLAG_OPTS = [
  { f: "g", title: "Global | find all matches" },
  { f: "i", title: "Ignore case" },
  { f: "m", title: "Multiline | ^ and $ match line boundaries" },
  { f: "s", title: "Dot-all | . matches newlines" },
  { f: "u", title: "Unicode | enables \\p{} properties and correct emoji handling" },
];

export default function RegexPage() {
  const [pattern, setPattern]   = useState("");
  const [flags, setFlags]       = useState("g");
  const [text, setText]         = useState("");
  const [replacement, setReplacement] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [copiedMatches, setCopiedMatches] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedPattern, setDebouncedPattern] = useState("");
  const [debouncedText, setDebouncedText]       = useState("");

  // Debounce expensive regex computation to guard against catastrophic backtracking
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedPattern(pattern);
      setDebouncedText(text);
    }, 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [pattern, text]);

  const toggleFlag = useCallback((f: string) => {
    setFlags(prev => {
      if (prev.includes(f)) return prev.replace(f, "");
      // u and v are mutually exclusive; u must come before other flags for display
      return prev + f;
    });
  }, []);

  const result = useMemo<{ matches: MatchResult[]; error: string | null } | null>(() => {
    if (!debouncedPattern || !debouncedText) return null;
    try {
      const globalFlags = flags.includes("g") ? flags : flags + "g";
      const re = new RegExp(debouncedPattern, globalFlags);
      const matches: MatchResult[] = [];
      let m: RegExpExecArray | null;
      let lastIndex = -1;
      while ((m = re.exec(debouncedText)) !== null) {
        // Guard against infinite loops on zero-width matches
        if (m.index === lastIndex) { re.lastIndex++; continue; }
        lastIndex = m.index;
        matches.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
          namedGroups: m.groups ? { ...m.groups } : null,
        });
        if (!flags.includes("g")) break;
      }
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [debouncedPattern, debouncedText, flags]);

  const highlighted = useMemo(() => {
    if (!result || result.error || result.matches.length === 0) return null;
    const parts: { text: string; match: boolean; empty: boolean }[] = [];
    let last = 0;
    for (const m of result.matches) {
      if (m.index > last) parts.push({ text: debouncedText.slice(last, m.index), match: false, empty: false });
      parts.push({ text: m.match, match: true, empty: m.match.length === 0 });
      last = m.index + Math.max(m.match.length, 1);
    }
    if (last <= debouncedText.length) parts.push({ text: debouncedText.slice(last), match: false, empty: false });
    return parts;
  }, [result, debouncedText]);

  const replaceResult = useMemo(() => {
    if (!showReplace || !debouncedPattern || !debouncedText) return null;
    try {
      const globalFlags = flags.includes("g") ? flags : flags + "g";
      const re = new RegExp(debouncedPattern, globalFlags);
      return debouncedText.replace(re, replacement);
    } catch {
      return null;
    }
  }, [showReplace, debouncedPattern, debouncedText, flags, replacement]);

  const copyMatches = async () => {
    if (!result?.matches.length) return;
    const text = result.matches.map((m, i) => `${i + 1}: ${m.match || "(empty)"} @ ${m.index}`).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopiedMatches(true); setTimeout(() => setCopiedMatches(false), 1500);
  };

  const copyReplace = async () => {
    if (replaceResult == null) return;
    try { await navigator.clipboard.writeText(replaceResult); } catch { return; }
  };

  const hasGroups = result?.matches.some(m => m.groups.length > 0 || m.namedGroups);

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
            <input value={pattern} onChange={e => setPattern(e.target.value)}
              placeholder="pattern" spellCheck={false}
              className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-600" />
            <span className="text-slate-500 font-mono text-lg select-none">/</span>
            <div className="flex gap-1">
              {FLAG_OPTS.map(({ f, title }) => (
                <button key={f} onClick={() => toggleFlag(f)} title={title}
                  className={`w-7 h-7 rounded font-mono text-sm transition-colors ${flags.includes(f) ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {result?.error && (
            <p className="text-red-400 text-sm font-mono bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-2">{result.error}</p>
          )}

          {/* Test string */}
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Test string</label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste text to test against…" spellCheck={false}
              className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
          </div>

          {/* Highlighted preview */}
          {highlighted && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs">
                  {result?.matches.length ?? 0} match{result?.matches.length !== 1 ? "es" : ""}
                </p>
                {result && result.matches.length > 0 && (
                  <button onClick={copyMatches} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                    {copiedMatches ? "Copied!" : "Copy matches"}
                  </button>
                )}
              </div>
              <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                {highlighted.map((part, i) =>
                  part.match
                    ? part.empty
                      ? <mark key={i} className="inline-block w-px h-[1em] bg-blue-400 align-middle" />
                      : <mark key={i} className="bg-blue-500/30 text-blue-300 rounded px-0.5">{part.text}</mark>
                    : <span key={i} className="text-slate-300">{part.text}</span>
                )}
              </div>
            </div>
          )}

          {/* Match list */}
          {result && result.matches.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
              <p className="text-white text-xs font-semibold mb-3">Matches</p>
              {result.matches.map((m, i) => (
                <div key={i} className="text-xs font-mono">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-600 w-5 shrink-0 pt-0.5">{i + 1}</span>
                    <span className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded break-all">
                      {m.match || "(empty match)"}
                    </span>
                    <span className="text-slate-500 pt-0.5">@{m.index}</span>
                  </div>
                  {/* Named groups */}
                  {m.namedGroups && Object.keys(m.namedGroups).length > 0 && (
                    <div className="ml-8 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {Object.entries(m.namedGroups).map(([name, val]) => (
                        <span key={name} className="text-slate-500">
                          <span className="text-violet-400">{name}</span>: <span className="text-slate-300">{val ?? "undefined"}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Positional groups (only if no named groups) */}
                  {!m.namedGroups && m.groups.length > 0 && (
                    <div className="ml-8 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="text-slate-500">
                          <span className="text-violet-400">${gi + 1}</span>: <span className="text-slate-300">{g ?? "undefined"}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Replace mode */}
          <div>
            <button onClick={() => setShowReplace(s => !s)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors">
              <svg className={`w-3 h-3 transition-transform ${showReplace ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              Replace mode
            </button>
            {showReplace && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Replacement string <span className="text-slate-600">(use $1, $2, … or $&lt;name&gt; for groups)</span></label>
                  <input value={replacement} onChange={e => setReplacement(e.target.value)}
                    placeholder="$1 or literal text"
                    className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
                </div>
                {replaceResult !== null && (
                  <div className="relative bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <p className="text-slate-400 text-xs mb-2">Result</p>
                    <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap break-all">{replaceResult}</pre>
                    <button onClick={copyReplace}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                      Copy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick reference */}
          <details className="group">
            <summary className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer transition-colors list-none flex items-center gap-1.5">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              Quick reference
            </summary>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                [".","Any char (except newline)"], ["\\d","Digit [0-9]"], ["\\w","Word char [A-Za-z0-9_]"],
                ["\\s","Whitespace"], ["\\b","Word boundary"], ["^","Start of string / line"],
                ["$","End of string / line"], ["*","0 or more"], ["+","1 or more"],
                ["?","0 or 1 (optional)"], ["{n,m}","Between n and m times"], ["(abc)","Capture group"],
                ["(?:abc)","Non-capturing group"], ["(?<n>abc)","Named group"], ["a|b","a or b"],
                ["[abc]","Character class"], ["[^abc]","Negated class"], ["\\p{L}","Unicode letter (u flag)"],
              ].map(([sym, desc]) => (
                <div key={sym} className="flex items-start gap-2 bg-slate-900/40 rounded-lg px-2.5 py-1.5">
                  <code className="text-blue-300 font-mono text-xs shrink-0 w-20">{sym}</code>
                  <span className="text-slate-500 text-xs leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
