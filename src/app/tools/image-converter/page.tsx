"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

const FORMATS = [
  { id: "png",  label: "PNG",  mime: "image/png",  ext: "png" },
  { id: "jpeg", label: "JPG",  mime: "image/jpeg", ext: "jpg" },
  { id: "webp", label: "WEBP", mime: "image/webp", ext: "webp" },
] as const;
type Fmt = typeof FORMATS[number]["id"];

interface ImgFile {
  id: string;
  file: File;
  status: "pending" | "done" | "error";
  resultUrl?: string;
  resultSize?: number;
  error?: string;
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export default function ImageConverterPage() {
  const [images, setImages]     = useState<ImgFile[]>([]);
  const [format, setFormat]     = useState<Fmt>("png");
  const [quality, setQuality]   = useState(85);
  const [processing, setProcessing] = useState(false);
  const [error, setError]       = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fmt = FORMATS.find((f) => f.id === format)!;

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) { setError("Please select image files (PNG, JPG, WEBP, GIF, BMP)."); return; }
    setError("");
    setImages((prev) => [
      ...prev,
      ...valid.map((f) => ({ id: crypto.randomUUID(), file: f, status: "pending" as const })),
    ]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (id: string) => setImages((prev) => {
    const target = prev.find((i) => i.id === id);
    if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
    return prev.filter((i) => i.id !== id);
  });

  const clearAll = () => {
    images.forEach((i) => { if (i.resultUrl) URL.revokeObjectURL(i.resultUrl); });
    setImages([]);
    setError("");
  };

  const convertOne = (file: File): Promise<{ url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        if (fmt.id === "jpeg") {
          // JPEG has no alpha channel | flatten onto white first.
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          resolve({ url: URL.createObjectURL(blob), size: blob.size });
        }, fmt.mime, fmt.id === "png" ? undefined : quality / 100);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)); };
      img.src = url;
    });
  };

  const convertAll = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError("");

    images.forEach((i) => { if (i.resultUrl) URL.revokeObjectURL(i.resultUrl); });
    setImages((prev) => prev.map((i) => ({ ...i, status: "pending", resultUrl: undefined, resultSize: undefined, error: undefined })));

    for (const item of images) {
      try {
        const { url, size } = await convertOne(item.file);
        setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "done", resultUrl: url, resultSize: size } : i));
      } catch (e) {
        setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "error", error: (e as Error).message } : i));
      }
    }
    setProcessing(false);
  };

  const downloadOne = (item: ImgFile) => {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = `${baseName(item.file.name)}.${fmt.ext}`;
    a.click();
  };

  const downloadAll = async () => {
    const done = images.filter((i) => i.status === "done" && i.resultUrl);
    if (done.length === 0) return;
    if (done.length === 1) { downloadOne(done[0]); return; }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const item of done) {
      const blob = await fetch(item.resultUrl!).then((r) => r.blob());
      zip.file(`${baseName(item.file.name)}.${fmt.ext}`, blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `converted-${fmt.ext}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doneCount = images.filter((i) => i.status === "done").length;

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
          <h1 className="text-3xl font-bold text-white mb-1">Image Converter</h1>
          <p className="text-slate-500 text-sm">Convert images between PNG, JPG, and WEBP, in bulk, entirely in your browser.</p>
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
            <p className="text-xs opacity-60 mt-0.5">or click to browse — PNG, JPG, WEBP, GIF, BMP</p>
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

        {/* Options */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 text-sm w-24 shrink-0">Convert to</span>
            <div className="flex gap-2">
              {FORMATS.map(({ id, label }) => (
                <button key={id} onClick={() => setFormat(id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${format === id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {format !== "png" && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm w-24 shrink-0">Quality</span>
              <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="flex-1 accent-blue-500" />
              <span className="text-blue-400 font-mono text-sm w-10 text-right">{quality}%</span>
            </div>
          )}
        </div>

        <ErrorAlert message={error} className="mb-4" />

        {/* File list */}
        {images.length > 0 && (
          <div className="space-y-2 mb-5">
            {images.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{item.file.name}</p>
                  <p className="text-slate-500 text-xs">
                    {formatBytes(item.file.size)}
                    {item.status === "done" && item.resultSize !== undefined && (
                      <> → <span className="text-green-400">{formatBytes(item.resultSize)}</span></>
                    )}
                    {item.status === "error" && <span className="text-red-400"> · {item.error}</span>}
                  </p>
                </div>
                {item.status === "done" ? (
                  <button onClick={() => downloadOne(item)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors shrink-0">
                    Download
                  </button>
                ) : item.status === "pending" && processing ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : null}
                <button onClick={() => remove(item.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={convertAll}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              {processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Converting…
                </>
              ) : (
                `Convert ${images.length} image${images.length !== 1 ? "s" : ""} to ${fmt.label}`
              )}
            </button>
            {doneCount > 0 && (
              <button onClick={downloadAll}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-sm font-medium rounded-xl transition-colors">
                {doneCount === 1 ? "Download" : "Download all (ZIP)"}
              </button>
            )}
            <button onClick={clearAll}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-white text-sm font-medium rounded-xl transition-colors">
              Clear
            </button>
          </div>
        )}

        <RelatedTools current="/tools/image-converter" />
      </div>
    </div>
  );
}
