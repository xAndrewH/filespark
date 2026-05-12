"use client";

import { useRef, useState, useEffect } from "react";
import type { Category } from "@/types";

type TabCategory = Category | "all";

const TABS: { key: TabCategory; label: string; emoji: string }[] = [
  { key: "all",      label: "All",      emoji: "✨" },
  { key: "video",    label: "Video",    emoji: "🎬" },
  { key: "audio",    label: "Audio",    emoji: "🎵" },
  { key: "image",    label: "Image",    emoji: "🖼️" },
  { key: "pdf",      label: "PDF",      emoji: "📄" },
  { key: "document", label: "Document", emoji: "📝" },
  { key: "gif",      label: "GIF",      emoji: "🎞️" },
  { key: "ebook",    label: "eBook",    emoji: "📚" },
  { key: "font",     label: "Font",     emoji: "🔤" },
  { key: "archive",  label: "Archive",  emoji: "📦" },
];

interface Props {
  selected: TabCategory;
  onChange: (c: TabCategory) => void;
}

export default function CategoryTabs({ selected, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Scroll left"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Fade left */}
      {canScrollLeft && (
        <div className="absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1"
      >
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              selected === key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Fade right */}
      {canScrollRight && (
        <div className="absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Scroll right"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
