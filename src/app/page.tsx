"use client";

import React from "react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Type, FileCode, GitCompare, AlignLeft, Shuffle, Link as LucideLink, Hash, Braces, Search, Table2, CaseSensitive, SpellCheck, Code2, Wand2, Paintbrush, Terminal, Pipette, Palette, Blend, Layers, BoxSelect, SquareDashed, Bookmark, Ruler, Maximize2, Clock, Binary, Timer, Key, Calculator, Coins, Hourglass, Percent, BarChart2, ImagePlus, Minimize2, Scissors, PenTool, FileImage, Camera, FilePlus2, ScanLine, QrCode, Globe, BookOpen, Tag, FileText, Shapes, Image, Library, ArrowLeftRight, PackageMinus, Server, Gauge, FileMinus2, Lock, Map } from "lucide-react";
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
import { detectCategory, getDefaultOutput, needsImageMagick, getCompatibleOutputs } from "@/lib/formats";
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

const EXAMPLES = [
  { from: "PDF",  to: "DOCX" },
  { from: "MP4",  to: "MP3"  },
  { from: "HEIC", to: "JPG"  },
  { from: "PNG",  to: "WEBP" },
  { from: "EPUB", to: "MOBI" },
  { from: "MP3",  to: "WAV"  },
];

/* ── Compact animated conversion pill ───────────────────────── */
function InlineConversionPill() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % EXAMPLES.length); setVisible(true); }, 200);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const ex = EXAMPLES[idx];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
      <span className="text-slate-300">{ex.from}</span>
      <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <span className="text-blue-400">{ex.to}</span>
    </span>
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
      if (!res.ok) {
        const text = await res.text();
        setError(res.status === 422 ? "Invalid or unsupported URL. Make sure it's a direct link to a file." :
                 res.status === 413 ? "File is too large to fetch." :
                 text || `Failed to fetch (${res.status})`);
        return;
      }
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

/* ── Format pair chips ───────────────────────────────────────── */
const FORMAT_PAIRS = [
  { from: "HEIC", to: "JPG"  },
  { from: "MP4",  to: "MP3"  },
  { from: "PDF",  to: "DOCX" },
  { from: "PNG",  to: "WEBP" },
  { from: "DOCX", to: "PDF"  },
  { from: "GIF",  to: "MP4"  },
];

/* ── Main page ───────────────────────────────────────────────── */
export default function HomePage() {
  const [files, setFiles]               = useState<FileItem[]>([]);
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [inputTab, setInputTab]         = useState<"file" | "url">("file");
  const [zipLoading, setZipLoading]     = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [activePair, setActivePair]     = useState<string | null>(null);
  const [pageMode, setPageMode]         = useState<"convert" | "compress">("convert");
  const [globalQuality, setGlobalQuality] = useState(80);
  const sessionDownloads                = useRef<Map<string, { url: string; filename: string }>>(new Map());
  const converterRef                    = useRef<HTMLDivElement>(null);

  useEffect(() => { setHistoryCount(getHistory().length); }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  /* ── File management ─────────────────────────────────────── */
  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const makeItem = useCallback((file: File): FileItem => {
    const ext          = getExtension(file.name);
    const cat          = detectCategory(file.name) ?? "video";
    const targetFormat = getDefaultOutput(cat as Category, ext);
    return {
      id: generateId(), file,
      name: file.name, size: file.size,
      category: cat as Category, extension: ext, targetFormat,
      mode: pageMode,
      quality: 80, status: "idle" as const, progress: 0,
    };
  }, [pageMode]);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles.map(makeItem)]);
  }, [makeItem]);

  const switchPageMode = useCallback((mode: "convert" | "compress") => {
    setPageMode(mode);
    setFiles(prev => prev.map(f =>
      f.status === "idle" || f.status === "error" ? { ...f, mode } : f
    ));
  }, []);

  const batchSetQuality = useCallback((quality: number) => {
    setGlobalQuality(quality);
    setFiles(prev => prev.map(f =>
      (f.status === "idle" || f.status === "error") && f.mode === "compress" ? { ...f, quality } : f
    ));
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
  const friendlyError = useCallback((err: unknown, category: string): string => {
    const msg = err instanceof Error ? err.message : String(err ?? "Unknown error");
    if (msg.includes("API key not configured") || msg.includes("API key is required"))
      return "A CloudConvert API key is required. It's free — 25 conversions/day. Click 'Add API Key' above.";
    if (msg.includes("CloudConvert timed out"))
      return "Conversion timed out. Try a smaller file or check your internet connection, then retry.";
    if (msg.includes("Upload failed"))
      return "Upload to CloudConvert failed. Check your internet connection and try again.";
    if (msg.includes("CloudConvert error 422"))
      return "CloudConvert rejected the request — your API key may be invalid or the format pair is unsupported.";
    if (msg.includes("CloudConvert") && msg.toLowerCase().includes("invalid"))
      return "CloudConvert API key looks invalid. Double-check it in the key settings and try again.";
    if (msg.includes("Browser could not decode"))
      return "Your browser can't read this file. It may be corrupted, or try opening it in another app first.";
    if (msg.includes("browser could not encode") || msg.includes("output is not supported in-browser"))
      return "Your browser doesn't support encoding to this format. Try PNG or WEBP as an alternative.";
    if (msg.includes("No files found in archive"))
      return "The archive appears to be empty or corrupted. Check the file and try again.";
    if (msg.includes("extraction is not supported") || msg.includes("creation is not supported"))
      return msg;
    if (msg.includes("Server error 5") || msg.match(/server error \d{3}/i))
      return "Server error. Try again in a moment — if it keeps failing, try a different output format.";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("network"))
      return "Network error. Check your internet connection and try again.";
    if ((category === "video" || category === "audio" || category === "gif") &&
        (msg.includes("memory") || msg.includes("out of memory")))
      return "File is too large for in-browser processing. Try a shorter clip or lower resolution.";
    return msg || "Conversion failed. Check the file isn't corrupted and try a different output format.";
  }, []);

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
    updateFile(item.id, { status: "done", progress: 100, resultUrl, resultName, resultSize: blob.size });
    saveToHistory(item, blob.size, resultUrl, resultName);
  }, [updateFile, saveToHistory]);

  const convertFile = useCallback(async (item: FileItem) => {
    const outputFmt = item.mode === "compress" ? item.extension : item.targetFormat;
    const { category, extension } = item;

    const isFFmpeg        = ["video", "audio", "gif"].includes(category);
    const isImgClient     = category === "image" && !imageNeedsServer(extension, outputFmt) && !needsImageMagick(extension, outputFmt);
    const isImgMagick     = (category === "image" && needsImageMagick(extension, outputFmt)) ||
                            (category === "pdf" && ["jpg", "png", "webp"].includes(outputFmt));
    const isFontClient    = category === "font";
    const isPdfClient     = category === "pdf" && outputFmt === "pdf";
    const isArchiveClient = category === "archive";
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
        updateFile(item.id, { status: "converting", progress: 10 });
        const { convertWithImageMagick } = await import("@/lib/imagemagick-client");
        updateFile(item.id, { progress: 20 });
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
            error: "A CloudConvert API key is required for document and eBook conversions. You get 25 free conversions/day.",
          });
          setKeyModalOpen(true);
          return;
        }
        const { convertWithCloudConvert } = await import("@/lib/cloudconvert-client");
        finishConvert(item, await convertWithCloudConvert(item.file, extension, outputFmt, (msg) => updateFile(item.id, { status: "converting", progress: 40, error: undefined, resultUrl: undefined, resultName: undefined, ...{ _msg: msg } })), outputFmt);
        return;
      }

      // ── Server fallback (AVIF, TIFF via Sharp) ──────────────
      updateFile(item.id, { progress: 20 });
      const endpoint = "/api/convert/image";
      const fd = new FormData();
      fd.append("file", item.file); fd.append("format", outputFmt);
      fd.append("quality", String(item.quality)); fd.append("mode", item.mode);
      updateFile(item.id, { progress: 40 });
      const res = await fetch(endpoint, { method: "POST", body: fd });
      updateFile(item.id, { progress: 80 });
      if (!res.ok) throw new Error((await res.text()) || `Server error ${res.status}`);
      finishConvert(item, await res.blob(), outputFmt);

    } catch (err) {
      updateFile(item.id, { status: "error", error: friendlyError(err, category) });
    }
  }, [updateFile, saveToHistory, finishConvert, friendlyError]);

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
      link.download = "filespark-converted.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setZipLoading(false);
    }
  }, [files]);

  const batchSetFormat = useCallback((category: Category, targetFormat: string) => {
    setFiles(prev => prev.map(f =>
      f.category === category && (f.status === "idle" || f.status === "error")
        ? { ...f, targetFormat }
        : f
    ));
  }, []);

  /* ── Derived state ───────────────────────────────────────── */
  const hasIdle      = files.some((f) => f.status === "idle"       || f.status === "error");
  const doneFiles    = files.filter((f) => f.status === "done");
  const hasDone      = doneFiles.length > 0;
  const isConverting = files.some((f) => f.status === "converting" || f.status === "loading-ffmpeg");
  const doneCount    = doneFiles.length;
  const totalCount   = files.length;
  const idleCount    = files.filter(f => f.status === "idle" || f.status === "error").length;

  const idleCategoryGroups = useMemo(() => {
    const map = new Map<Category, FileItem[]>();
    for (const f of files) {
      if (f.status === "idle" || f.status === "error") {
        const arr = map.get(f.category) ?? [];
        arr.push(f);
        map.set(f.category, arr);
      }
    }
    return [...map.entries()].filter(([, items]) => items.length >= 2);
  }, [files]);

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
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            No account · No file size limits · Free to start
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.02] mb-5">
            Convert files.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">
              Use tools.
            </span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed mb-5 max-w-2xl mx-auto">
            Convert and compress <span className="text-white font-semibold">80+ file formats</span> and access{" "}
            <span className="text-white font-semibold">60+ free browser tools</span>. No upload, no account, nothing stored.
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
            <span>Try converting</span>
            <InlineConversionPill />
          </div>
        </div>

        {/* ── MODE TABS ────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-5">
          <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800/60 rounded-xl w-fit mx-auto">
            <button
              onClick={() => switchPageMode("convert")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                pageMode === "convert"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Convert
            </button>
            <button
              onClick={() => switchPageMode("compress")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                pageMode === "compress"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Compress
            </button>
          </div>
          {pageMode === "compress" && (
            <p className="text-center text-slate-500 text-xs mt-2">Reduce file size while keeping the same format — ideal for images, video, and audio.</p>
          )}
        </div>

        {/* ── FORMAT CHIPS (convert mode only) ─────────────────── */}
        {pageMode === "convert" && (
        <div className="max-w-5xl mx-auto px-4 pb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {FORMAT_PAIRS.map(({ from, to }) => {
              const key = `${from}-${to}`;
              const isActive = activePair === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActivePair(isActive ? null : key);
                    if (!isActive) {
                      setTimeout(() => converterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                    isActive
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-800/70 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  <span className="font-semibold">{from}</span>
                  <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="font-semibold">{to}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* ── FILE CONVERTER ───────────────────────────────────── */}
        <div ref={converterRef} className="max-w-5xl mx-auto px-4 pb-20">
          {files.length === 0 ? (
            <div>
              {activePair && (() => {
                const pair = FORMAT_PAIRS.find(p => `${p.from}-${p.to}` === activePair);
                return pair ? (
                  <p className="text-blue-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    Drop your {pair.from} file here to convert it to {pair.to}
                  </p>
                ) : null;
              })()}
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
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-white font-semibold text-base">
                    Files <span className="text-slate-500 font-normal text-sm">({files.length})</span>
                  </h2>
                </div>
                <div className="flex gap-2 flex-wrap justify-end items-center">
                  {hasIdle && !isConverting && (
                    <button
                      onClick={convertAll}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                        pageMode === "compress"
                          ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20"
                          : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        {pageMode === "compress"
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                        }
                      </svg>
                      {pageMode === "compress" ? "Compress" : "Convert"} All {idleCount > 1 && <span className="opacity-75">({idleCount})</span>}
                    </button>
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

              {/* Overall progress bar while converting */}
              {(isConverting || doneCount > 0) && totalCount > 1 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">
                      {isConverting ? `Converting… ${doneCount} / ${totalCount} done` : `${doneCount} / ${totalCount} converted`}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{Math.round((doneCount / totalCount) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Global quality bar — compress mode with 2+ idle files */}
              {pageMode === "compress" && idleCount >= 2 && !isConverting && (
                <div className="mb-3 flex items-center gap-2.5 px-3 py-2.5 bg-slate-900/70 border border-violet-500/20 rounded-xl">
                  <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                  <span className="text-slate-400 text-xs shrink-0">All {idleCount} files</span>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={globalQuality}
                    onChange={e => batchSetQuality(Number(e.target.value))}
                    className="flex-1 accent-violet-500"
                  />
                  <span className="text-white text-xs font-mono w-8 text-right shrink-0">{globalQuality}%</span>
                  <span className="text-violet-400 text-xs shrink-0 w-24 text-right">
                    ≈{Math.round((1 - globalQuality / 100) * 100)}% smaller
                  </span>
                </div>
              )}

              {/* Batch format controls — shown when 2+ idle files share a category (convert mode only) */}
              {pageMode === "convert" && idleCategoryGroups.length > 0 && !isConverting && (
                <div className="mb-3 space-y-1.5">
                  {idleCategoryGroups.map(([category, items]) => {
                    const formats = getCompatibleOutputs(category, items[0].extension)
                      .filter(f => f !== items[0].extension && (items[0].extension !== "jpg" || f !== "jpeg") && (items[0].extension !== "jpeg" || f !== "jpg"));
                    const currentFmt = items[0].targetFormat;
                    const CATEGORY_LABEL: Partial<Record<Category, string>> = {
                      image: "images", video: "videos", audio: "audio files",
                      pdf: "PDFs", document: "documents", ebook: "ebooks",
                      gif: "GIFs", font: "fonts", archive: "archives",
                    };
                    return (
                      <div key={category} className="flex items-center gap-2.5 px-3 py-2 bg-slate-900/70 border border-slate-800/60 rounded-xl">
                        <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span className="text-slate-400 text-xs shrink-0">
                          Set all {items.length} {CATEGORY_LABEL[category] ?? category + " files"} to
                        </span>
                        <select
                          value={currentFmt}
                          onChange={e => batchSetFormat(category, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white rounded-md px-2 py-0.5 text-xs uppercase font-mono focus:outline-none focus:border-blue-500/60 cursor-pointer"
                        >
                          {formats.map(f => (
                            <option key={f} value={f}>{f.toUpperCase()}</option>
                          ))}
                        </select>
                        <span className="text-slate-600 text-xs">— updates instantly</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2.5">
                    {files.map((item) => (
                      <SortableFileCard key={item.id} item={item} onConvert={convertFile} onRemove={removeFile} onChange={updateFile} onOpenKeyModal={() => setKeyModalOpen(true)} />
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

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-5">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              {
                num: "1",
                icon: <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.503 11.096" /></svg>,
                title: "Drop your file",
                desc: "Drag & drop or click to browse — any file type works",
              },
              {
                num: "2",
                icon: <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>,
                title: "Convert or compress",
                desc: "Pick from 80+ output formats — or switch to Compress to shrink file size while keeping the same format",
              },
              {
                num: "3",
                icon: <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
                title: "Download instantly",
                desc: "Converted in your browser — nothing stored, no waiting",
              },
            ] as { num: string; icon: React.ReactNode; title: string; desc: string }[]).map(({ num, icon, title, desc }) => (
              <div key={num} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <p className="text-white font-semibold text-sm">{title}</p>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOOLS SECTION ────────────────────────────────────── */}
        <div className="border-t border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950">
          <div className="max-w-5xl mx-auto px-4 py-16">

            {/* Section header */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Browser Tools</p>
                <h2 className="text-4xl font-black text-white leading-tight">
                  60+ tools.<br />
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
            <ToolCategory label="Text & Code" icon={FileText} href="/tools#text-code" tools={[
              { href: "/tools/word-counter",    icon: Type,            title: "Word Counter",          desc: "Words, chars, sentences, reading time" },
              { href: "/tools/markdown",        icon: FileCode,        title: "Markdown Editor",        desc: "Live HTML preview split-pane editor" },
              { href: "/tools/diff",            icon: GitCompare,      title: "Text Diff",              desc: "Word-level inline diff, split view" },
              { href: "/tools/lorem",           icon: AlignLeft,       title: "Lorem Ipsum",            desc: "Paragraphs, sentences, or words" },
              { href: "/tools/base64",          icon: Shuffle,         title: "Base64",                 desc: "Encode or decode Base64 strings" },
              { href: "/tools/url-encode",      icon: LucideLink,      title: "URL Encoder",            desc: "Percent-encode or decode URLs" },
              { href: "/tools/hash",            icon: Hash,            title: "Hash Generator",         desc: "SHA-1, SHA-256, SHA-384, SHA-512" },
              { href: "/tools/json",            icon: Braces,          title: "JSON Formatter",        desc: "Validate, format, and minify JSON" },
              { href: "/tools/regex",           icon: Search,          title: "Regex Tester",           desc: "Live match highlighting" },
              { href: "/tools/csv-json",        icon: Table2,          title: "CSV ↔ JSON",             desc: "Convert with live table preview" },
              { href: "/tools/case-converter",  icon: CaseSensitive,   title: "Case Converter",        desc: "camelCase, snake_case, kebab & more" },
              { href: "/tools/grammar-checker", icon: SpellCheck,      title: "Grammar Checker",        desc: "Powered by LanguageTool API" },
              { href: "/tools/html-beautifier", icon: Code2,           title: "HTML Beautifier",        desc: "Format HTML with W3C standards" },
              { href: "/tools/js-beautifier",   icon: Wand2,           title: "JS Beautifier",          desc: "Format JavaScript & TypeScript" },
              { href: "/tools/css-beautifier",  icon: Paintbrush,      title: "CSS Beautifier",         desc: "Format CSS and SCSS" },
              { href: "/tools/python-beautifier",icon: Terminal,       title: "Python Beautifier",     desc: "PEP 8 compliant formatting" },
              { href: "/tools/css-minifier",    icon: PackageMinus,    title: "CSS Minifier",           desc: "Strip whitespace & comments" },
              { href: "/tools/js-minifier",     icon: Minimize2,       title: "JS Minifier",            desc: "Minify JavaScript for production" },
            ]} />

            {/* ── Design & Visual ── */}
            <ToolCategory label="Design & Visual" icon={Shapes} href="/tools#design-visual" tools={[
              { href: "/tools/color-picker",   icon: Pipette,       title: "Color Picker",            desc: "HEX, RGB, HSL, CMYK values" },
              { href: "/tools/palette",        icon: Palette,       title: "Palette Generator",        desc: "Complementary, triadic, analogous" },
              { href: "/tools/gradient",       icon: Blend,         title: "CSS Gradient Builder",    desc: "Linear & radial with CSS output" },
              { href: "/tools/glassmorphism",  icon: Layers,        title: "Glassmorphism",           desc: "Glass-effect UI cards" },
              { href: "/tools/box-shadow",     icon: BoxSelect,     title: "Box Shadow Builder",      desc: "Multi-layer shadows, live preview" },
              { href: "/tools/border-radius",  icon: SquareDashed,  title: "Border Radius",           desc: "Per-side visual builder" },
              { href: "/tools/favicon",        icon: Bookmark,      title: "Favicon Generator",       desc: "All standard sizes from any image" },
              { href: "/tools/css-animation",  icon: Layers,        title: "CSS Animation Builder",   desc: "Keyframe editor with live preview" },
              { href: "/tools/placeholder-image", icon: ImagePlus,  title: "Placeholder Image",       desc: "Any size, custom colors & text" },
            ]} />

            {/* ── Converters & Calculators ── */}
            <ToolCategory label="Converters & Calculators" icon={ArrowLeftRight} href="/tools#converters" tools={[
              { href: "/tools/units",              icon: Ruler,       title: "Unit Converter",        desc: "Length, weight, temp, area & more" },
              { href: "/tools/aspect-ratio",       icon: Maximize2,   title: "Aspect Ratio",          desc: "Lock ratio, solve dimensions" },
              { href: "/tools/timestamp",          icon: Clock,       title: "Timestamp Converter",   desc: "Unix ↔ human-readable dates" },
              { href: "/tools/base-converter",     icon: Binary,      title: "Number Base",           desc: "Binary, octal, decimal, hex" },
              { href: "/tools/cron",               icon: Timer,       title: "Cron Builder",          desc: "Schedule expressions + preview" },
              { href: "/tools/password",           icon: Key,         title: "Password Generator",    desc: "Cryptographically secure" },
              { href: "/tools/calculator",              icon: Calculator,  title: "Calculator",            desc: "Basic + scientific, with history" },
              { href: "/tools/currency-converter",      icon: Coins,       title: "Currency Converter",    desc: "Live rates for 160+ currencies" },
              { href: "/tools/time-calculator",         icon: Hourglass,   title: "Time Calculator",       desc: "Durations, add & subtract time" },
              { href: "/tools/percentage-calculator",   icon: Percent,     title: "Percentage Calc",       desc: "X% of Y, change, increase & more" },
              { href: "/tools/average-calculator",      icon: BarChart2,   title: "Average Calculator",    desc: "Mean, median, mode, range & sum" },
            ]} />

            {/* ── Images & PDFs ── */}
            <ToolCategory label="Images & PDFs" icon={Image} href="/tools#images-pdfs" tools={[
              { href: "/tools/image-editor",       icon: ImagePlus,   title: "Image Editor",          desc: "Resize, crop, rotate, markup" },
              { href: "/tools/image-compressor",   icon: Minimize2,   title: "Image Compressor",       desc: "Compress JPEG, PNG, WEBP in bulk" },
              { href: "/tools/background-remover", icon: Scissors,    title: "Background Remover",    desc: "AI-powered, runs in browser" },
              { href: "/tools/raster-to-svg",      icon: PenTool,     title: "PNG/JPG → SVG",         desc: "Vectorize raster images" },
              { href: "/tools/svg-to-png",         icon: FileImage,   title: "SVG → PNG",             desc: "Up to 4× scale output" },
              { href: "/tools/exif",               icon: Camera,      title: "EXIF Viewer",            desc: "Camera, GPS & image metadata" },
              { href: "/tools/pdf-merge",          icon: FilePlus2,   title: "PDF Merge",              desc: "Combine & reorder PDFs" },
              { href: "/tools/pdf-to-images",      icon: ScanLine,    title: "PDF to Images",         desc: "Each page to PNG" },
              { href: "/tools/pdf-pages",          icon: FileMinus2,  title: "Reorder / Delete Pages", desc: "Drag to reorder, click to remove" },
              { href: "/tools/qr",                 icon: QrCode,      title: "QR Generator",          desc: "Any URL or text → QR PNG" },
            ]} />

            {/* ── Reference ── */}
            <ToolCategory label="Reference" icon={Library} href="/tools#reference" tools={[
              { href: "/tools/http-status",         icon: Globe,      title: "HTTP Status Codes",    desc: "Searchable reference for every code" },
              { href: "/tools/framework-reference", icon: BookOpen,   title: "Framework Reference",  desc: "Tailwind, Bootstrap, React, Next.js" },
              { href: "/tools/utm-builder",         icon: Tag,        title: "UTM Builder",          desc: "Build UTM-tagged campaign URLs" },
              { href: "/tools/ssl-checker",         icon: Lock,       title: "SSL Checker",          desc: "Cert expiry, issuer, SANs & fingerprint" },
              { href: "/tools/dns-lookup",          icon: Server,     title: "DNS Lookup",           desc: "A, AAAA, MX, NS, TXT & SOA records" },
              { href: "/tools/sitemap-generator",   icon: Map,        title: "Sitemap Generator",    desc: "Build or fetch a sitemap.xml" },
              { href: "/tools/page-speed",          icon: Gauge,      title: "Page Speed Estimator", desc: "TTFB, load time & performance tips" },
            ]} />

            <div className="mt-10 text-center">
              <Link href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20">
                Browse all 60+ tools
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">Open by design.</span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">No account. No tracking. No data sold. Everything runs in your browser. Your files never leave your device.</p>
                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                  {[
                    { icon: "⚡", label: "Browser-powered", desc: "All 60+ tools run 100% client-side" },
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

        {/* ── SUPPORT / DONATE ───────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-slate-900/60 to-slate-900/40">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div className="px-8 py-10 flex flex-col sm:flex-row items-center gap-8">
              {/* Left: coffee icon */}
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-5xl">
                ☕
              </div>
              {/* Center: text */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">Support FileSpark</p>
                <h2 className="text-2xl font-black text-white mb-2">
                  Like what you see?
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  FileSpark is free to start with no account required. If it's saved you time, consider buying me a coffee — it helps keep the lights on and new tools coming.
                </p>
                <div className="flex flex-wrap gap-3 mt-5 justify-center sm:justify-start">
                  {["No account required", "No data harvesting", "New tools regularly"].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Right: CTA */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <a
                  href="https://buymeacoffee.com/Huppa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-sm transition-all duration-150 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/30 hover:scale-105"
                >
                  <span className="text-xl">☕</span>
                  Buy me a coffee
                </a>
                <p className="text-slate-600 text-xs">Even $1 makes a difference</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

/* ── Tool category section ───────────────────────────────────── */
function ToolCategory({ label, icon: Icon, href, tools }: {
  label: string; icon: React.ComponentType<{ className?: string }>; href: string;
  tools: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[];
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <Link href={href} className="flex items-center gap-2 group">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">{label}</span>
        </Link>
        <div className="h-px flex-1 bg-slate-800/60" />
        <span className="text-slate-600 text-xs">{tools.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {tools.map(({ href: toolHref, icon: ToolIcon, title, desc }) => (
          <Link key={toolHref} href={toolHref}
            className="group flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900 transition-all duration-150">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center mt-0.5">
              <ToolIcon className="w-4 h-4 text-slate-400" />
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

