"use client";

import { useEffect, useRef, useState } from "react";
import { getHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";
import { formatBytes } from "@/lib/utils";

const CATEGORY_EMOJI: Record<string, string> = {
  video: "🎬", audio: "🎵", image: "🖼️", pdf: "📄",
  document: "📝", gif: "🎞️", ebook: "📚", font: "🔤", archive: "📦",
};

function groupByDate(entries: HistoryEntry[]): { label: string; entries: HistoryEntry[] }[] {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86_400_000;
  const weekAgo   = today - 6 * 86_400_000;

  const groups: Record<string, HistoryEntry[]> = {};

  for (const entry of entries) {
    const d = entry.timestamp;
    const label =
      d >= today     ? "Today" :
      d >= yesterday ? "Yesterday" :
      d >= weekAgo   ? "This week" : "Older";
    (groups[label] ??= []).push(entry);
  }

  const order = ["Today", "Yesterday", "This week", "Older"];
  return order.filter((l) => groups[l]).map((label) => ({ label, entries: groups[label] }));
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Incremented by parent whenever a new entry is saved so the drawer refreshes */
  version: number;
  sessionDownloads: Map<string, { url: string; filename: string }>;
}

export default function HistoryDrawer({ open, onClose, version, sessionDownloads }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reload from localStorage whenever drawer opens or a new conversion finishes
  useEffect(() => {
    if (open) setEntries(getHistory());
  }, [open, version]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setEntries(getHistory());
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  const groups = groupByDate(entries);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-950 border-l border-slate-800 z-50 flex flex-col
          transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-semibold">Conversion History</span>
            {entries.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                {entries.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl">
                🕐
              </div>
              <p className="text-slate-400 text-sm">No conversion history yet</p>
              <p className="text-slate-500 text-xs max-w-48 leading-relaxed">
                Every file you convert will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ label, entries: group }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {group.map((entry) => (
                      <HistoryCard key={entry.id} entry={entry} onDelete={handleDelete} download={sessionDownloads.get(entry.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex-shrink-0">
          <p className="text-xs text-slate-500 text-center">
            Stored locally in your browser · never uploaded
          </p>
        </div>

        {/* Clear all confirmation | overlays inside the drawer only */}
        {confirmClear && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mx-5 shadow-xl w-full max-w-sm">
              <div className="w-11 h-11 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base text-center mb-1">Clear all history?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">
                This will permanently delete all {entries.length} conversion{entries.length !== 1 ? "s" : ""} from your history. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function HistoryCard({ entry, onDelete, download }: {
  entry: HistoryEntry;
  onDelete: (id: string) => void;
  download?: { url: string; filename: string };
}) {
  const emoji = CATEGORY_EMOJI[entry.category] ?? "📁";
  const time  = new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sizeChange = entry.resultSize && entry.originalSize
    ? Math.round(((entry.resultSize - entry.originalSize) / entry.originalSize) * 100)
    : null;

  const handleDownload = () => {
    if (!download) return;
    const a = document.createElement("a");
    a.href = download.url;
    a.download = download.filename;
    a.click();
  };

  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 transition-colors">
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-xs font-medium truncate" title={entry.originalName}>
          {entry.originalName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-slate-500 text-xs uppercase">{entry.originalExt}</span>
          <svg className="w-3 h-3 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="text-blue-400 text-xs uppercase font-medium">{entry.targetFormat}</span>
          {entry.mode === "compress" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-medium">
              compressed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-500 text-[10px]">{formatBytes(entry.originalSize)}</span>
          {sizeChange !== null && (
            <>
              <span className="text-slate-700 text-[10px]">→</span>
              <span className={`text-[10px] font-medium ${sizeChange < 0 ? "text-green-400" : "text-slate-400"}`}>
                {formatBytes(entry.resultSize)}
                {sizeChange < 0 && ` (${Math.abs(sizeChange)}% smaller)`}
              </span>
            </>
          )}
          <span className="text-slate-700 text-[10px] ml-auto">{time}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {download ? (
          <button
            onClick={handleDownload}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
            aria-label="Download"
            title="Re-download"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5" title="Available during this session only">
            <div className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600" aria-label="Download unavailable">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-slate-500 text-[11px] leading-none whitespace-nowrap">Session expired</span>
          </div>
        )}
        <button
          onClick={() => onDelete(entry.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-md text-slate-600 hover:text-red-400 hover:bg-slate-700"
          aria-label="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
