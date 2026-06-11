"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

interface ImgFile {
  id: string;
  file: File;
  url: string;
}

const PAGE_SIZES = {
  a4: { label: "A4", w: 595.28, h: 841.89 },
  letter: { label: "Letter", w: 612, h: 792 },
  fit: { label: "Fit to image", w: 0, h: 0 },
} as const;
type PageSizeKey = keyof typeof PAGE_SIZES;

const MARGINS = { none: 0, small: 18, normal: 36 } as const;
type MarginKey = keyof typeof MARGINS;

export default function ImageToPdfPage() {
  const [images, setImages]         = useState<ImgFile[]>([]);
  const [pageSize, setPageSize]     = useState<PageSizeKey>("a4");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin]         = useState<MarginKey>("normal");
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) { setError("Please select image files (PNG, JPG, WEBP, or GIF)."); return; }
    setError("");
    setImages((prev) => [
      ...prev,
      ...valid.map((f) => ({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f) })),
    ]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (id: string) => setImages((prev) => {
    const target = prev.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.url);
    return prev.filter((i) => i.id !== id);
  });

  const moveUp   = (idx: number) => setImages((p) => { const n = [...p]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  const moveDown = (idx: number) => setImages((p) => { const n = [...p]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });

  // pdf-lib only embeds PNG and JPEG directly | everything else (WEBP, GIF, …)
  // gets re-encoded to PNG via canvas first.
  const loadImage = (file: File): Promise<{ bytes: Uint8Array; width: number; height: number; isPng: boolean }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        try {
          if (file.type === "image/png" || file.type === "image/jpeg") {
            const buf = new Uint8Array(await file.arrayBuffer());
            resolve({ bytes: buf, width: img.naturalWidth, height: img.naturalHeight, isPng: file.type === "image/png" });
          } else {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const blob: Blob = await new Promise((res, rej) =>
              canvas.toBlob((b) => (b ? res(b) : rej(new Error("Failed to encode image"))), "image/png")
            );
            const buf = new Uint8Array(await blob.arrayBuffer());
            resolve({ bytes: buf, width: img.naturalWidth, height: img.naturalHeight, isPng: true });
          }
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)); };
      img.src = url;
    });
  };

  const convert = async () => {
    if (images.length === 0) { setError("Add at least one image."); return; }
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const marginPt = MARGINS[margin];

      for (const { file } of images) {
        const { bytes, width, height, isPng } = await loadImage(file);
        const embedded = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

        let pageW: number, pageH: number;
        if (pageSize === "fit") {
          pageW = width + marginPt * 2;
          pageH = height + marginPt * 2;
        } else {
          const base = PAGE_SIZES[pageSize];
          const portrait = orientation === "portrait" || (orientation === "auto" && height >= width);
          pageW = portrait ? base.w : base.h;
          pageH = portrait ? base.h : base.w;
        }

        const page = pdf.addPage([pageW, pageH]);
        const availW = pageW - marginPt * 2;
        const availH = pageH - marginPt * 2;
        const scale = Math.min(availW / width, availH / height);
        const drawW = width * scale;
        const drawH = height * scale;
        page.drawImage(embedded, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const out = await pdf.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setProcessing(false);
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
          <h1 className="text-3xl font-bold text-white mb-1">Image to PDF</h1>
          <p className="text-slate-500 text-sm">Combine JPG, PNG, WEBP, or GIF images into a single PDF. Drag to reorder pages.</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-18 0V6A2.25 2.25 0 015.25 3.75h13.5A2.25 2.25 0 0121 6v10.5m-18 0h18" />
          </svg>
          <div className="text-center">
            <p className="font-medium text-sm">Drop images here</p>
            <p className="text-xs opacity-60 mt-0.5">or click to browse — JPG, PNG, WEBP, GIF</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div className="space-y-2 mb-6">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.file.name} className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{img.file.name}</p>
                  <p className="text-slate-500 text-xs">{formatBytes(img.file.size)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1}
                    className="p-1 text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button onClick={() => remove(img.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors ml-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 text-sm w-24 shrink-0">Page size</span>
            <div className="flex gap-2">
              {(Object.entries(PAGE_SIZES) as [PageSizeKey, typeof PAGE_SIZES[PageSizeKey]][]).map(([key, { label }]) => (
                <button key={key} onClick={() => setPageSize(key)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${pageSize === key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {pageSize !== "fit" && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm w-24 shrink-0">Orientation</span>
              <div className="flex gap-2">
                {([["auto", "Auto"], ["portrait", "Portrait"], ["landscape", "Landscape"]] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setOrientation(key)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${orientation === key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 text-sm w-24 shrink-0">Margin</span>
            <div className="flex gap-2">
              {(Object.keys(MARGINS) as MarginKey[]).map((key) => (
                <button key={key} onClick={() => setMargin(key)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${margin === key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ErrorAlert message={error} className="mb-4" />

        <button
          onClick={convert}
          disabled={images.length === 0 || processing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          {processing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Building PDF…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Convert to PDF
            </>
          )}
        </button>

        {images.length > 0 && (
          <p className="text-slate-500 text-xs text-center mt-3">
            {images.length} image{images.length !== 1 ? "s" : ""} · processed entirely in your browser
          </p>
        )}

        <RelatedTools current="/tools/image-to-pdf" />
      </div>
    </div>
  );
}
