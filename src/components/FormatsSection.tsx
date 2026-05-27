"use client";

import { useState, useEffect } from "react";

interface FormatGroup {
  label: string;
  icon: string;
  color: string;
  formats: string[];
}

const FORMAT_GROUPS: FormatGroup[] = [
  {
    label: "Images", icon: "🖼️", color: "blue",
    formats: [
      "JPG","JPEG","JFIF","JPE","PNG","WEBP","AVIF","GIF","TIFF","BMP",
      "SVG","APNG","HEIC","HEIF","PSD","EPS","AI","XCF","TGA","ICO",
      "DDS","PCX","CR2","NEF","ARW","DNG",
    ],
  },
  {
    label: "Video", icon: "🎬", color: "violet",
    formats: ["MP4","AVI","MOV","MKV","WEBM","FLV","WMV","MPEG","MPG","M4V","3GP"],
  },
  {
    label: "Audio", icon: "🎵", color: "green",
    formats: ["MP3","WAV","FLAC","AAC","OGG","M4A","WMA","OPUS"],
  },
  {
    label: "Documents", icon: "📝", color: "orange",
    formats: ["DOCX","DOC","ODT","RTF","TXT","CSV","PDF"],
  },
  {
    label: "Spreadsheets", icon: "📊", color: "emerald",
    formats: ["XLSX","XLS","ODS","CSV"],
  },
  {
    label: "Slides", icon: "📑", color: "amber",
    formats: ["PPTX","PPT","ODP"],
  },
  {
    label: "E-books", icon: "📚", color: "pink",
    formats: [
      "EPUB","MOBI","AZW","AZW3","FB2","LIT","LRF","PDB",
      "HTMLZ","TXTZ","CBZ","CBR","CHM","DJVU","PRC",
    ],
  },
  {
    label: "Archives", icon: "📦", color: "slate",
    formats: ["ZIP","TAR","GZ","BZ2","7Z","RAR","XZ"],
  },
  {
    label: "Fonts", icon: "🔤", color: "cyan",
    formats: ["TTF","OTF","WOFF","WOFF2"],
  },
];

const COLOR_MAP: Record<string, { pill: string; badge: string; count: string }> = {
  blue:    { pill: "bg-blue-500/15 border-blue-500/40 text-blue-300",    badge: "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20",    count: "bg-blue-500/20 text-blue-300" },
  violet:  { pill: "bg-violet-500/15 border-violet-500/40 text-violet-300", badge: "bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/20", count: "bg-violet-500/20 text-violet-300" },
  green:   { pill: "bg-green-500/15 border-green-500/40 text-green-300",  badge: "bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20",  count: "bg-green-500/20 text-green-300" },
  orange:  { pill: "bg-orange-500/15 border-orange-500/40 text-orange-300", badge: "bg-orange-500/10 border-orange-500/20 text-orange-300 hover:bg-orange-500/20", count: "bg-orange-500/20 text-orange-300" },
  emerald: { pill: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20", count: "bg-emerald-500/20 text-emerald-300" },
  amber:   { pill: "bg-amber-500/15 border-amber-500/40 text-amber-300",  badge: "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20",  count: "bg-amber-500/20 text-amber-300" },
  pink:    { pill: "bg-pink-500/15 border-pink-500/40 text-pink-300",    badge: "bg-pink-500/10 border-pink-500/20 text-pink-300 hover:bg-pink-500/20",    count: "bg-pink-500/20 text-pink-300" },
  slate:   { pill: "bg-slate-600/30 border-slate-500/40 text-slate-300",  badge: "bg-slate-700/40 border-slate-600/30 text-slate-300 hover:bg-slate-700/60",  count: "bg-slate-600/30 text-slate-300" },
  cyan:    { pill: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",    badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20",    count: "bg-cyan-500/20 text-cyan-300" },
};

const CATEGORY_MAP: Record<string, string> = {
  image: "Images", video: "Video", audio: "Audio", gif: "Video",
  pdf: "Documents", document: "Documents", ebook: "E-books",
  archive: "Archives", font: "Fonts",
};

const TOTAL_UNIQUE = [...new Set(FORMAT_GROUPS.flatMap((g) => g.formats))].length;

interface Props { selectedCategory?: string }

export default function FormatsSection({ selectedCategory }: Props) {
  const [active, setActive] = useState("Images");

  useEffect(() => {
    if (!selectedCategory || selectedCategory === "all") return;
    const mapped = CATEGORY_MAP[selectedCategory];
    if (mapped) setActive(mapped);
  }, [selectedCategory]);

  const current = FORMAT_GROUPS.find((g) => g.label === active) ?? FORMAT_GROUPS[0];
  const colors = COLOR_MAP[current.color];

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Supported Formats</p>
            <h2 className="text-3xl font-black text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{TOTAL_UNIQUE}+</span> formats
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Across {FORMAT_GROUPS.length} categories — from everyday files to the obscure ones.
            </p>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {FORMAT_GROUPS.map(({ label, icon, color, formats }) => {
          const isActive = active === label;
          return (
            <button key={label} onClick={() => setActive(label)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                isActive ? COLOR_MAP[color].pill : "bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-200 hover:bg-slate-800/70"
              }`}>
              <span>{icon}</span>
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                isActive ? COLOR_MAP[color].count : "bg-slate-700/60 text-slate-600"
              }`}>{formats.length}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-slate-800/60 mb-4" />

      {/* Format badges */}
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-1.5">
          {current.formats.map((fmt) => (
            <span key={fmt}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono tracking-wide transition-all duration-100 cursor-default select-none ${colors.badge}`}>
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>
        <p className="text-slate-700 text-xs mt-3">
          {current.formats.length} {current.label.toLowerCase()} format{current.formats.length !== 1 ? "s" : ""} supported
        </p>
      </div>
    </div>
  );
}
