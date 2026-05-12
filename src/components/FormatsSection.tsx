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

// Map category tab keys → FormatGroup label
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

  // Sync with the category tab — but only if the user hasn't manually picked a group
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "all") return;
    const mapped = CATEGORY_MAP[selectedCategory];
    if (mapped) setActive(mapped);
  }, [selectedCategory]);

  const current = FORMAT_GROUPS.find((g) => g.label === active) ?? FORMAT_GROUPS[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Formats Supported
        </div>
        <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight mb-1.5">
          Hundreds of formats, thousands of conversion types.
        </h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          The everyday ones, the niche ones, and a few you&apos;ve probably never heard of —{" "}
          <span className="text-white font-medium">{TOTAL_UNIQUE}+ formats</span> across{" "}
          <span className="text-white font-medium">{FORMAT_GROUPS.length} categories</span>,
          all available right now, in your browser.
        </p>
      </div>

      {/* Category pills */}
      <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-slate-800">
        {FORMAT_GROUPS.map(({ label, icon, formats }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                isActive
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              <span className="text-[11px]">{icon}</span>
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? "bg-blue-500/30 text-blue-300" : "bg-slate-700 text-slate-500"
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
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-mono font-medium tracking-wide hover:border-slate-500 hover:text-white transition-colors cursor-default select-none"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
