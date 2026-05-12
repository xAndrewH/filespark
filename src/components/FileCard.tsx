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

const STATUS_COLORS: Record<string, string> = {
  idle:           "border-slate-800",
  "loading-ffmpeg": "border-blue-800/50",
  converting:     "border-blue-800/50",
  done:           "border-green-800/50",
  error:          "border-red-800/50",
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
  const borderClass = STATUS_COLORS[item.status] ?? "border-slate-800";

  const downloadName = item.resultName ?? replaceExtension(item.name, item.targetFormat);

  return (
    <div className={`bg-slate-900 border rounded-xl p-4 transition-colors duration-300 ${borderClass}`}>
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="text-2xl mt-0.5 shrink-0">{ICONS[item.category]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate" title={item.name}>
                {item.name}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{formatBytes(item.size)}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              title="Remove"
              className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 p-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Controls — idle or error (retry resets to idle) */}
          {!isProcessing && !isDone && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Mode toggle */}
              {canCompress && (
                <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs shrink-0">
                  <button
                    onClick={() => onChange(item.id, { mode: "convert" })}
                    className={`px-3 py-1.5 transition-colors ${
                      item.mode === "convert" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Convert
                  </button>
                  <button
                    onClick={() => onChange(item.id, { mode: "compress" })}
                    className={`px-3 py-1.5 transition-colors ${
                      item.mode === "compress" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Compress
                  </button>
                </div>
              )}

              {/* Format selector (convert mode) */}
              {item.mode === "convert" && outputFormats.length > 0 && (
                <select
                  value={item.targetFormat}
                  onChange={(e) => onChange(item.id, { targetFormat: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  {outputFormats.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              {/* Quality slider (compress mode) */}
              {item.mode === "compress" && (
                <div className="flex items-center gap-2 flex-1 min-w-32">
                  <span className="text-slate-400 text-xs shrink-0">Quality:</span>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={item.quality}
                    onChange={(e) => onChange(item.id, { quality: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-white text-xs w-8 text-right shrink-0">{item.quality}%</span>
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => onConvert(item)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                {item.mode === "compress" ? "Compress" : "Convert"}
              </button>
            </div>
          )}

          {/* Loading FFmpeg */}
          {item.status === "loading-ffmpeg" && (
            <div className="mt-3">
              <p className="text-blue-400 text-xs mb-1.5">Loading FFmpeg engine…</p>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-blue-500 rounded-full progress-indeterminate" />
              </div>
            </div>
          )}

          {/* Progress bar */}
          {item.status === "converting" && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-blue-400 text-xs">Converting…</span>
                <span className="text-blue-400 text-xs font-mono">{item.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Done */}
          {isDone && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="text-green-400 text-xs font-medium">✓ Done!</span>
              <a
                href={item.resultUrl}
                download={downloadName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors"
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
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
