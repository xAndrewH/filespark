"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface PageResult { url: string; pageNum: number; width: number; height: number; }

const SCALES = [
  { label: "Standard (1×)", value: 1 },
  { label: "High (2×)",     value: 2 },
  { label: "Ultra (3×)",    value: 3 },
];
const FORMATS = ["png", "jpeg", "webp"] as const;
type Fmt = typeof FORMATS[number];

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

function dataUrlSize(url: string) {
  const base64 = url.split(",")[1] ?? "";
  return Math.round(base64.length * 0.75);
}

export default function PdfToImagesPage() {
  const [pages, setPages]         = useState<PageResult[]>([]);
  const [processing, setProc]     = useState(false);
  const [progress, setProgress]   = useState("");
  const [error, setError]         = useState("");
  const [scale, setScale]         = useState(2);
  const [fmt, setFmt]             = useState<Fmt>("png");
  const [quality, setQuality]     = useState(92);
  const [fileName, setFileName]   = useState("document");
  const [pageFrom, setPageFrom]   = useState(1);
  const [pageTo, setPageTo]       = useState<number | "">(999);
  const [totalPages, setTotal]    = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = async (file: File) => {
    setProc(true);
    setPages([]);
    setError("");
    setProgress("Loading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Use the locally served worker | avoids CDN version mismatch
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotal(pdf.numPages);

      const from  = Math.max(1, pageFrom);
      const to    = Math.min(pdf.numPages, typeof pageTo === "number" ? pageTo : pdf.numPages);
      const results: PageResult[] = [];

      for (let i = from; i <= to; i++) {
        setProgress(`Rendering page ${i - from + 1} of ${to - from + 1}…`);
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement("canvas");
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        const ctx      = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        const mime = fmt === "jpeg" ? "image/jpeg" : fmt === "webp" ? "image/webp" : "image/png";
        const url  = canvas.toDataURL(mime, fmt === "png" ? undefined : quality / 100);
        results.push({ url, pageNum: i, width: viewport.width, height: viewport.height });
      }

      setPages(results);
      setProgress("");
    } catch (e) {
      setError((e as Error).message);
      setProgress("");
    }
    setProc(false);
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file."); return;
    }
    setFileName(file.name.replace(/\.pdf$/i, ""));
    process(file);
  };

  const download = (p: PageResult) => {
    const a = document.createElement("a");
    a.href = p.url;
    a.download = `${fileName}_page_${p.pageNum}.${fmt}`;
    a.click();
  };

  const downloadAll = async () => {
    if (pages.length === 0) return;
    if (pages.length === 1) { download(pages[0]); return; }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    pages.forEach((p) => {
      const base64 = p.url.split(",")[1];
      zip.file(`${fileName}_page_${p.pageNum}.${fmt}`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}_pages.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">PDF to Images</h1>
        <p className="text-slate-500 text-sm mb-8">Convert PDF pages to PNG, JPEG, or WEBP, entirely in your browser.</p>

        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            {/* Format */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm w-24 shrink-0">Format</span>
              <div className="flex gap-2">
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => setFmt(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${fmt === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality (jpeg/webp only) */}
            {fmt !== "png" && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-24 shrink-0">Quality</span>
                <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="flex-1 accent-blue-500" />
                <span className="text-blue-400 font-mono text-sm w-10 text-right">{quality}%</span>
              </div>
            )}

            {/* Scale */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm w-24 shrink-0">Resolution</span>
              <div className="flex gap-2">
                {SCALES.map(({ label, value }) => (
                  <button key={value} onClick={() => setScale(value)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${scale === value ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page range */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm w-24 shrink-0">Pages</span>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={pageFrom} onChange={(e) => setPageFrom(Math.max(1, +e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-center" />
                <span className="text-slate-500 text-sm">to</span>
                <input type="number" min={1} value={pageTo} onChange={(e) => setPageTo(e.target.value === "" ? "" : Math.max(1, +e.target.value))}
                  placeholder="end"
                  className="w-16 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-center placeholder-slate-600" />
                {totalPages > 0 && <span className="text-slate-600 text-xs">of {totalPages}</span>}
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {processing ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">{progress}</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-slate-400 text-sm">Drop a PDF here or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">PDF files only</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (f) handleFile(f); }} />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          {/* Results */}
          {pages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{pages.length} page{pages.length !== 1 ? "s" : ""} rendered</p>
                <button onClick={downloadAll}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                  {pages.length === 1 ? "Download" : `Download all (ZIP)`}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pages.map((p) => (
                  <div key={p.pageNum} onClick={() => download(p)}
                    className="group bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 rounded-xl p-2 cursor-pointer transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Page ${p.pageNum}`} className="w-full rounded-lg object-contain border border-slate-800" />
                    <div className="mt-2 flex items-center justify-between px-1">
                      <p className="text-slate-400 text-xs">Page {p.pageNum}</p>
                      <p className="text-slate-600 text-xs">{fmtSize(dataUrlSize(p.url))}</p>
                    </div>
                    <p className="text-center text-blue-400 text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to download</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
