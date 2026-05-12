"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileItem, Category, ConversionMode } from "@/types";
import { detectCategory, getDefaultOutput, needsLibreOffice, needsImageMagick } from "@/lib/formats";
import { generateId, getExtension, replaceExtension } from "@/lib/utils";
import { addHistoryEntry, getHistory } from "@/lib/history";
import Navbar from "@/components/Navbar";
import FileDropzone from "@/components/FileDropzone";
import FileCard from "@/components/FileCard";
import FormatsSection from "@/components/FormatsSection";
import HistoryDrawer from "@/components/HistoryDrawer";

/* ── Rotating conversion examples ───────────────────────────── */
const EXAMPLES = [
  { from: "PDF",  to: "DOCX", fromColor: "from-red-500/20",     toColor: "from-blue-500/20"    },
  { from: "MP4",  to: "MP3",  fromColor: "from-violet-500/20",  toColor: "from-green-500/20"   },
  { from: "HEIC", to: "JPG",  fromColor: "from-amber-500/20",   toColor: "from-sky-500/20"     },
  { from: "PNG",  to: "WEBP", fromColor: "from-emerald-500/20", toColor: "from-pink-500/20"    },
  { from: "EPUB", to: "MOBI", fromColor: "from-cyan-500/20",    toColor: "from-orange-500/20"  },
  { from: "ZIP",  to: "7Z",   fromColor: "from-slate-500/20",   toColor: "from-indigo-500/20"  },
];

const FORMAT_EMOJI: Record<string, string> = {
  PDF: "📄", DOCX: "📝", MP4: "🎬", MP3: "🎵", HEIC: "🖼️",
  JPG: "🖼️", PNG: "🖼️", WEBP: "🖼️", EPUB: "📚", MOBI: "📚",
  ZIP: "📦", "7Z": "📦",
};

function ConversionPreview() {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % EXAMPLES.length);
        setVisible(true);
      }, 280);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const ex = EXAMPLES[idx];

  return (
    <div className={`flex items-center gap-4 transition-opacity duration-280 ${visible ? "opacity-100" : "opacity-0"}`}>
      {/* From card */}
      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${ex.fromColor} to-slate-900/80 border border-slate-700/60 flex flex-col items-center justify-center gap-2 shadow-xl`}>
        <span className="text-3xl">{FORMAT_EMOJI[ex.from] ?? "📁"}</span>
        <span className="text-white font-bold text-sm tracking-widest">{ex.from}</span>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
        <span className="text-slate-600 text-[9px] font-bold tracking-widest uppercase">TO</span>
      </div>

      {/* To card */}
      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${ex.toColor} to-slate-900/80 border border-slate-700/60 flex flex-col items-center justify-center gap-2 shadow-xl`}>
        <span className="text-3xl">{FORMAT_EMOJI[ex.to] ?? "📁"}</span>
        <span className="text-white font-bold text-sm tracking-widest">{ex.to}</span>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [files, setFiles]               = useState<FileItem[]>([]);
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => { setHistoryCount(getHistory().length); }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file) => {
      const ext          = getExtension(file.name);
      const cat          = detectCategory(file.name) ?? "video";
      const targetFormat = getDefaultOutput(cat as Category, ext);
      return {
        id: generateId(), file,
        name: file.name, size: file.size,
        category: cat as Category, extension: ext, targetFormat,
        mode: "convert" as ConversionMode,
        quality: 80, status: "idle" as const, progress: 0,
      };
    });
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const getEndpoint = (item: FileItem): string => {
    const { category, targetFormat, mode, extension } = item;
    if (mode === "compress") {
      if (category === "image") return "/api/compress/image";
      if (category === "pdf")   return "/api/convert/pdf";
    }
    if (category === "document") return "/api/convert/document";
    if (category === "ebook")    return "/api/convert/ebook";
    if (category === "font")     return "/api/convert/font";
    if (category === "archive")  return "/api/convert/archive";
    if (category === "pdf" && needsLibreOffice(category, targetFormat)) return "/api/convert/document";
    if (category === "pdf") return "/api/convert/pdf";
    if (category === "image" && targetFormat === "pdf")                    return "/api/convert/pdf";
    if (category === "image" && needsImageMagick(extension, targetFormat)) return "/api/convert/imagemagick";
    if (category === "image") return "/api/convert/image";
    return "/api/convert/image";
  };

  const saveToHistory = useCallback((item: FileItem, resultSize: number) => {
    addHistoryEntry({
      originalName: item.name, originalSize: item.size, originalExt: item.extension,
      targetFormat: item.mode === "compress" ? item.extension : item.targetFormat,
      resultSize, category: item.category, mode: item.mode,
    });
    setHistoryCount(getHistory().length);
    setHistoryVersion((v) => v + 1);
  }, []);

  const MAX_SERVER_BYTES = 4 * 1024 * 1024;

  const convertFile = useCallback(async (item: FileItem) => {
    const clientSide = ["video", "audio", "gif"].includes(item.category);

    if (!clientSide && item.file.size > MAX_SERVER_BYTES) {
      updateFile(item.id, {
        status: "error",
        error: `File is ${(item.file.size / 1024 / 1024).toFixed(1)} MB — server-side conversions are limited to 4 MB on the free hosting plan. Video, audio and GIF have no size limit (processed in your browser).`,
      });
      return;
    }

    if (clientSide) {
      updateFile(item.id, { status: "loading-ffmpeg", progress: 0 });
      try {
        const { loadFFmpeg, convertWithFFmpeg } = await import("@/lib/ffmpeg-client");
        const ff = await loadFFmpeg();
        updateFile(item.id, { status: "converting" });
        const outputFmt  = item.mode === "compress" ? item.extension : item.targetFormat;
        const blob       = await convertWithFFmpeg(ff, item.file, outputFmt, item.quality, (pct) => updateFile(item.id, { progress: pct }));
        const resultUrl  = URL.createObjectURL(blob);
        const resultName = item.mode === "compress"
          ? replaceExtension(item.name, outputFmt).replace(`.${outputFmt}`, `_compressed.${outputFmt}`)
          : replaceExtension(item.name, outputFmt);
        updateFile(item.id, { status: "done", progress: 100, resultUrl, resultName });
        saveToHistory(item, blob.size);
      } catch (err) {
        updateFile(item.id, { status: "error", error: err instanceof Error ? err.message : "Conversion failed" });
      }
    } else {
      updateFile(item.id, { status: "converting", progress: 10 });
      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("format", item.mode === "compress" ? item.extension : item.targetFormat);
        formData.append("quality", String(item.quality));
        formData.append("mode", item.mode);
        updateFile(item.id, { progress: 30 });
        const response = await fetch(getEndpoint(item), { method: "POST", body: formData });
        updateFile(item.id, { progress: 80 });
        if (!response.ok) throw new Error((await response.text()) || `Server error ${response.status}`);
        const blob       = await response.blob();
        const resultUrl  = URL.createObjectURL(blob);
        const outputExt  = item.mode === "compress" ? item.extension : item.targetFormat;
        const resultName = item.mode === "compress"
          ? replaceExtension(item.name, outputExt).replace(`.${outputExt}`, `_compressed.${outputExt}`)
          : replaceExtension(item.name, item.targetFormat);
        updateFile(item.id, { status: "done", progress: 100, resultUrl, resultName });
        saveToHistory(item, blob.size);
      } catch (err) {
        updateFile(item.id, { status: "error", error: err instanceof Error ? err.message : "Conversion failed" });
      }
    }
  }, [updateFile, saveToHistory]);

  const convertAll = useCallback(() => {
    files.filter((f) => f.status === "idle" || f.status === "error").forEach(convertFile);
  }, [files, convertFile]);

  const clearAll = useCallback(() => {
    files.forEach((f) => { if (f.resultUrl) URL.revokeObjectURL(f.resultUrl); });
    setFiles([]);
  }, [files]);

  const clearDone = useCallback(() => {
    setFiles((prev) => {
      prev.filter((f) => f.status === "done").forEach((f) => { if (f.resultUrl) URL.revokeObjectURL(f.resultUrl); });
      return prev.filter((f) => f.status !== "done");
    });
  }, []);

  const hasIdle      = files.some((f) => f.status === "idle"       || f.status === "error");
  const hasDone      = files.some((f) => f.status === "done");
  const isConverting = files.some((f) => f.status === "converting" || f.status === "loading-ffmpeg");

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar historyCount={historyCount} onHistoryClick={() => setHistoryOpen(true)} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} version={historyVersion} />

      {/* Global hero glow — only visible above the fold */}
      <div className="fixed inset-x-0 top-0 h-[600px] pointer-events-none z-0">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-24">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-16 pb-14">
          {/* Left — text */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Free · No account · No limits on video
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-5">
              Convert<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Any File
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Drop a file and pick what to turn it into.{" "}
              <span className="text-slate-200 font-medium">80+ formats</span> across documents,
              images, audio, video, archives and more.
            </p>
          </div>

          {/* Right — animated preview */}
          <div className="flex-shrink-0">
            <ConversionPreview />
          </div>
        </div>

        {/* ── Dropzone / File queue ─────────────────────────────── */}
        {files.length === 0 ? (
          <FileDropzone onFiles={addFiles} variant="hero" />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-base">
                Files{" "}
                <span className="text-slate-500 font-normal text-sm ml-0.5">({files.length})</span>
              </h2>
              <div className="flex gap-2 flex-wrap justify-end">
                {hasIdle && !isConverting && (
                  <button
                    onClick={convertAll}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                  >
                    Convert All
                  </button>
                )}
                {hasDone && (
                  <button
                    onClick={clearDone}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Clear Done
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {files.map((item) => (
                <FileCard key={item.id} item={item} onConvert={convertFile} onRemove={removeFile} onChange={updateFile} />
              ))}
            </div>

            <div className="mt-3">
              <FileDropzone onFiles={addFiles} variant="compact" />
            </div>
          </div>
        )}

        {/* ── Bottom sections ───────────────────────────────────── */}
        {files.length === 0 && (
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Formats section */}
            <div className="lg:col-span-3">
              <FormatsSection />
            </div>

            {/* Privacy card */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Privacy First</span>
              </div>

              <h2 className="text-white text-xl font-bold mb-3 leading-snug">
                Your files,<br />handled privately.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                No account. No tracking. No data sold. Files are processed and immediately discarded.
              </p>

              <ul className="space-y-3 mt-auto">
                {[
                  { icon: "⚡", text: "Video & audio processed locally in your browser — never uploaded" },
                  { icon: "🗑️", text: "Server files deleted immediately after conversion" },
                  { icon: "🔑", text: "No account, login, or email — ever" },
                  { icon: "📜", text: "History stored only in your browser" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-400">
                    <span className="flex-shrink-0 mt-0.5 text-base">{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
