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

      {/* Background */}
      <div className="fixed inset-x-0 top-0 h-[800px] pointer-events-none z-0">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-slate-950" />
      </div>

      <main className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-7 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            100% free · No account · No file size limits
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.02] mb-6">
            Convert files.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">
              Use tools.
            </span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Convert <span className="text-white font-semibold">80+ file formats</span> and access{" "}
            <span className="text-white font-semibold">43 free browser tools</span> — no upload, no account, nothing stored.
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { icon: "🔄", value: "80+", label: "formats" },
              { icon: "⚡", value: "43",  label: "tools" },
              { icon: "🔒", value: "100%", label: "private" },
              { icon: "💸", value: "Free", label: "forever" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <span className="text-base">{icon}</span>
                <span className="text-white font-bold text-sm">{value}</span>
                <span className="text-slate-500 text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Rotating conversion preview */}
          <div className="flex justify-center mb-4">
            <ConversionPreview />
          </div>
        </div>

        {/* ── FILE CONVERTER ───────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          {files.length === 0 ? (
            <div>
              <div className="flex gap-1 mb-3 w-fit">
                {(["file", "url"] as const).map((tab) => (
                  <button key={tab} onClick={() => setInputTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      inputTab === tab ? "bg-slate-800 text-white border border-slate-700" : "text-slate-500 hover:text-slate-300"
                    }`}>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-white font-semibold text-base">
                    Files <span className="text-slate-500 font-normal text-sm">({files.length})</span>
                  </h2>
                  {doneCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {doneCount} / {totalCount} done
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {hasIdle && !isConverting && (
                    <button onClick={convertAll} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-500/20">Convert All</button>
                  )}
                  {hasDone && doneCount >= 2 && (
                    <button onClick={downloadAllZip} disabled={zipLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
                      {zipLoading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      )}
                      Download All (.zip)
                    </button>
                  )}
                  {hasDone && (
                    <button onClick={clearDone} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Clear Done</button>
                  )}
                  <button onClick={clearAll} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Clear All</button>
                </div>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2.5">
                    {files.map((item) => (
                      <SortableFileCard key={item.id} item={item} onConvert={convertFile} onRemove={removeFile} onChange={updateFile} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="mt-3">
                <FileDropzone onFiles={addFiles} variant="compact" />
              </div>
            </div>
          )}
        </div>

        {/* ── TOOLS SECTION ────────────────────────────────────── */}
        <div className="border-t border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950">
          <div className="max-w-5xl mx-auto px-4 py-16">

            {/* Section header */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Browser Tools</p>
                <h2 className="text-4xl font-black text-white leading-tight">
                  43 tools.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Zero installs.</span>
                </h2>
                <p className="text-slate-500 text-sm mt-3 max-w-sm">Every tool runs entirely in your browser. No sign-up, no uploads, no waiting.</p>
              </div>
              <Link href="/tools"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-sm transition-colors shrink-0">
                All tools
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>

            {/* ── Text & Code ── */}
            <ToolCategory label="Text & Code" icon="✍️" href="/tools#text-code" tools={[
              { href: "/tools/word-counter",    icon: "📝", title: "Word Counter",          desc: "Words, chars, sentences, reading time" },
              { href: "/tools/markdown",        icon: "✍️", title: "Markdown Editor",        desc: "Live HTML preview split-pane editor" },
              { href: "/tools/diff",            icon: "⟺",  title: "Text Diff",              desc: "Word-level inline diff, split view" },
              { href: "/tools/lorem",           icon: "¶",  title: "Lorem Ipsum",            desc: "Paragraphs, sentences, or words" },
              { href: "/tools/base64",          icon: "🔤", title: "Base64",                 desc: "Encode or decode Base64 strings" },
              { href: "/tools/url-encode",      icon: "🔗", title: "URL Encoder",            desc: "Percent-encode or decode URLs" },
              { href: "/tools/hash",            icon: "🔐", title: "Hash Generator",         desc: "SHA-1, SHA-256, SHA-384, SHA-512" },
              { href: "/tools/json",            icon: "{ }", title: "JSON Formatter",        desc: "Validate, format, and minify JSON" },
              { href: "/tools/regex",           icon: ".*", title: "Regex Tester",           desc: "Live match highlighting" },
              { href: "/tools/csv-json",        icon: "⇄",  title: "CSV ↔ JSON",             desc: "Convert with live table preview" },
              { href: "/tools/case-converter",  icon: "Aa", title: "Case Converter",        desc: "camelCase, snake_case, kebab & more" },
              { href: "/tools/grammar-checker", icon: "✏️", title: "Grammar Checker",        desc: "Powered by LanguageTool API" },
              { href: "/tools/html-beautifier", icon: "🌐", title: "HTML Beautifier",        desc: "Format HTML with W3C standards" },
              { href: "/tools/js-beautifier",   icon: "✨", title: "JS Beautifier",          desc: "Format JavaScript & TypeScript" },
              { href: "/tools/css-beautifier",  icon: "🎨", title: "CSS Beautifier",         desc: "Format CSS and SCSS" },
              { href: "/tools/python-beautifier",icon: "🐍", title: "Python Beautifier",     desc: "PEP 8 compliant formatting" },
            ]} />

            {/* ── Design & Visual ── */}
            <ToolCategory label="Design & Visual" icon="🎨" href="/tools#design-visual" tools={[
              { href: "/tools/color-picker",   icon: "🎨", title: "Color Picker",            desc: "HEX, RGB, HSL, CMYK values" },
              { href: "/tools/palette",        icon: "🖌️", title: "Palette Generator",        desc: "Complementary, triadic, analogous" },
              { href: "/tools/gradient",       icon: "🌈", title: "CSS Gradient Builder",    desc: "Linear & radial with CSS output" },
              { href: "/tools/glassmorphism",  icon: "🪟", title: "Glassmorphism",           desc: "Glass-effect UI cards" },
              { href: "/tools/box-shadow",     icon: "🔲", title: "Box Shadow Builder",      desc: "Multi-layer shadows, live preview" },
              { href: "/tools/border-radius",  icon: "⬜", title: "Border Radius",           desc: "Per-side visual builder" },
              { href: "/tools/favicon",        icon: "⭐", title: "Favicon Generator",       desc: "All standard sizes from any image" },
            ]} />

            {/* ── Converters & Calculators ── */}
            <ToolCategory label="Converters & Calculators" icon="🔢" href="/tools#converters" tools={[
              { href: "/tools/units",              icon: "📐", title: "Unit Converter",        desc: "Length, weight, temp, area & more" },
              { href: "/tools/aspect-ratio",       icon: "⛶",  title: "Aspect Ratio",          desc: "Lock ratio, solve dimensions" },
              { href: "/tools/timestamp",          icon: "🕐", title: "Timestamp Converter",   desc: "Unix ↔ human-readable dates" },
              { href: "/tools/base-converter",     icon: "🔢", title: "Number Base",           desc: "Binary, octal, decimal, hex" },
              { href: "/tools/cron",               icon: "⏱️", title: "Cron Builder",          desc: "Schedule expressions + preview" },
              { href: "/tools/password",           icon: "🔑", title: "Password Generator",    desc: "Cryptographically secure" },
              { href: "/tools/calculator",         icon: "🧮", title: "Calculator",            desc: "Basic + scientific, with history" },
              { href: "/tools/currency-converter", icon: "💱", title: "Currency Converter",    desc: "Live rates for 160+ currencies" },
              { href: "/tools/time-calculator",    icon: "⏱",  title: "Time Calculator",       desc: "Durations, add & subtract time" },
            ]} />

            {/* ── Images & PDFs ── */}
            <ToolCategory label="Images & PDFs" icon="🖼️" href="/tools#images-pdfs" tools={[
              { href: "/tools/image-editor",       icon: "🖼️", title: "Image Editor",          desc: "Resize, crop, rotate, markup" },
              { href: "/tools/image-compressor",   icon: "🗜️", title: "Image Compressor",       desc: "Compress JPEG, PNG, WEBP in bulk" },
              { href: "/tools/background-remover", icon: "✂️", title: "Background Remover",    desc: "AI-powered, runs in browser" },
              { href: "/tools/raster-to-svg",      icon: "✦",  title: "PNG/JPG → SVG",         desc: "Vectorize raster images" },
              { href: "/tools/svg-to-png",         icon: "✦",  title: "SVG → PNG",             desc: "Up to 4× scale output" },
              { href: "/tools/exif",               icon: "📷", title: "EXIF Viewer",            desc: "Camera, GPS & image metadata" },
              { href: "/tools/pdf-merge",          icon: "📄", title: "PDF Merge",              desc: "Combine & reorder PDFs" },
              { href: "/tools/pdf-to-images",      icon: "🖨️", title: "PDF to Images",         desc: "Each page to PNG" },
              { href: "/tools/qr",                 icon: "⬛", title: "QR Generator",          desc: "Any URL or text → QR PNG" },
            ]} />

            {/* ── Reference ── */}
            <ToolCategory label="Reference" icon="📚" href="/tools#reference" tools={[
              { href: "/tools/http-status",         icon: "📡", title: "HTTP Status Codes",    desc: "Searchable reference for every code" },
              { href: "/tools/framework-reference", icon: "📚", title: "Framework Reference",  desc: "Tailwind, Bootstrap, React, Next.js" },
            ]} />

            <div className="mt-10 text-center">
              <Link href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20">
                Browse all 43 tools
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── FORMATS + PRIVACY ─────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">
          <div>
            <FormatsSection />
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-slate-900/40 overflow-hidden flex flex-col">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />
              <div className="p-6 flex flex-col flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 w-fit mb-5">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Privacy First</span>
                </div>
                {/* Headline */}
                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  Private by design.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">Free by default.</span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">No account. No tracking. No data sold. Everything runs in your browser — your files never leave your device.</p>
                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                  {[
                    { icon: "⚡", label: "Browser-powered", desc: "All 43 tools run 100% client-side" },
                    { icon: "🗑️", label: "Auto-deleted", desc: "Server files wiped immediately after conversion" },
                    { icon: "🔑", label: "Zero accounts", desc: "No login, no email, no sign-up ever" },
                    { icon: "📜", label: "Local history", desc: "Conversion history stays on your device only" },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <span className="text-xl shrink-0">{icon}</span>
                      <div>
                        <div className="text-white text-xs font-semibold leading-tight">{label}</div>
                        <div className="text-slate-500 text-xs leading-snug mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>

      </main>
    </div>
  );
}

/* ── Tool category section ───────────────────────────────────── */
function ToolCategory({ label, icon, href, tools }: {
  label: string; icon: string; href: string;
  tools: { href: string; icon: string; title: string; desc: string }[];
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <Link href={href} className="flex items-center gap-2 group">
          <span className="text-base">{icon}</span>
          <span className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">{label}</span>
        </Link>
        <div className="h-px flex-1 bg-slate-800/60" />
        <span className="text-slate-600 text-xs">{tools.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {tools.map(({ href: toolHref, icon: toolIcon, title, desc }) => (
          <Link key={toolHref} href={toolHref}
            className="group flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900 transition-all duration-150">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-base mt-0.5">
              {toolIcon}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium group-hover:text-blue-300 transition-colors leading-snug">{title}</p>
              <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5 line-clamp-2">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

