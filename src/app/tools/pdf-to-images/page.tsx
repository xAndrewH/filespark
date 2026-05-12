"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface PageResult {
  url: string;
  pageNum: number;
}

export default function PdfToImagesPage() {
  const [pages, setPages] = useState<PageResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [scale, setScale] = useState(2);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = async (file: File) => {
    setProcessing(true);
    setPages([]);
    setProgress("Loading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const results: PageResult[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdf.numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        results.push({ url: canvas.toDataURL("image/png"), pageNum: i });
      }

      setPages(results);
      setProgress("");
    } catch (e) {
      setProgress(`Error: ${(e as Error).message}`);
    }
    setProcessing(false);
  };

  const download = (p: PageResult, fileName: string) => {
    const a = document.createElement("a");
    a.href = p.url;
    a.download = `${fileName.replace(/\.pdf$/i, "")}_page_${p.pageNum}.png`;
    a.click();
  };

  const downloadAll = (fileName: string) => pages.forEach(p => download(p, fileName));
  const [fileName, setFileName] = useState("document");

  const handleFile = (file: File) => {
    setFileName(file.name);
    process(file);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">PDF to Images</h1>
        <p className="text-slate-500 text-sm mb-8">Convert each PDF page to a PNG image, entirely in your browser.</p>

        <div className="space-y-5">
          {/* Scale */}
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Output quality</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <button key={s} onClick={() => setScale(s)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${scale === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {s === 1 ? "Standard" : s === 2 ? "High" : "Ultra"}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type === "application/pdf") handleFile(f); }}>
            {processing ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">{progress}</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm">Drop a PDF here or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">PDF files only</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Pages */}
          {pages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
                {pages.length > 1 && (
                  <button onClick={() => downloadAll(fileName)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                    Download all
                  </button>
                )}
              </div>
              {pages.map(p => (
                <div key={p.pageNum} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Page ${p.pageNum}`} className="w-16 h-20 object-cover rounded border border-slate-700 shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Page {p.pageNum}</p>
                  </div>
                  <button onClick={() => download(p, fileName)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
