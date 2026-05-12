"use client";

import { useState, useEffect } from "react";

interface FormatGroup {
  label: string;
  icon: string;
  formats: string[];
}

const FORMAT_GROUPS: FormatGroup[] = [
  {
    label: "Images",
    icon: "🖼️",
    formats: [
      "JPG","JPEG","JFIF","JPE","PNG","WEBP","AVIF","GIF","TIFF","BMP",
      "SVG","APNG","HEIC","HEIF","PSD","EPS","AI","XCF","TGA","ICO",
      "DDS","PCX","CR2","NEF","ARW","DNG",
    ],
  },
  {
    label: "Video",
    icon: "🎬",
    formats: ["MP4","AVI","MOV","MKV","WEBM","FLV","WMV","MPEG","MPG","M4V","3GP"],
  },
  {
    label: "Audio",
    icon: "🎵",
    formats: ["MP3","WAV","FLAC","AAC","OGG","M4A","WMA","OPUS"],
  },
  {
    label: "Documents",
    icon: "📝",
    formats: ["DOCX","DOC","ODT","RTF","TXT","CSV","PDF"],
  },
  {
    label: "Spreadsheets",
    icon: "📊",
    formats: ["XLSX","XLS","ODS","CSV"],
  },
  {
    label: "Slides",
    icon: "📑",
    formats: ["PPTX","PPT","ODP"],
  },
  {
    label: "E-books",
    icon: "📚",
    formats: [
      "EPUB","MOBI","AZW","AZW3","FB2","LIT","LRF","PDB",
      "HTMLZ","TXTZ","CBZ","CBR","CHM","DJVU","PRC",
    ],
  },
  {
    label: "Archives",
    icon: "📦",
    formats: ["ZIP","TAR","GZ","BZ2","7Z","RAR","XZ"],
  },
  {
    label: "Fonts",
    icon: "🔤",
    formats: ["TTF","OTF","WOFF","WOFF2"],
  },
];

const CATEGORY_MAP: Record<string, string> = {
  image:    "Images",
  video:    "Video",
  audio:    "Audio",
  gif:      "Video",
  pdf:      "Documents",
  document: "Documents",
  ebook:    "E-books",
  archive:  "Archives",
  font:     "Fonts",
};

const TOTAL_UNIQUE = [...new Set(FORMAT_GROUPS.flatMap((g) => g.formats))].length;

interface Props {
  selectedCategory?: string;
}

export default function FormatsSection({ selectedCategory }: Props) {
  const [active, setActive] = useState("Images");

  useEffect(() => {
    if (!selectedCategory || selectedCategory === "all") return;
    const mapped = CATEGORY_MAP[selectedCategory];
    if (mapped) setActive(mapped);
  }, [selectedCategory]);

  const current = FORMAT_GROUPS.find((g) => g.label === active) ?? FORMAT_GROUPS[0];

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Formats Supported</span>
        </div>
        <h2 className="text-white text-xl font-bold tracking-tight mb-1.5 leading-snug">
          {TOTAL_UNIQUE}+ formats across {FORMAT_GROUPS.length} categories.
        </h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          The everyday ones, the niche ones, and the ones you&apos;ve probably never heard of —
          all available right now.
        </p>
      </div>

      {/* Category pills */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-slate-800/60">
        {FORMAT_GROUPS.map(({ label, icon, formats }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                isActive
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-sm shadow-blue-500/10"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600/60 hover:bg-slate-800/70"
              }`}
            >
              <span className="text-[11px]">{icon}</span>
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                isActive ? "bg-blue-500/25 text-blue-300" : "bg-slate-700/70 text-slate-500"
              }`}>
                {formats.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Format badges */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {current.formats.map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-mono tracking-wide hover:border-slate-600 hover:text-white hover:bg-slate-800 transition-all duration-100 cursor-default select-none"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
