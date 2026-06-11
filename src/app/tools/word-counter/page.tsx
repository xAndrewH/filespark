"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { CopyButton } from "@/components/CopyButton";

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []).size;
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime, uniqueWords };
  }, [text]);

  const topWords = useMemo(() => {
    const matches = text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
    const freq: Record<string, number> = {};
    for (const w of matches) freq[w] = (freq[w] ?? 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [text]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Word Counter</h1>
        <p className="text-slate-500 text-sm mb-8">Paste or type your text to get instant statistics.</p>

        <div className="space-y-5">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Start typing or paste your text here…"
              className="w-full h-56 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
            {text.length > 0 && (
              <CopyButton text={text} className="absolute top-3 right-3" />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Words",       value: stats.words },
              { label: "Characters",  value: stats.chars },
              { label: "No Spaces",   value: stats.charsNoSpace },
              { label: "Sentences",   value: stats.sentences },
              { label: "Paragraphs",  value: stats.paragraphs },
              { label: "Unique Words",value: stats.uniqueWords },
              { label: "Read Time",   value: `~${stats.readingTime} min` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white font-mono">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
            <button onClick={() => setText("")}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-center text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors text-sm">
              Clear
            </button>
          </div>

          {topWords.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">Most frequent words</p>
              <div className="flex flex-wrap gap-2">
                {topWords.map(([word, count]) => (
                  <span key={word} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
                    {word}
                    <span className="text-blue-400 font-mono">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <RelatedTools current="/tools/word-counter" />
      </div>
    </div>
  );
}
