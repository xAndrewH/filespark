"use client";

import type { FileItem, Category } from "@/types";
import { OUTPUT_FORMATS } from "@/lib/formats";
import { formatBytes, replaceExtension } from "@/lib/utils";

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

interface Props {
  item: FileItem;
  onConvert: (item: FileItem) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, updates: Partial<FileItem>) => void;
}

export default function FileCard({ item, onConvert, onRemove, onChange }: Props) {
  const allOutputs = OUTPUT_FORMATS[item.category];
  const outputFormats = allOutputs.filter(
    (f) => f !== item.extension && f !== (item.extension === "jpg" ? "jpeg" : item.extension)
  );

  const canCompress = ["image", "video", "audio"].includes(item.category);
  const isProcessing = item.status === "converting" || item.status === "loading-ffmpeg";
  const isDone = item.status === "done";
  const isError = item.status === "error";

  const downloadName = item.resultName ?? replaceExtension(item.name, item.targetFormat);

  return (
    <div className={`relative bg-slate-900/70 border rounded-xl overflow-hidden transition-colors duration-300 ${STATUS_BORDER[item.status] ?? "border-slate-800/60"}`}>
      {/* Colored left status bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-colors duration-300 ${STATUS_BAR[item.status] ?? "bg-slate-700/60"}`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Category icon badge */}
          <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-base mt-0.5">
            {ICONS[item.category]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate leading-snug" title={item.name}>
                  {item.name}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{formatBytes(item.size)}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                title="Remove"
                className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 p-1 -mr-0.5 rounded-md hover:bg-slate-800"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Controls — idle or error */}
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

                {/* Format selector */}
                {item.mode === "convert" && outputFormats.length > 0 && (
                  <select
                    value={item.targetFormat}
                    onChange={(e) => onChange(item.id, { targetFormat: e.target.value })}
                    className="bg-slate-800/80 border border-slate-700/80 text-white text-xs rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-500/70"
                  >
                    {outputFormats.map((f) => (
                      <option key={f} value={f}>
                        {f.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}

                {/* Quality slider */}
                {item.mode === "compress" && (
                  <div className="flex items-center gap-2 flex-1 min-w-32">
                    <span className="text-slate-400 text-xs shrink-0">Quality</span>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={item.quality}
                      onChange={(e) => onChange(item.id, { quality: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white text-xs w-8 text-right shrink-0 font-mono">{item.quality}%</span>
                  </div>
                )}

                {/* Convert / Compress button */}
                <button
                  onClick={() => onConvert(item)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm shadow-blue-500/20"
                >
                  {item.mode === "compress" ? "Compress" : "Convert"}
                </button>
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
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="text-red-400 text-xs truncate max-w-xs">✗ {item.error ?? "Unknown error"}</span>
                <button
                  onClick={() => onChange(item.id, { status: "idle", progress: 0, error: undefined })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
