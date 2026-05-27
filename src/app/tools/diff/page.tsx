"use client";

import { useState, useMemo } from "react";
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

type GroupedLine =
  | { kind: "same"; line: DiffLine }
  | { kind: "change"; removed: DiffLine; added: DiffLine }
  | { kind: "removed"; line: DiffLine }
  | { kind: "added"; line: DiffLine };

function groupLines(lines: DiffLine[]): GroupedLine[] {
  const result: GroupedLine[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].type === "same") {
      result.push({ kind: "same", line: lines[i++] });
    } else if (lines[i].type === "removed") {
      const removedRun: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "removed") removedRun.push(lines[i++]);
      const addedRun: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "added") addedRun.push(lines[i++]);
      const pairCount = Math.min(removedRun.length, addedRun.length);
      for (let k = 0; k < pairCount; k++)
        result.push({ kind: "change", removed: removedRun[k], added: addedRun[k] });
      for (let k = pairCount; k < removedRun.length; k++)
        result.push({ kind: "removed", line: removedRun[k] });
      for (let k = pairCount; k < addedRun.length; k++)
        result.push({ kind: "added", line: addedRun[k] });
    } else {
      result.push({ kind: "added", line: lines[i++] });
    }
  }
  return result;
}

function InlineTokens({ tokens, side }: { tokens: WordToken[]; side: "left" | "right" }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (/^\s+$/.test(t.text)) return <span key={i}>{t.text}</span>;
        if (t.type === "same") return <span key={i} className="text-slate-300">{t.text}</span>;
        if (side === "left" && t.type === "removed")
          return <span key={i} className="line-through text-red-300 bg-red-500/25 rounded px-0.5">{t.text}</span>;
        if (side === "right" && t.type === "added")
          return <span key={i} className="text-green-200 bg-green-500/30 rounded px-0.5">{t.text}</span>;
        return null;
      })}
    </>
  );
}

export default function DiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const lines = useMemo(() => (left || right) ? diff(left, right) : [], [left, right]);
  const added = lines.filter(l => l.type === "added").length;
  const removed = lines.filter(l => l.type === "removed").length;
  const grouped = useMemo(() => groupLines(lines), [lines]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Text Diff Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Paste two blocks of text and see exactly what changed — word by word.</p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {([["Original", left, setLeft], ["Modified", right, setRight]] as const).map(([label, val, set]) => (
            <div key={label}>
              <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
              <textarea
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={`Paste ${label.toLowerCase()} text here…`}
                spellCheck={false}
                className="w-full h-52 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">{lines.length} lines</span>
              {added > 0 && <span className="text-green-400">+{added} added</span>}
              {removed > 0 && <span className="text-red-400">−{removed} removed</span>}
              {added === 0 && removed === 0 && <span className="text-slate-400">No differences</span>}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-red-500/25 border border-red-500/30" /> deleted</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-green-500/30 border border-green-500/30" /> inserted</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
              <table className="w-full text-xs font-mono">
                <tbody>
                  {grouped.map((g, gi) => {
                    if (g.kind === "same") {
                      return (
                        <tr key={gi}>
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.line.leftNum ?? ""}</td>
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.line.rightNum ?? ""}</td>
                          <td className="px-3 py-1 w-6 select-none text-slate-700"> </td>
                          <td className="px-3 py-1 text-slate-400 whitespace-pre-wrap break-all">{g.line.text || " "}</td>
                        </tr>
                      );
                    }
                    if (g.kind === "removed") {
                      return (
                        <tr key={gi} className="bg-red-500/10">
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.line.leftNum ?? ""}</td>
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums"></td>
                          <td className="px-3 py-1 w-6 select-none font-bold text-red-400">−</td>
                          <td className="px-3 py-1 text-red-300 whitespace-pre-wrap break-all line-through">{g.line.text || " "}</td>
                        </tr>
                      );
                    }
                    if (g.kind === "added") {
                      return (
                        <tr key={gi} className="bg-green-500/10">
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums"></td>
                          <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.line.rightNum ?? ""}</td>
                          <td className="px-3 py-1 w-6 select-none font-bold text-green-400">+</td>
                          <td className="px-3 py-1 text-green-300 whitespace-pre-wrap break-all">{g.line.text || " "}</td>
                        </tr>
                      );
                    }
                    // change — word-level inline diff
                    const { left: leftTokens, right: rightTokens } = wordDiff(g.removed.text, g.added.text);
                    return [
                      <tr key={`${gi}-r`} className="bg-red-500/10">
                        <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.removed.leftNum ?? ""}</td>
                        <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums"></td>
                        <td className="px-3 py-1 w-6 select-none font-bold text-red-400">−</td>
                        <td className="px-3 py-1 whitespace-pre-wrap break-all"><InlineTokens tokens={leftTokens} side="left" /></td>
                      </tr>,
                      <tr key={`${gi}-a`} className="bg-green-500/10">
                        <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums"></td>
                        <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">{g.added.rightNum ?? ""}</td>
                        <td className="px-3 py-1 w-6 select-none font-bold text-green-400">+</td>
                        <td className="px-3 py-1 whitespace-pre-wrap break-all"><InlineTokens tokens={rightTokens} side="right" /></td>
                      </tr>,
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
