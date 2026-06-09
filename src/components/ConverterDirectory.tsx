"use client";

import { useState } from "react";

export interface DirectoryItem {
  label: string;
  category: string;
  targetFormat?: string;
  mode?: "convert" | "compress";
  inputFilter?: string;
}

// Maps category tab keys → which section names to show
const CATEGORY_TO_SECTIONS: Record<string, string[]> = {
  video:    ["Video & Audio"],
  audio:    ["Video & Audio"],
  image:    ["Image"],
  pdf:      ["PDF & Documents"],
  document: ["PDF & Documents"],
  gif:      ["GIF"],
  ebook:    ["eBook"],
  font:     ["Font"],
  archive:  ["Archive"],
};

interface Props {
  activeLabel?: string;
  selectedCategory?: string;
  onSelect: (item: DirectoryItem) => void;
}

const CONVERTERS: { section: string; emoji: string; color: string; items: DirectoryItem[] }[] = [
  {
    section: "Video & Audio",
    emoji: "🎬",
    color: "violet",
    items: [
      { label: "Video Converter",  category: "video" },
      { label: "Audio Converter",  category: "audio" },
      { label: "MP3 Converter",    category: "audio",  targetFormat: "mp3" },
      { label: "MP4 to MP3",       category: "video",  targetFormat: "mp3",  inputFilter: "mp4" },
      { label: "Video to MP3",     category: "video",  targetFormat: "mp3" },
      { label: "MP4 Converter",    category: "video",  targetFormat: "mp4",  inputFilter: "mp4" },
      { label: "MOV to MP4",       category: "video",  targetFormat: "mp4",  inputFilter: "mov" },
      { label: "MP3 to OGG",       category: "audio",  targetFormat: "ogg",  inputFilter: "mp3" },
      { label: "WAV to MP3",       category: "audio",  targetFormat: "mp3",  inputFilter: "wav" },
      { label: "FLAC to MP3",      category: "audio",  targetFormat: "mp3",  inputFilter: "flac" },
      { label: "MKV to MP4",       category: "video",  targetFormat: "mp4",  inputFilter: "mkv" },
      { label: "AVI to MP4",       category: "video",  targetFormat: "mp4",  inputFilter: "avi" },
    ],
  },
  {
    section: "Image",
    emoji: "🖼️",
    color: "emerald",
    items: [
      { label: "Image Converter",  category: "image" },
      { label: "WEBP to PNG",      category: "image",  targetFormat: "png",  inputFilter: "webp" },
      { label: "WEBP to JPG",      category: "image",  targetFormat: "jpg",  inputFilter: "webp" },
      { label: "HEIC to JPG",      category: "image",  targetFormat: "jpg",  inputFilter: "heic" },
      { label: "HEIC to PNG",      category: "image",  targetFormat: "png",  inputFilter: "heic" },
      { label: "PNG to SVG",       category: "image",  targetFormat: "svg",  inputFilter: "png" },
      { label: "JFIF to PNG",      category: "image",  targetFormat: "png",  inputFilter: "jfif" },
      { label: "SVG Converter",    category: "image",  inputFilter: "svg" },
      { label: "PSD to PNG",       category: "image",  targetFormat: "png",  inputFilter: "psd" },
      { label: "PSD to JPG",       category: "image",  targetFormat: "jpg",  inputFilter: "psd" },
      { label: "EPS to PNG",       category: "image",  targetFormat: "png",  inputFilter: "eps" },
      { label: "EPS to PDF",       category: "image",  targetFormat: "pdf",  inputFilter: "eps" },
      { label: "AI to PNG",        category: "image",  targetFormat: "png",  inputFilter: "ai" },
      { label: "TGA to PNG",       category: "image",  targetFormat: "png",  inputFilter: "tga" },
      { label: "ICO Converter",    category: "image",  targetFormat: "ico" },
      { label: "RAW to JPG",       category: "image",  targetFormat: "jpg",  inputFilter: "cr2" },
      { label: "DNG to JPG",       category: "image",  targetFormat: "jpg",  inputFilter: "dng" },
    ],
  },
  {
    section: "PDF & Documents",
    emoji: "📄",
    color: "amber",
    items: [
      { label: "PDF Converter",       category: "pdf" },
      { label: "Document Converter",  category: "document" },
      { label: "PDF to Word",         category: "pdf",      targetFormat: "docx" },
      { label: "PDF to JPG",          category: "pdf",      targetFormat: "jpg" },
      { label: "PDF to EPUB",         category: "pdf",      targetFormat: "epub" },
      { label: "DOCX to PDF",         category: "document", targetFormat: "pdf",  inputFilter: "docx" },
      { label: "XLSX to PDF",         category: "document", targetFormat: "pdf",  inputFilter: "xlsx" },
      { label: "PPTX to PDF",         category: "document", targetFormat: "pdf",  inputFilter: "pptx" },
      { label: "JPG to PDF",          category: "pdf",      targetFormat: "pdf",  inputFilter: "jpg" },
      { label: "HEIC to PDF",         category: "pdf",      targetFormat: "pdf",  inputFilter: "heic" },
    ],
  },
  {
    section: "GIF",
    emoji: "🎞️",
    color: "pink",
    items: [
      { label: "Video to GIF",   category: "gif",  targetFormat: "gif" },
      { label: "MP4 to GIF",     category: "gif",  targetFormat: "gif",  inputFilter: "mp4" },
      { label: "WEBM to GIF",    category: "gif",  targetFormat: "gif",  inputFilter: "webm" },
      { label: "GIF to MP4",     category: "gif",  targetFormat: "mp4",  inputFilter: "gif" },
      { label: "GIF to APNG",    category: "gif",  targetFormat: "apng", inputFilter: "gif" },
      { label: "APNG to GIF",    category: "gif",  targetFormat: "gif",  inputFilter: "apng" },
      { label: "MOV to GIF",     category: "gif",  targetFormat: "gif",  inputFilter: "mov" },
      { label: "AVI to GIF",     category: "gif",  targetFormat: "gif",  inputFilter: "avi" },
      { label: "Image to GIF",   category: "gif",  targetFormat: "gif" },
    ],
  },
  {
    section: "eBook",
    emoji: "📚",
    color: "cyan",
    items: [
      { label: "eBook Converter",  category: "ebook" },
      { label: "EPUB to MOBI",     category: "ebook", targetFormat: "mobi",  inputFilter: "epub" },
      { label: "MOBI to EPUB",     category: "ebook", targetFormat: "epub",  inputFilter: "mobi" },
      { label: "EPUB to PDF",      category: "ebook", targetFormat: "pdf",   inputFilter: "epub" },
      { label: "EPUB to AZW3",     category: "ebook", targetFormat: "azw3",  inputFilter: "epub" },
      { label: "AZW to EPUB",      category: "ebook", targetFormat: "epub",  inputFilter: "azw" },
      { label: "AZW3 to EPUB",     category: "ebook", targetFormat: "epub",  inputFilter: "azw3" },
      { label: "FB2 to EPUB",      category: "ebook", targetFormat: "epub",  inputFilter: "fb2" },
      { label: "LIT to EPUB",      category: "ebook", targetFormat: "epub",  inputFilter: "lit" },
      { label: "PDF to EPUB",      category: "ebook", targetFormat: "epub",  inputFilter: "pdf" },
      { label: "DJVU to PDF",      category: "ebook", targetFormat: "pdf",   inputFilter: "djvu" },
      { label: "CBZ to EPUB",      category: "ebook", targetFormat: "epub",  inputFilter: "cbz" },
    ],
  },
  {
    section: "Font",
    emoji: "🔤",
    color: "rose",
    items: [
      { label: "Font Converter",   category: "font" },
      { label: "TTF to WOFF",      category: "font",  targetFormat: "woff",  inputFilter: "ttf" },
      { label: "TTF to WOFF2",     category: "font",  targetFormat: "woff2", inputFilter: "ttf" },
      { label: "OTF to WOFF",      category: "font",  targetFormat: "woff",  inputFilter: "otf" },
      { label: "OTF to WOFF2",     category: "font",  targetFormat: "woff2", inputFilter: "otf" },
      { label: "WOFF to TTF",      category: "font",  targetFormat: "ttf",   inputFilter: "woff" },
      { label: "WOFF2 to TTF",     category: "font",  targetFormat: "ttf",   inputFilter: "woff2" },
      { label: "WOFF to WOFF2",    category: "font",  targetFormat: "woff2", inputFilter: "woff" },
      { label: "WOFF2 to WOFF",    category: "font",  targetFormat: "woff",  inputFilter: "woff2" },
    ],
  },
  {
    section: "Archive",
    emoji: "📦",
    color: "orange",
    items: [
      { label: "Archive Converter", category: "archive" },
      { label: "ZIP to TAR",        category: "archive", targetFormat: "tar",  inputFilter: "zip" },
      { label: "ZIP to 7Z",         category: "archive", targetFormat: "7z",   inputFilter: "zip" },
      { label: "ZIP to TAR.GZ",     category: "archive", targetFormat: "gz",   inputFilter: "zip" },
      { label: "7Z to ZIP",         category: "archive", targetFormat: "zip",  inputFilter: "7z" },
      { label: "RAR to ZIP",        category: "archive", targetFormat: "zip",  inputFilter: "rar" },
      { label: "TAR to ZIP",        category: "archive", targetFormat: "zip",  inputFilter: "tar" },
      { label: "TAR.GZ to ZIP",     category: "archive", targetFormat: "zip",  inputFilter: "gz" },
      { label: "RAR to 7Z",         category: "archive", targetFormat: "7z",   inputFilter: "rar" },
    ],
  },
];

const COMPRESSORS: { section: string; emoji: string; color: string; items: DirectoryItem[] }[] = [
  {
    section: "Video & Audio",
    emoji: "🎬",
    color: "violet",
    items: [
      { label: "Video Compressor", category: "video", mode: "compress" },
      { label: "MP3 Compressor",   category: "audio", mode: "compress", inputFilter: "mp3" },
      { label: "WAV Compressor",   category: "audio", mode: "compress", inputFilter: "wav" },
    ],
  },
  {
    section: "Image",
    emoji: "🖼️",
    color: "emerald",
    items: [
      { label: "Image Compressor", category: "image", mode: "compress" },
      { label: "JPEG Compressor",  category: "image", mode: "compress", inputFilter: "jpg" },
      { label: "PNG Compressor",   category: "image", mode: "compress", inputFilter: "png" },
      { label: "WebP Compressor",  category: "image", mode: "compress", inputFilter: "webp" },
    ],
  },
  {
    section: "PDF",
    emoji: "📄",
    color: "amber",
    items: [
      { label: "PDF Compressor",   category: "pdf",   mode: "compress" },
    ],
  },
  {
    section: "GIF",
    emoji: "🎞️",
    color: "pink",
    items: [
      { label: "GIF Compressor",   category: "gif",   mode: "compress" },
    ],
  },
];

const colorMap: Record<string, { header: string; pill: string; pillActive: string; dot: string }> = {
  violet: { header: "text-violet-400", dot: "bg-violet-500",  pill: "hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30",  pillActive: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
  emerald:{ header: "text-emerald-400",dot: "bg-emerald-500", pill: "hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30",pillActive: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  amber:  { header: "text-amber-400",  dot: "bg-amber-500",   pill: "hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30",    pillActive: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  pink:   { header: "text-pink-400",   dot: "bg-pink-500",    pill: "hover:bg-pink-500/10 hover:text-pink-300 hover:border-pink-500/30",        pillActive: "bg-pink-500/15 text-pink-300 border-pink-500/40" },
  cyan:   { header: "text-cyan-400",   dot: "bg-cyan-500",    pill: "hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30",        pillActive: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40" },
  rose:   { header: "text-rose-400",   dot: "bg-rose-500",    pill: "hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30",        pillActive: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
  orange: { header: "text-orange-400", dot: "bg-orange-500",  pill: "hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30",  pillActive: "bg-orange-500/15 text-orange-300 border-orange-500/40" },
};

export default function ConverterDirectory({ activeLabel, selectedCategory, onSelect }: Props) {
  const [tab, setTab]   = useState<"convert" | "compress">("convert");
  const [open, setOpen] = useState(true);

  const allowedSections = selectedCategory && selectedCategory !== "all"
    ? CATEGORY_TO_SECTIONS[selectedCategory]
    : null;

  const allData = tab === "convert" ? CONVERTERS : COMPRESSORS;
  const data    = allowedSections
    ? allData.filter((g) => allowedSections.includes(g.section))
    : allData;

  const categoryLabel = allowedSections ? data[0]?.section ?? "Tools" : "All Tools";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm">{categoryLabel}</span>
          <span className="text-slate-600 text-xs">·</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
            <button
              onClick={() => setTab("convert")}
              className={`px-3 py-1 font-medium transition-colors ${tab === "convert" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Convert
            </button>
            <button
              onClick={() => setTab("compress")}
              className={`px-3 py-1 font-medium transition-colors ${tab === "compress" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Compress
            </button>
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          {open ? "Hide" : "Show"}
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Grid | animated collapse, capped height with internal scroll */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="overflow-y-auto max-h-96 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-800/60">
            {data.map(({ section, emoji, color, items }) => {
              const c = colorMap[color] ?? colorMap.violet;
              return (
                <div key={section} className="px-3 py-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${c.header}`}>{section}</span>
                    <span className="text-[10px]">{emoji}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const isActive = activeLabel === item.label;
                      return (
                        <button
                          key={item.label}
                          onClick={() => onSelect(item)}
                          className={`text-left text-xs px-2 py-1 rounded-md border transition-all duration-150 ${
                            isActive
                              ? `${c.pillActive} border font-medium`
                              : `text-slate-400 border-transparent ${c.pill}`
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
