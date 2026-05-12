"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type DiffLine = { type: "same" | "added" | "removed"; text: string; leftNum?: number; rightNum?: number };

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

export default function DiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const lines = useMemo(() => (left || right) ? diff(left, right) : [], [left, right]);
  const added = lines.filter(l => l.type === "added").length;
  const removed = lines.filter(l => l.type === "removed").length;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Text Diff Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Paste two blocks of text and see exactly what changed.</p>

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

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
              <table className="w-full text-xs font-mono">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className={
                      line.type === "added" ? "bg-green-500/10" :
                      line.type === "removed" ? "bg-red-500/10" : ""
                    }>
                      <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">
                        {line.leftNum ?? ""}
                      </td>
                      <td className="text-slate-600 text-right px-3 py-1 select-none w-10 border-r border-slate-800 tabular-nums">
                        {line.rightNum ?? ""}
                      </td>
                      <td className={`px-3 py-1 w-6 select-none font-bold ${
                        line.type === "added" ? "text-green-400" :
                        line.type === "removed" ? "text-red-400" : "text-slate-700"
                      }`}>
                        {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                      </td>
                      <td className={`px-3 py-1 whitespace-pre-wrap break-all ${
                        line.type === "added" ? "text-green-300" :
                        line.type === "removed" ? "text-red-300" : "text-slate-300"
                      }`}>
                        {line.text || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
