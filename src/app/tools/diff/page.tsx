"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

type DiffLine = { type: "same" | "added" | "removed"; text: string; leftNum?: number; rightNum?: number };
type WordToken = { text: string; type: "same" | "removed" | "added" };

function diff(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const m = aLines.length, n = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const result: DiffLine[] = [];
  let i = 0, j = 0, leftNum = 1, rightNum = 1;
  while (i < m || j < n) {
    if (i < m && j < n && aLines[i] === bLines[j]) {
      result.push({ type: "same", text: aLines[i], leftNum: leftNum++, rightNum: rightNum++ });
      i++; j++;
    } else if (j < n && (i >= m || dp[i + 1][j] >= dp[i][j + 1])) {
      result.push({ type: "added", text: bLines[j], rightNum: rightNum++ });
      j++;
    } else {
      result.push({ type: "removed", text: aLines[i], leftNum: leftNum++ });
      i++;
    }
  }
  return result;
}

function tokenize(s: string): string[] {
  return s.split(/(\s+)/).filter(t => t.length > 0);
}

function wordDiff(a: string, b: string): { left: WordToken[]; right: WordToken[] } {
  const aT = tokenize(a);
  const bT = tokenize(b);
  const m = aT.length, n = bT.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = aT[i] === bT[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const left: WordToken[] = [];
  const right: WordToken[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && aT[i] === bT[j]) {
      left.push({ text: aT[i], type: "same" });
      right.push({ text: bT[j], type: "same" });
      i++; j++;
    } else if (j < n && (i >= m || dp[i + 1][j] >= dp[i][j + 1])) {
      right.push({ text: bT[j], type: "added" });
      j++;
    } else {
      left.push({ text: aT[i], type: "removed" });
      i++;
    }
  }
  return { left, right };
}

type SplitRow =
  | { kind: "same"; text: string; leftNum: number; rightNum: number }
  | { kind: "change"; leftTokens: WordToken[]; rightTokens: WordToken[]; leftNum: number; rightNum: number }
  | { kind: "removed"; text: string; leftNum: number }
  | { kind: "added"; text: string; rightNum: number };

function buildSplitRows(lines: DiffLine[]): SplitRow[] {
  const result: SplitRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.type === "same") {
      result.push({ kind: "same", text: l.text, leftNum: l.leftNum!, rightNum: l.rightNum! });
      i++;
    } else if (l.type === "removed") {
      const removedRun: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "removed") removedRun.push(lines[i++]);
      const addedRun: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "added") addedRun.push(lines[i++]);
      const pairCount = Math.min(removedRun.length, addedRun.length);
      for (let k = 0; k < pairCount; k++) {
        const { left, right } = wordDiff(removedRun[k].text, addedRun[k].text);
        result.push({ kind: "change", leftTokens: left, rightTokens: right, leftNum: removedRun[k].leftNum!, rightNum: addedRun[k].rightNum! });
      }
      for (let k = pairCount; k < removedRun.length; k++)
        result.push({ kind: "removed", text: removedRun[k].text, leftNum: removedRun[k].leftNum! });
      for (let k = pairCount; k < addedRun.length; k++)
        result.push({ kind: "added", text: addedRun[k].text, rightNum: addedRun[k].rightNum! });
    } else {
      result.push({ kind: "added", text: l.text, rightNum: l.rightNum! });
      i++;
    }
  }
  return result;
}

function InlineText({ tokens, side }: { tokens: WordToken[]; side: "left" | "right" }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (/^\s+$/.test(t.text)) return <span key={i}>{t.text}</span>;
        if (t.type === "same") return <span key={i}>{t.text}</span>;
        if (side === "left" && t.type === "removed")
          return <span key={i} className="bg-red-500/40 text-red-200 rounded-sm px-0.5">{t.text}</span>;
        if (side === "right" && t.type === "added")
          return <span key={i} className="bg-green-500/40 text-green-200 rounded-sm px-0.5">{t.text}</span>;
        return <span key={i}>{t.text}</span>;
      })}
    </>
  );
}

export default function DiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "inline">("split");
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => (left || right) ? diff(left, right) : [], [left, right]);
  const added = lines.filter(l => l.type === "added").length;
  const removed = lines.filter(l => l.type === "removed").length;
  const splitRows = useMemo(() => buildSplitRows(lines), [lines]);

  const copyDiff = useCallback(async () => {
    const patch = lines
      .map(l => (l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  ") + l.text)
      .join("\n");
    try {
      await navigator.clipboard.writeText(patch);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }, [lines]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Text Diff Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Paste two blocks of text and see exactly what changed, word by word.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {([["Original", left, setLeft], ["Modified", right, setRight]] as const).map(([label, val, set]) => (
            <div key={label}>
              <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
              <textarea
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={`Paste ${label.toLowerCase()} text here…`}
                spellCheck={false}
                className="w-full h-48 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-5 text-sm flex-wrap">
              <span className="text-slate-500 text-xs">{lines.filter(l => l.type === "same").length} unchanged</span>
              {removed > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/30" />
                  <span className="text-red-400">{removed} removed</span>
                </span>
              )}
              {added > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500/40 border border-green-500/30" />
                  <span className="text-green-400">{added} added</span>
                </span>
              )}
              {added === 0 && removed === 0 && <span className="text-slate-400 text-xs">No differences found</span>}
              <div className="ml-auto flex gap-1">
                {(added > 0 || removed > 0) && (
                  <button onClick={copyDiff}
                    className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    {copied ? "Copied" : "Copy diff"}
                  </button>
                )}
                {(["split", "inline"] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${viewMode === m ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === "split" ? (
              /* Split diff view */
              <div className="rounded-xl overflow-hidden border border-slate-800/60">
                <div className="grid grid-cols-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-r border-slate-800/60">
                    <span className="text-slate-400 text-xs font-medium">Original</span>
                    {removed > 0 && <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">−{removed}</span>}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80">
                    <span className="text-slate-400 text-xs font-medium">Modified</span>
                    {added > 0 && <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">+{added}</span>}
                  </div>
                </div>
                <div className="text-xs font-mono">
                  {splitRows.map((row, ri) => {
                    if (row.kind === "same") {
                      return (
                        <div key={ri} className="grid grid-cols-2 border-b border-slate-800/30 last:border-0">
                          <div className="flex border-r border-slate-800/60">
                            <span className="w-10 text-right px-2 py-1 text-slate-700 select-none tabular-nums shrink-0 border-r border-slate-800/40">{row.leftNum}</span>
                            <span className="px-3 py-1 text-slate-500 whitespace-pre-wrap break-all">{row.text || " "}</span>
                          </div>
                          <div className="flex">
                            <span className="w-10 text-right px-2 py-1 text-slate-700 select-none tabular-nums shrink-0 border-r border-slate-800/40">{row.rightNum}</span>
                            <span className="px-3 py-1 text-slate-500 whitespace-pre-wrap break-all">{row.text || " "}</span>
                          </div>
                        </div>
                      );
                    }
                    if (row.kind === "change") {
                      return (
                        <div key={ri} className="grid grid-cols-2 border-b border-slate-800/30 last:border-0">
                          <div className="flex bg-red-500/8 border-r border-slate-800/60">
                            <span className="w-10 text-right px-2 py-1 text-red-700 select-none tabular-nums shrink-0 border-r border-red-900/40 bg-red-500/10">{row.leftNum}</span>
                            <span className="px-3 py-1 text-slate-300 whitespace-pre-wrap break-all"><InlineText tokens={row.leftTokens} side="left" /></span>
                          </div>
                          <div className="flex bg-green-500/8">
                            <span className="w-10 text-right px-2 py-1 text-green-700 select-none tabular-nums shrink-0 border-r border-green-900/40 bg-green-500/10">{row.rightNum}</span>
                            <span className="px-3 py-1 text-slate-300 whitespace-pre-wrap break-all"><InlineText tokens={row.rightTokens} side="right" /></span>
                          </div>
                        </div>
                      );
                    }
                    if (row.kind === "removed") {
                      return (
                        <div key={ri} className="grid grid-cols-2 border-b border-slate-800/30 last:border-0">
                          <div className="flex bg-red-500/8 border-r border-slate-800/60">
                            <span className="w-10 text-right px-2 py-1 text-red-700 select-none tabular-nums shrink-0 border-r border-red-900/40 bg-red-500/10">{row.leftNum}</span>
                            <span className="px-3 py-1 text-red-300 whitespace-pre-wrap break-all">{row.text || " "}</span>
                          </div>
                          <div className="flex bg-slate-900/20">
                            <span className="w-10 shrink-0 border-r border-slate-800/40" />
                            <span className="px-3 py-1" />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={ri} className="grid grid-cols-2 border-b border-slate-800/30 last:border-0">
                        <div className="flex bg-slate-900/20 border-r border-slate-800/60">
                          <span className="w-10 shrink-0 border-r border-slate-800/40" />
                          <span className="px-3 py-1" />
                        </div>
                        <div className="flex bg-green-500/8">
                          <span className="w-10 text-right px-2 py-1 text-green-700 select-none tabular-nums shrink-0 border-r border-green-900/40 bg-green-500/10">{row.rightNum}</span>
                          <span className="px-3 py-1 text-green-300 whitespace-pre-wrap break-all">{row.text || " "}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Inline diff view */
              <div className="rounded-xl overflow-hidden border border-slate-800/60">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 border-b border-slate-800/60">
                  <span className="text-slate-400 text-xs font-medium">Inline comparison</span>
                  <span className="text-xs text-red-400 font-mono">− Original</span>
                  <span className="text-xs text-green-400 font-mono">+ Modified</span>
                </div>
                <div className="text-xs font-mono">
                  {splitRows.map((row, ri) => {
                    if (row.kind === "same") return (
                      <div key={ri} className="flex border-b border-slate-800/20 last:border-0">
                        <span className="w-8 text-right px-2 py-1 text-slate-700 select-none tabular-nums shrink-0 border-r border-slate-800/40">{row.leftNum}</span>
                        <span className="w-5 text-center py-1 text-slate-700 select-none shrink-0 border-r border-slate-800/40"> </span>
                        <span className="px-3 py-1 text-slate-500 whitespace-pre-wrap break-all flex-1">{row.text || " "}</span>
                      </div>
                    );
                    if (row.kind === "change") return (
                      <div key={ri}>
                        <div className="flex bg-red-500/8 border-b border-red-900/20">
                          <span className="w-8 text-right px-2 py-1 text-red-700 select-none tabular-nums shrink-0 border-r border-red-900/30 bg-red-500/10">{row.leftNum}</span>
                          <span className="w-5 text-center py-1 text-red-600 select-none shrink-0 border-r border-red-900/30 bg-red-500/10">−</span>
                          <span className="px-3 py-1 text-slate-300 whitespace-pre-wrap break-all flex-1"><InlineText tokens={row.leftTokens} side="left" /></span>
                        </div>
                        <div className="flex bg-green-500/8 border-b border-green-900/20">
                          <span className="w-8 text-right px-2 py-1 text-green-700 select-none tabular-nums shrink-0 border-r border-green-900/30 bg-green-500/10">{row.rightNum}</span>
                          <span className="w-5 text-center py-1 text-green-600 select-none shrink-0 border-r border-green-900/30 bg-green-500/10">+</span>
                          <span className="px-3 py-1 text-slate-300 whitespace-pre-wrap break-all flex-1"><InlineText tokens={row.rightTokens} side="right" /></span>
                        </div>
                      </div>
                    );
                    if (row.kind === "removed") return (
                      <div key={ri} className="flex bg-red-500/8 border-b border-red-900/20 last:border-0">
                        <span className="w-8 text-right px-2 py-1 text-red-700 select-none tabular-nums shrink-0 border-r border-red-900/30 bg-red-500/10">{row.leftNum}</span>
                        <span className="w-5 text-center py-1 text-red-600 select-none shrink-0 border-r border-red-900/30 bg-red-500/10">−</span>
                        <span className="px-3 py-1 text-red-300 whitespace-pre-wrap break-all flex-1">{row.text || " "}</span>
                      </div>
                    );
                    return (
                      <div key={ri} className="flex bg-green-500/8 border-b border-green-900/20 last:border-0">
                        <span className="w-8 text-right px-2 py-1 text-green-700 select-none tabular-nums shrink-0 border-r border-green-900/30 bg-green-500/10">{row.rightNum}</span>
                        <span className="w-5 text-center py-1 text-green-600 select-none shrink-0 border-r border-green-900/30 bg-green-500/10">+</span>
                        <span className="px-3 py-1 text-green-300 whitespace-pre-wrap break-all flex-1">{row.text || " "}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
