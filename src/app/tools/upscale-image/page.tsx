"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Download, ImageIcon } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

type Scale = 2 | 3 | 4;
type Algorithm = "bilinear" | "nearest";

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

interface Dims {
  w: number;
  h: number;
}

export default function UpscaleImagePage() {
  const [file, setFile]               = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [scale, setScale]             = useState<Scale>(2);
  const [algorithm, setAlgorithm]     = useState<Algorithm>("bilinear");
  const [processing, setProcessing]   = useState(false);
  const [resultUrl, setResultUrl]     = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<Dims | null>(null);
  const [newDims, setNewDims]         = useState<Dims | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [resultSize, setResultSize]   = useState<number | null>(null);
  const [error, setError]             = useState("");
  const fileRef                       = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setError("");
    setResultUrl(null);
    setNewDims(null);
    setResultSize(null);

    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is larger than 10MB. Large files may be slow to process.");
    }

    setFile(f);
    setOriginalSize(f.size);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
      setPreviewUrl(URL.createObjectURL(f));
    };
    img.src = url;
  };

  const upscale = useCallback(async () => {
    if (!file || !originalDims) return;
    setProcessing(true);
    setError("");
    setResultUrl(null);

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 10));

      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      const outW = originalDims.w * scale;
      const outH = originalDims.h * scale;
      setNewDims({ w: outW, h: outH });

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      if (algorithm === "nearest") {
        ctx.imageSmoothingEnabled = false;
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }

      ctx.drawImage(img, 0, 0, outW, outH);
      URL.revokeObjectURL(url);

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) { setError("Failed to generate output."); resolve(); return; }
          const outUrl = URL.createObjectURL(blob);
          setResultUrl(outUrl);
          setResultSize(blob.size);
          resolve();
        }, "image/png");
      });
    } catch (e) {
      setError((e as Error).message);
    }

    setProcessing(false);
  }, [file, originalDims, scale, algorithm]);

  const download = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    const ext = file.name.replace(/\.[^.]+$/, "");
    a.href = resultUrl;
    a.download = `${ext}-${scale}x.png`;
    a.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Upscale Image</h1>
        <p className="text-slate-500 text-sm mb-8">Enlarge images up to 4× in your browser. No uploads, no servers.</p>

        <div className="space-y-4">
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Drop an image or <span className="text-blue-400">browse</span></p>
            <p className="text-slate-600 text-xs mt-1">PNG · JPG · WEBP</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { loadFile(f); e.target.value = ""; } }}
            />
          </div>

          <ErrorAlert message={error} />

          {file && originalDims && (
            <>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
                <div className="flex gap-4 items-start">
                  {previewUrl && (
                    <div className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Original" className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
                      <p className="text-slate-600 text-xs mt-1 text-center">Original</p>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-slate-500 text-xs">{originalDims.w} × {originalDims.h} px</p>
                    {originalSize !== null && <p className="text-slate-500 text-xs">{fmtSize(originalSize)}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs block">Scale factor</label>
                  <div className="flex gap-2">
                    {([2, 3, 4] as Scale[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => { setScale(s); setResultUrl(null); setNewDims(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${scale === s ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs block">Algorithm</label>
                  <div className="flex gap-2">
                    {([
                      { id: "bilinear" as Algorithm, label: "Smooth (Bilinear)" },
                      { id: "nearest" as Algorithm, label: "Crisp (Nearest Neighbor)" },
                    ]).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setAlgorithm(a.id); setResultUrl(null); setNewDims(null); }}
                        className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${algorithm === a.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-800/60 rounded-lg px-3 py-3">
                    <p className="text-slate-500 text-xs mb-1">Original</p>
                    <p className="text-white text-sm font-medium">{originalDims.w} × {originalDims.h}</p>
                    {originalSize !== null && <p className="text-slate-500 text-xs mt-0.5">{fmtSize(originalSize)}</p>}
                  </div>
                  <div className="bg-slate-800/60 rounded-lg px-3 py-3">
                    <p className="text-slate-500 text-xs mb-1">Output ({scale}×)</p>
                    <p className="text-blue-300 text-sm font-medium">{originalDims.w * scale} × {originalDims.h * scale}</p>
                    {resultSize !== null && <p className="text-slate-500 text-xs mt-0.5">{fmtSize(resultSize)}</p>}
                  </div>
                </div>

                <button
                  onClick={upscale}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Upscaling…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upscale {scale}×
                    </>
                  )}
                </button>
              </div>

              {resultUrl && newDims && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300 text-sm font-medium">Result</p>
                    <span className="text-green-400 text-xs">{newDims.w} × {newDims.h} px</span>
                  </div>
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ background: "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 0 0 / 16px 16px" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="Upscaled" className="max-w-full block mx-auto" style={{ maxHeight: 300, objectFit: "contain" }} />
                  </div>
                  {resultSize !== null && originalSize !== null && (
                    <p className="text-slate-500 text-xs text-center">
                      {fmtSize(originalSize)} → {fmtSize(resultSize)}
                    </p>
                  )}
                  <button
                    onClick={download}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <RelatedTools current="/tools/upscale-image" />
      </div>
    </div>
  );
}
