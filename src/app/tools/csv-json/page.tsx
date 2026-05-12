"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function csvToJson(csv: string): { data: Record<string, string>[]; headers: string[] } | null {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const data = lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim().replace(/^"|"$/g, ""); });
    return row;
  });
  return { data, headers };
}

function jsonToCsv(json: string): { csv: string; headers: string[] } | null {
  try {
    const data = JSON.parse(json);
    const arr: Record<string, unknown>[] = Array.isArray(data) ? data : [data];
    const headers = [...new Set(arr.flatMap(r => Object.keys(r)))];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [headers.join(","), ...arr.map(r => headers.map(h => escape(r[h])).join(","))];
    return { csv: rows.join("\n"), headers };
  } catch {
    return null;
  }
}

export default function CsvJsonPage() {
  const [mode, setMode] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === "csv-to-json") {
      const r = csvToJson(input);
      if (!r) return null;
      return { output: JSON.stringify(r.data, null, 2), headers: r.headers, tableData: r.data };
    } else {
      const r = jsonToCsv(input);
      if (!r) return null;
      let tableData: Record<string, string>[] = [];
      try {
        const arr = JSON.parse(input);
        tableData = Array.isArray(arr) ? arr : [arr];
      } catch { /* ignore */ }
      return { output: r.csv, headers: r.headers, tableData };
    }
  }, [input, mode]);

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const switchMode = (m: typeof mode) => { setMode(m); setInput(""); };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">CSV ↔ JSON Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert between CSV and JSON with a live table preview.</p>

        <div className="space-y-5">
          <div className="flex gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
            {([["csv-to-json", "CSV → JSON"], ["json-to-csv", "JSON → CSV"]] as const).map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">{mode === "csv-to-json" ? "CSV input" : "JSON input"}</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={mode === "csv-to-json" ? "name,age,city\nAlice,30,NYC\nBob,25,LA" : '[{"name":"Alice","age":30}]'}
                spellCheck={false}
                className="w-full h-64 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <div className="relative">
              <label className="text-slate-400 text-xs mb-1.5 block">{mode === "csv-to-json" ? "JSON output" : "CSV output"}</label>
              <textarea
                readOnly
                value={result?.output ?? ""}
                placeholder="Output will appear here…"
                spellCheck={false}
                className="w-full h-64 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none placeholder-slate-600"
              />
              {result && (
                <button onClick={copy}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {result && result.tableData.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 overflow-x-auto">
              <p className="text-slate-400 text-xs mb-3">{result.tableData.length} row{result.tableData.length !== 1 ? "s" : ""}</p>
              <table className="w-full text-sm text-left min-w-max">
                <thead>
                  <tr className="border-b border-slate-800">
                    {result.headers.map(h => (
                      <th key={h} className="text-slate-400 font-medium pb-2 pr-6 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.tableData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      {result.headers.map(h => (
                        <td key={h} className="py-2 pr-6 text-slate-300 font-mono text-xs max-w-xs truncate">{String((row as Record<string, unknown>)[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.tableData.length > 50 && (
                <p className="text-slate-600 text-xs mt-2">Showing first 50 rows</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
