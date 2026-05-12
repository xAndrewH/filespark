"use client";

import { useRef, useState, useCallback } from "react";
import type { Category } from "@/types";
import { CATEGORIES, INPUT_FORMATS } from "@/lib/formats";

type TabCategory = Category | "all";

interface Props {
  category?: TabCategory;
  onFiles: (files: File[]) => void;
  variant?: "hero" | "compact";
}

export default function FileDropzone({ category = "all", onFiles, variant = "hero" }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept =
    category === "all"
      ? Object.values(CATEGORIES).map((c) => c.mime).join(",")
      : CATEGORIES[category as Category].mime;

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles]
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);

  const open = () => inputRef.current?.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept={accept}
      onChange={(e) => handleFiles(e.target.files)}
      className="hidden"
      onClick={(e) => e.stopPropagation()}
    />
  );

  /* ── Hero variant ──────────────────────────────────────────── */
  if (variant === "hero") {
    return (
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center gap-5 py-16 rounded-2xl border transition-all duration-200 cursor-default select-none overflow-hidden ${
          isDragging
            ? "border-blue-500/70 bg-blue-500/8"
            : "border-slate-700/50 bg-slate-900/40"
        }`}
      >
        {/* Subtle inner glow when dragging */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.08),transparent)]" />
        )}

        {/* Upload icon */}
        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isDragging
            ? "bg-blue-500/15 border border-blue-500/30"
            : "bg-slate-800/80 border border-slate-700/60"
        }`}>
          {isDragging && (
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-pulse" />
          )}
          <svg
            className={`w-7 h-7 transition-colors relative z-10 ${isDragging ? "text-blue-400" : "text-slate-400"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.503 11.096" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1.5">
            {isDragging ? "Release to upload" : "Drop your file here"}
          </p>
          <p className="text-slate-500 text-sm">
            {isDragging ? "We'll take it from here" : "or click the button below to browse"}
          </p>
        </div>

        {/* Select File button */}
        <button
          onClick={open}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Select File
        </button>

        <p className="text-slate-600 text-xs">
          Video &amp; audio processed locally · Images &amp; docs up to 4 MB
        </p>
        {input}
      </div>
    );
  }

  /* ── Compact variant ───────────────────────────────────────── */
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={open}
      className={`flex items-center justify-center gap-2.5 h-12 rounded-xl border border-dashed cursor-pointer transition-all duration-150 ${
        isDragging
          ? "border-blue-500/60 bg-blue-500/8 text-blue-400"
          : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-900/40"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span className="text-xs font-medium">Add more files</span>
      {input}
    </div>
  );
}
