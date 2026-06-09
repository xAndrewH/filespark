"use client";

import { useMemo, useEffect, useState } from "react";
import type { FileItem, Category } from "@/types";
import { getCompatibleOutputs } from "@/lib/formats";
import { formatBytes, replaceExtension } from "@/lib/utils";
import { getCloudConvertKey } from "@/lib/cloudconvert-client";
import SearchableSelect from "./SearchableSelect";

const ICONS: Record<Category, string> = {
  video:    "🎬",
  audio:    "🎵",
  image:    "🖼️",
  pdf:      "📄",
  document: "📝",
  gif:      "🎞️",
  ebook:    "📚",
  font:     "🔤",
  archive:  "📦",
};

const STATUS_BAR: Record<string, string> = {
  idle:             "bg-slate-700/60",
  "loading-ffmpeg": "bg-blue-500",
  converting:       "bg-blue-500",
  done:             "bg-green-500",
  error:            "bg-red-500",
};

const STATUS_BORDER: Record<string, string> = {
  idle:             "border-slate-800/60",
  "loading-ffmpeg": "border-slate-800/60",
  converting:       "border-slate-800/60",
  done:             "border-green-900/40",
  error:            "border-red-900/40",
};

const PREVIEW_CATEGORIES = new Set<Category>(["image", "gif"]);

function ImageThumbnail({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!src) return <span className="text-xl">🖼️</span>;

  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover rounded-lg"
      onError={() => setSrc(null)}
    />
  );
}

interface Props {
  item: FileItem;
  onConvert: (item: FileItem) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, updates: Partial<FileItem>) => void;
  onOpenKeyModal?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function FileCard({ item, onConvert, onRemove, onChange, onOpenKeyModal, dragHandleProps }: Props) {
  const outputFormats = useMemo(() => {
    const compatible = getCompatibleOutputs(item.category, item.extension);
    const norm = item.extension === "jpg" ? "jpeg" : item.extension === "jpeg" ? "jpg" : item.extension;
    return compatible.filter((f) => f !== item.extension && f !== norm);
  }, [item.category, item.extension]);

  const canCompress = ["image", "video", "audio"].includes(item.category);
  const isProcessing = item.status === "converting" || item.status === "loading-ffmpeg";
  const isDone = item.status === "done";
  const isError = item.status === "error";
  const showPreview = PREVIEW_CATEGORIES.has(item.category);
  const needsCloudConvert = (item.category === "document" || item.category === "ebook") && !getCloudConvertKey();

  const downloadName = item.resultName ?? replaceExtension(item.name, item.targetFormat);

  return (
    <div className={`relative bg-slate-900/70 border rounded-xl transition-colors duration-300 ${STATUS_BORDER[item.status] ?? "border-slate-800/60"}`}>
      {/* Colored left status bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-colors duration-300 ${STATUS_BAR[item.status] ?? "bg-slate-700/60"}`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Icon / thumbnail */}
          <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center text-lg mt-0.5">
            {showPreview ? <ImageThumbnail file={item.file} /> : ICONS[item.category]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate leading-snug" title={item.name}>
                  {item.name}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{formatBytes(item.size)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Drag handle */}
                {dragHandleProps && (
                  <div
                    {...dragHandleProps}
                    className="p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors rounded"
                    title="Drag to reorder"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
                      <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
                      <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  title="Remove"
                  className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Controls | idle or error */}
            {!isProcessing && !isDone && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Mode toggle */}
                {canCompress && (
                  <div className="flex rounded-lg overflow-hidden border border-slate-700/80 text-xs shrink-0">
                    <button
                      onClick={() => onChange(item.id, { mode: "convert" })}
                      className={`px-3 py-1.5 transition-colors ${
                        item.mode === "convert"
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Convert
                    </button>
                    <button
                      onClick={() => onChange(item.id, { mode: "compress" })}
                      className={`px-3 py-1.5 transition-colors ${
                        item.mode === "compress"
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      Compress
                    </button>
                  </div>
                )}

                {/* Format selector | searchable */}
                {item.mode === "convert" && outputFormats.length > 0 && (
                  <SearchableSelect
                    value={item.targetFormat}
                    options={outputFormats}
                    onChange={(val) => onChange(item.id, { targetFormat: val })}
                  />
                )}

                {/* Quality slider + savings estimate */}
                {item.mode === "compress" && (
                  <div className="flex-1 min-w-40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs shrink-0">Quality</span>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={item.quality}
                        onChange={(e) => onChange(item.id, { quality: Number(e.target.value) })}
                        className="flex-1 accent-violet-500"
                      />
                      <span className="text-white text-xs w-8 text-right shrink-0 font-mono">{item.quality}%</span>
                    </div>
                    <div className="flex items-center gap-2 px-0.5">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-150"
                          style={{ width: `${100 - item.quality}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs shrink-0">
                        {formatBytes(Math.round(item.size * item.quality / 100))} est. · ~{Math.round((1 - item.quality / 100) * 100)}% saved
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onConvert(item)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm shadow-blue-500/20"
                >
                  {item.mode === "compress" ? "Compress" : "Convert"}
                </button>
              </div>
            )}

            {/* CloudConvert upfront warning */}
            {needsCloudConvert && !isProcessing && !isDone && !isError && (
              <div className="mt-2.5 flex items-start gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                <span className="text-yellow-300 text-xs leading-relaxed">
                  ⚡ Requires a free CloudConvert API key · 25 conversions/day free
                  {onOpenKeyModal && (
                    <button onClick={onOpenKeyModal} className="ml-1.5 underline underline-offset-2 hover:text-yellow-200 transition-colors">Add key</button>
                  )}
                </span>
              </div>
            )}

            {/* Loading FFmpeg */}
            {item.status === "loading-ffmpeg" && (
              <div className="mt-3">
                <p className="text-blue-400 text-xs mb-1.5 font-medium">Loading FFmpeg engine…</p>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-blue-500 rounded-full progress-indeterminate" />
                </div>
              </div>
            )}

            {/* Converting progress */}
            {item.status === "converting" && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-blue-400 text-xs font-medium">Converting…</span>
                  <span className="text-blue-400 text-xs font-mono">{item.progress}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300 progress-shimmer"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Done */}
            {isDone && (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Done
                </span>
                {item.mode === "compress" && item.resultSize != null && (
                  <span className="text-xs text-violet-400 font-medium">
                    {formatBytes(item.resultSize)}
                    {item.resultSize < item.size && (
                      <span className="text-green-400 ml-1">
                        (saved {Math.round((1 - item.resultSize / item.size) * 100)}%)
                      </span>
                    )}
                  </span>
                )}
                <a
                  href={item.resultUrl}
                  download={downloadName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-green-500/20"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => onChange(item.id, { status: "idle", progress: 0, resultUrl: undefined })}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                >
                  Convert again
                </button>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <span className="text-red-400 text-xs break-words min-w-0 flex-1">✗ {item.error ?? "Unknown error"}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenKeyModal && item.error?.includes("CloudConvert") && (
                    <button
                      onClick={onOpenKeyModal}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Add API Key
                    </button>
                  )}
                  <button
                    onClick={() => onChange(item.id, { status: "idle", progress: 0, error: undefined })}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
