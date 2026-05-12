"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";

interface PdfFile {
  id: string;
  file: File;
  pages?: number;
}

export default function PdfMergePage() {
  const [pdfs, setPdfs]       = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError]     = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (valid.length === 0) return;
    setPdfs((prev) => [
      ...prev,
      ...valid.map((f) => ({ id: crypto.randomUUID(), file: f })),
    ]);
    setError("");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (id: string) => setPdfs((p) => p.filter((f) => f.id !== id));

  const moveUp   = (idx: number) => setPdfs((p) => { const n = [...p]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  const moveDown = (idx: number) => setPdfs((p) => { const n = [...p]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });

  const merge = async () => {
    if (pdfs.length < 2) { setError("Add at least 2 PDF files to merge."); return; }
    setMerging(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (const { file } of pdfs) {
        const buf = await file.arrayBuffer();
        const doc = await PDFDocument.load(buf);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }

      const bytes = await merged.save();
      const blob  = new Blob([bytes], { type: "application/pdf" });
      const link  = document.createElement("a");
      link.href   = URL.createObjectURL(blob);
      link.download = "merged.pdf";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">PDF Merge</h1>
          <p className="text-slate-500 text-sm">Combine multiple PDF files into one. Drag to reorder pages.</p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-dashed cursor-pointer transition-all mb-5 ${
            isDragging
              ? "border-blue-500/70 bg-blue-500/8 text-blue-400"
              : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <div className="text-center">
            <p className="font-medium text-sm">Drop PDF files here</p>
            <p className="text-xs opacity-60 mt-0.5">or click to browse</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* File list */}
        {pdfs.length > 0 && (
          <div className="space-y-2 mb-6">
            {pdfs.map((pdf, idx) => (
              <div key={pdf.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-red-400 text-lg shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{pdf.file.name}</p>
                  <p className="text-slate-500 text-xs">{formatBytes(pdf.file.size)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === pdfs.length - 1}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => remove(pdf.id)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors ml-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={merge}
          disabled={pdfs.length < 2 || merging}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          {merging ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Merging…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Merge &amp; Download PDF
            </>
          )}
        </button>

        {pdfs.length > 0 && (
          <p className="text-slate-600 text-xs text-center mt-3">
            {pdfs.length} file{pdfs.length !== 1 ? "s" : ""} · processed entirely in your browser
          </p>
        )}
      </div>
    </div>
  );
}
