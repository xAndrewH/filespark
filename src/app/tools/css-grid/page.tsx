"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const CELL_COLORS = [
  "bg-blue-500/70", "bg-purple-500/70", "bg-green-500/70", "bg-orange-500/70",
  "bg-pink-500/70", "bg-cyan-500/70", "bg-yellow-500/70", "bg-red-500/70",
  "bg-indigo-500/70", "bg-teal-500/70", "bg-rose-500/70", "bg-lime-500/70",
];

export default function CssGridPage() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [columnGap, setColumnGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);
  const [templateColumns, setTemplateColumns] = useState("repeat(3, 1fr)");
  const [templateRows, setTemplateRows] = useState("repeat(3, 100px)");
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [itemCount, setItemCount] = useState(9);
  const [copied, setCopied] = useState(false);

  const effectiveCols = useCustomTemplate ? templateColumns : `repeat(${columns}, 1fr)`;
  const effectiveRows = useCustomTemplate ? templateRows : `repeat(${rows}, 100px)`;

  const css = useMemo(() => {
    return `.grid-container {
  display: grid;
  grid-template-columns: ${effectiveCols};
  grid-template-rows: ${effectiveRows};
  column-gap: ${columnGap}px;
  row-gap: ${rowGap}px;
}`;
  }, [effectiveCols, effectiveRows, columnGap, rowGap]);

  const copyCss = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">CSS Grid Builder</h1>
        <p className="text-slate-500 text-sm mb-8">Configure a CSS grid visually and copy the generated CSS.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-5">
              <h2 className="text-white text-sm font-semibold">Grid Controls</h2>

              {/* Template mode toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    role="switch"
                    aria-checked={useCustomTemplate}
                    onClick={() => setUseCustomTemplate(v => !v)}
                    className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${useCustomTemplate ? "bg-blue-600" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useCustomTemplate ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                  <span className="text-xs text-slate-400">Custom template strings</span>
                </label>
              </div>

              {!useCustomTemplate ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Columns (1–12)</label>
                    <input
                      type="number"
                      min={1} max={12}
                      value={columns}
                      onChange={e => {
                        const v = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
                        setColumns(v);
                        setItemCount(v * rows);
                      }}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Rows (1–12)</label>
                    <input
                      type="number"
                      min={1} max={12}
                      value={rows}
                      onChange={e => {
                        const v = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
                        setRows(v);
                        setItemCount(columns * v);
                      }}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">grid-template-columns</label>
                    <input
                      value={templateColumns}
                      onChange={e => setTemplateColumns(e.target.value)}
                      placeholder="repeat(3, 1fr)"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">grid-template-rows</label>
                    <input
                      value={templateRows}
                      onChange={e => setTemplateRows(e.target.value)}
                      placeholder="repeat(3, 100px)"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
              )}

              {/* Gap controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Column Gap: {columnGap}px</label>
                  <input
                    type="range"
                    min={0} max={64}
                    value={columnGap}
                    onChange={e => setColumnGap(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Row Gap: {rowGap}px</label>
                  <input
                    type="range"
                    min={0} max={64}
                    value={rowGap}
                    onChange={e => setRowGap(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Item count */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Items:</span>
                <button
                  onClick={() => setItemCount(c => Math.max(1, c - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                >−</button>
                <span className="text-white text-sm font-semibold w-6 text-center">{itemCount}</span>
                <button
                  onClick={() => setItemCount(c => Math.min(48, c + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                >+</button>
              </div>
            </div>

            {/* CSS Output */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-sm font-semibold">Generated CSS</h2>
                <button
                  onClick={copyCss}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy CSS"}
                </button>
              </div>
              <pre className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-4 text-blue-300 text-xs font-mono whitespace-pre overflow-x-auto leading-relaxed">{css}</pre>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <h2 className="text-white text-sm font-semibold">Preview</h2>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 overflow-auto">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: effectiveCols,
                  gridTemplateRows: effectiveRows,
                  columnGap: `${columnGap}px`,
                  rowGap: `${rowGap}px`,
                  minWidth: 0,
                }}
              >
                {Array.from({ length: itemCount }, (_, i) => (
                  <div
                    key={i}
                    className={`${CELL_COLORS[i % CELL_COLORS.length]} rounded-lg flex items-center justify-center text-white text-sm font-bold min-h-[60px]`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick snippets */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-white text-xs font-semibold uppercase tracking-wide">Quick Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "3-col equal", cols: "repeat(3, 1fr)", rows: "auto", items: 6 },
                  { label: "Holy Grail", cols: "200px 1fr 200px", rows: "auto 1fr auto", items: 5 },
                  { label: "2 + sidebar", cols: "1fr 300px", rows: "auto", items: 4 },
                  { label: "Masonry-like", cols: "repeat(4, 1fr)", rows: "auto", items: 8 },
                ].map(tpl => (
                  <button
                    key={tpl.label}
                    onClick={() => {
                      setUseCustomTemplate(true);
                      setTemplateColumns(tpl.cols);
                      setTemplateRows(tpl.rows);
                      setItemCount(tpl.items);
                    }}
                    className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
