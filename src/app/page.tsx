"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FileItem, Category, ConversionMode } from "@/types";
import { detectCategory, getDefaultOutput, needsImageMagick } from "@/lib/formats";
import { imageNeedsServer } from "@/lib/image-client";
import { archiveNeedsServer } from "@/lib/archive-client";
import { getCloudConvertKey } from "@/lib/cloudconvert-client";
import { generateId, getExtension, replaceExtension } from "@/lib/utils";
import { addHistoryEntry, getHistory } from "@/lib/history";
import Navbar from "@/components/Navbar";
import FileDropzone from "@/components/FileDropzone";
import FileCard from "@/components/FileCard";
import FormatsSection from "@/components/FormatsSection";
import HistoryDrawer from "@/components/HistoryDrawer";
import CloudConvertKeyModal from "@/components/CloudConvertKeyModal";

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
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % EXAMPLES.length); setVisible(true); }, 280);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const ex = EXAMPLES[idx];
  return (
    <div className={`flex items-center gap-4 transition-opacity duration-280 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${ex.fromColor} to-slate-900/80 border border-slate-700/60 flex flex-col items-center justify-center gap-2 shadow-xl`}>
        <span className="text-3xl">{FORMAT_EMOJI[ex.from] ?? "📁"}</span>
        <span className="text-white font-bold text-sm tracking-widest">{ex.from}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
        <span className="text-slate-600 text-[9px] font-bold tracking-widest uppercase">TO</span>
      </div>
      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${ex.toColor} to-slate-900/80 border border-slate-700/60 flex flex-col items-center justify-center gap-2 shadow-xl`}>
        <span className="text-3xl">{FORMAT_EMOJI[ex.to] ?? "📁"}</span>
        <span className="text-white font-bold text-sm tracking-widest">{ex.to}</span>
      </div>
    </div>
  );
}

/* ── Sortable file card wrapper ──────────────────────────────── */
function SortableFileCard(props: React.ComponentProps<typeof FileCard>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FileCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

/* ── URL input component ─────────────────────────────────────── */
function UrlInput({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const fetch_ = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) { setError(await res.text()); return; }
      const blob = await res.blob();
      const filename = res.headers.get("x-filename") ?? url.split("/").pop() ?? "file";
      const file = new File([blob], filename, { type: blob.type });
      onFiles([file]);
      setUrl("");
    } catch {
      setError("Failed to fetch URL. Make sure it's a direct file link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && fetch_()}
          placeholder="https://example.com/file.mp4"
          className="flex-1 bg-slate-900/60 border border-slate-700/60 text-white text-sm rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
        />
        <button
          onClick={fetch_}
          disabled={loading || !url.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : "Fetch"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-slate-600 text-xs">Paste a direct URL to a file. Works with most public file links.</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [files, setFiles]               = useState<FileItem[]>([]);
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [inputTab, setInputTab]         = useState<"file" | "url">("file");
  const [zipLoading, setZipLoading]     = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const sessionDownloads                = useRef<Map<string, { url: string; filename: string }>>(new Map());

  useEffect(() => { setHistoryCount(getHistory().length); }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  /* ── File management ─────────────────────────────────────── */
  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const makeItem = (file: File): FileItem => {
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
  };

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles.map(makeItem)]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((prev) => {
        const from = prev.findIndex((f) => f.id === active.id);
        const to   = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, from, to);
      });
    }
  }, []);

  /* ── Clipboard paste ─────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.files ?? []);
      if (items.length > 0) addFiles(items);
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [addFiles]);

  /* ── Conversion ──────────────────────────────────────────── */
  const saveToHistory = useCallback((item: FileItem, resultSize: number, resultUrl: string, resultName: string) => {
    const id = addHistoryEntry({
      originalName: item.name, originalSize: item.size, originalExt: item.extension,
      targetFormat: item.mode === "compress" ? item.extension : item.targetFormat,
      resultSize, category: item.category, mode: item.mode,
    });
    sessionDownloads.current.set(id, { url: resultUrl, filename: resultName });
    setHistoryCount(getHistory().length);
    setHistoryVersion((v) => v + 1);
  }, []);

  const finishConvert = useCallback((item: FileItem, blob: Blob, outputFmt: string) => {
    const resultUrl  = URL.createObjectURL(blob);
    const resultName = item.mode === "compress"
      ? replaceExtension(item.name, outputFmt).replace(`.${outputFmt}`, `_compressed.${outputFmt}`)
      : replaceExtension(item.name, outputFmt);
    updateFile(item.id, { status: "done", progress: 100, resultUrl, resultName });
    saveToHistory(item, blob.size, resultUrl, resultName);
  }, [updateFile, saveToHistory]);

  const convertFile = useCallback(async (item: FileItem) => {
    const outputFmt = item.mode === "compress" ? item.extension : item.targetFormat;
    const { category, extension } = item;

    const isFFmpeg        = ["video", "audio", "gif"].includes(category);
    const isImgClient     = category === "image" && !imageNeedsServer(extension, outputFmt) && !needsImageMagick(extension, outputFmt);
    const isImgMagick     = category === "image" && needsImageMagick(extension, outputFmt);
    const isFontClient    = category === "font";
    const isPdfClient     = category === "pdf" && outputFmt === "pdf";
    const isArchiveClient = category === "archive" && !archiveNeedsServer(extension, outputFmt);
    const needsCC         = category === "document" || category === "ebook" ||
                            (category === "pdf" && ["docx", "epub"].includes(outputFmt));

    updateFile(item.id, { status: "converting", progress: 5 });

    try {
      // ── FFmpeg (video / audio / gif) ────────────────────────
      if (isFFmpeg) {
        updateFile(item.id, { status: "loading-ffmpeg", progress: 0 });
        const { loadFFmpeg, convertWithFFmpeg } = await import("@/lib/ffmpeg-client");
        const ff = await loadFFmpeg();
        updateFile(item.id, { status: "converting" });
        finishConvert(item, await convertWithFFmpeg(ff, item.file, outputFmt, item.quality, (pct) => updateFile(item.id, { progress: pct })), outputFmt);
        return;
      }

      // ── Browser Canvas (common image formats) ───────────────
      if (isImgClient) {
        const { convertImageClient } = await import("@/lib/image-client");
        finishConvert(item, await convertImageClient(item.file, outputFmt, item.quality, (pct) => updateFile(item.id, { progress: pct })), outputFmt);
        return;
      }

      // ── ImageMagick WASM (exotic image formats) ──────────────
      if (isImgMagick) {
        updateFile(item.id, { progress: 20 });
        const { convertWithImageMagick } = await import("@/lib/imagemagick-client");
        finishConvert(item, await convertWithImageMagick(item.file, outputFmt), outputFmt);
        return;
      }

      // ── Font (browser WASM) ─────────────────────────────────
      if (isFontClient) {
        const { convertFontClient } = await import("@/lib/font-client");
        finishConvert(item, await convertFontClient(item.file, outputFmt), outputFmt);
        return;
      }

      // ── PDF (browser, pdf-lib) ──────────────────────────────
      if (isPdfClient) {
        const { convertPdfClient } = await import("@/lib/pdf-client");
        finishConvert(item, await convertPdfClient([item.file], outputFmt, item.mode), outputFmt);
        return;
      }

      // ── Archive (browser, jszip + fflate) ───────────────────
      if (isArchiveClient) {
        const { convertArchiveClient } = await import("@/lib/archive-client");
        finishConvert(item, await convertArchiveClient(item.file, outputFmt), outputFmt);
        return;
      }

      // ── CloudConvert (documents, ebooks, PDF→DOCX/EPUB) ─────
      if (needsCC) {
        if (!getCloudConvertKey()) {
          updateFile(item.id, {
            status: "error",
            error: "A CloudConvert API key is required for document and eBook conversions. Click the 🔑 key icon in the toolbar to add your free key (25 free conversions/day).",
          });
          return;
        }
        const { convertWithCloudConvert } = await import("@/lib/cloudconvert-client");
        finishConvert(item, await convertWithCloudConvert(item.file, extension, outputFmt, (msg) => updateFile(item.id, { status: "converting", progress: 40, error: undefined, resultUrl: undefined, resultName: undefined, ...{ _msg: msg } })), outputFmt);
        return;
      }

      // ── Server fallback (AVIF, TIFF, BMP via Sharp) ─────────
      updateFile(item.id, { progress: 20 });
      const endpoint = category === "image" && outputFmt === "pdf" ? "/api/convert/pdf" : "/api/convert/image";
      const fd = new FormData();
      fd.append("file", item.file); fd.append("format", outputFmt);
      fd.append("quality", String(item.quality)); fd.append("mode", item.mode);
      updateFile(item.id, { progress: 40 });
      const res = await fetch(endpoint, { method: "POST", body: fd });
      updateFile(item.id, { progress: 80 });
      if (!res.ok) throw new Error((await res.text()) || `Server error ${res.status}`);
      finishConvert(item, await res.blob(), outputFmt);

    } catch (err) {
      updateFile(item.id, { status: "error", error: err instanceof Error ? err.message : "Conversion failed" });
    }
  }, [updateFile, saveToHistory, finishConvert]);

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

  /* ── Batch ZIP download ──────────────────────────────────── */
  const downloadAllZip = useCallback(async () => {
    const done = files.filter((f) => f.status === "done" && f.resultUrl);
    if (done.length === 0) return;
    setZipLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      await Promise.all(done.map(async (item) => {
        const res  = await fetch(item.resultUrl!);
        const blob = await res.blob();
        const name = item.resultName ?? replaceExtension(item.name, item.targetFormat);
        zip.file(name, blob);
      }));
      const content = await zip.generateAsync({ type: "blob" });
      const link    = document.createElement("a");
      link.href     = URL.createObjectURL(content);
      link.download = "fileflow-converted.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setZipLoading(false);
    }
  }, [files]);

  /* ── Derived state ───────────────────────────────────────── */
  const hasIdle      = files.some((f) => f.status === "idle"       || f.status === "error");
  const doneFiles    = files.filter((f) => f.status === "done");
  const hasDone      = doneFiles.length > 0;
  const isConverting = files.some((f) => f.status === "converting" || f.status === "loading-ffmpeg");
  const doneCount    = doneFiles.length;
  const totalCount   = files.length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar historyCount={historyCount} onHistoryClick={() => setHistoryOpen(true)} onKeyClick={() => setKeyModalOpen(true)} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} version={historyVersion} sessionDownloads={sessionDownloads.current} />
      <CloudConvertKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />

      {/* Hero glow */}
      <div className="fixed inset-x-0 top-0 h-[600px] pointer-events-none z-0">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-24">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-16 pb-14">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Free · No account · No file size limits
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-5">
              Convert & Create<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Anything
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-5">
              Convert <span className="text-slate-200 font-medium">80+ file formats</span> — documents,
              images, audio, video, archives and more. Plus <span className="text-slate-200 font-medium">43 free browser tools</span> for design,
              development, and productivity. No upload required.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "File Converter", href: null },
                { label: "Image Tools",   href: "/tools#images-pdfs" },
                { label: "Dev Tools",     href: "/tools#text-code" },
                { label: "Design Tools",  href: "/tools#design-visual" },
              ].map(({ label, href }) =>
                href ? (
                  <Link key={label} href={href} className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white text-xs transition-colors">
                    {label}
                  </Link>
                ) : (
                  <span key={label} className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs">
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <ConversionPreview />
          </div>
        </div>

        {/* ── Dropzone / File queue ─────────────────────────── */}
        {files.length === 0 ? (
          <div>
            {/* Input mode tabs */}
            <div className="flex gap-1 mb-3 w-fit">
              {(["file", "url"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setInputTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    inputTab === tab
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab === "file" ? "Upload File" : "From URL"}
                </button>
              ))}
            </div>

            {inputTab === "file" ? (
              <FileDropzone onFiles={addFiles} variant="hero" />
            ) : (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8">
                <UrlInput onFiles={addFiles} />
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Queue header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold text-base">
                  Files <span className="text-slate-500 font-normal text-sm">({files.length})</span>
                </h2>
                {/* Batch progress */}
                {doneCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {doneCount} / {totalCount} done
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {hasIdle && !isConverting && (
                  <button onClick={convertAll} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-500/20">
                    Convert All
                  </button>
                )}
                {hasDone && doneCount >= 2 && (
                  <button
                    onClick={downloadAllZip}
                    disabled={zipLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                  >
                    {zipLoading ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    Download All (.zip)
                  </button>
                )}
                {hasDone && (
                  <button onClick={clearDone} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
                    Clear Done
                  </button>
                )}
                <button onClick={clearAll} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
                  Clear All
                </button>
              </div>
            </div>

            {/* Sortable file list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {files.map((item) => (
                    <SortableFileCard
                      key={item.id}
                      item={item}
                      onConvert={convertFile}
                      onRemove={removeFile}
                      onChange={updateFile}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-3">
              <FileDropzone onFiles={addFiles} variant="compact" />
            </div>
          </div>
        )}

        {/* ── Tools strip ──────────────────────────────────── */}
        {files.length === 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-base">43 Free Tools</h2>
                <p className="text-slate-500 text-xs mt-0.5">Design, dev & productivity utilities — no upload, no account</p>
              </div>
              <Link href="/tools" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                View all
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { href: "/tools/word-counter",       icon: "📝", label: "Word Counter",         desc: "Words, chars, sentences, reading time"  },
                { href: "/tools/lorem",              icon: "¶",  label: "Lorem Ipsum",            desc: "Generate placeholder text instantly"     },
                { href: "/tools/color-picker",       icon: "🎨", label: "Color Picker",           desc: "HEX, RGB, HSL, CMYK values + palette"   },
                { href: "/tools/units",              icon: "📐", label: "Unit Converter",         desc: "Length, weight, temp, data and more"     },
                { href: "/tools/image-editor",       icon: "🖼️", label: "Image Editor",           desc: "Resize, rotate and flip images"          },
                { href: "/tools/image-compressor",   icon: "🗜️", label: "Image Compressor",       desc: "Compress images — no size limits"        },
                { href: "/tools/background-remover", icon: "✂️", label: "Background Remover",     desc: "AI background removal in your browser"   },
                { href: "/tools/qr",                 icon: "⬛", label: "QR Code Generator",      desc: "URL, text, or any data → scannable QR"  },
                { href: "/tools/diff",               icon: "⟺",  label: "Text Diff Checker",      desc: "See exactly what changed between texts"  },
              ].map(({ href, icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-150"
                >
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">{label}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{desc}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom sections ───────────────────────────────── */}
        {files.length === 0 && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <FormatsSection />
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Privacy First</span>
              </div>
              <h2 className="text-white text-xl font-bold mb-3 leading-snug">Private by design.<br />Free by default.</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">No account. No tracking. No data sold. All tools run in your browser — nothing leaves your device unless you convert a document server-side.</p>
              <ul className="space-y-3 mt-auto">
                {[
                  { icon: "⚡", text: "Images, video, audio & all 43 tools run entirely in your browser" },
                  { icon: "🗑️", text: "Server-side conversions delete your file immediately after" },
                  { icon: "🔑", text: "No account, login, or email — ever" },
                  { icon: "📜", text: "Conversion history stored only in your browser" },
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
