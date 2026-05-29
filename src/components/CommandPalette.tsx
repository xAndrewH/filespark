"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const TOOLS = [
  { href: "/tools/word-counter",        title: "Word Counter",              desc: "Count words, characters, sentences, and reading time.",             cat: "Text & Code" },
  { href: "/tools/markdown",            title: "Markdown Editor",           desc: "Split-pane editor with live HTML preview.",                         cat: "Text & Code" },
  { href: "/tools/diff",                title: "Text Diff Checker",         desc: "Paste two texts and see exactly what changed.",                     cat: "Text & Code" },
  { href: "/tools/lorem",               title: "Lorem Ipsum Generator",     desc: "Generate paragraphs, sentences, or words of placeholder text.",     cat: "Text & Code" },
  { href: "/tools/base64",              title: "Base64 Encoder / Decoder",  desc: "Encode plain text to Base64 or decode Base64 strings.",             cat: "Text & Code" },
  { href: "/tools/url-encode",          title: "URL Encoder / Decoder",     desc: "Percent-encode URLs or decode encoded query strings.",              cat: "Text & Code" },
  { href: "/tools/hash",                title: "Hash Generator",            desc: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.",             cat: "Text & Code" },
  { href: "/tools/json",                title: "JSON Formatter",            desc: "Validate, format with configurable indentation, and minify JSON.",  cat: "Text & Code" },
  { href: "/tools/regex",               title: "Regex Tester",              desc: "Test regular expressions with live match highlighting.",            cat: "Text & Code" },
  { href: "/tools/csv-json",            title: "CSV ↔ JSON",                desc: "Convert between CSV and JSON with a live table preview.",           cat: "Text & Code" },
  { href: "/tools/case-converter",      title: "Case Converter",            desc: "Convert text between camelCase, snake_case, kebab-case.",           cat: "Text & Code" },
  { href: "/tools/grammar-checker",     title: "Grammar & Spell Checker",   desc: "Check grammar, spelling, and style.",                               cat: "Text & Code" },
  { href: "/tools/html-beautifier",     title: "HTML Beautifier",           desc: "Format and indent HTML.",                                          cat: "Text & Code" },
  { href: "/tools/js-beautifier",       title: "JavaScript Beautifier",     desc: "Format JavaScript and TypeScript.",                                 cat: "Text & Code" },
  { href: "/tools/css-beautifier",      title: "CSS Beautifier",            desc: "Format CSS, SCSS, and Sass.",                                      cat: "Text & Code" },
  { href: "/tools/python-beautifier",   title: "Python Beautifier",         desc: "Format Python code with PEP 8.",                                   cat: "Text & Code" },
  { href: "/tools/color-picker",        title: "Color Picker",              desc: "Pick a color and get HEX, RGB, HSL, and CMYK values.",             cat: "Design & Visual" },
  { href: "/tools/palette",             title: "Color Palette Generator",   desc: "Generate complementary, triadic, and analogous palettes.",          cat: "Design & Visual" },
  { href: "/tools/gradient",            title: "CSS Gradient Builder",      desc: "Build linear and radial gradients.",                               cat: "Design & Visual" },
  { href: "/tools/glassmorphism",       title: "Glassmorphism Generator",   desc: "Build glass-effect UI cards.",                                     cat: "Design & Visual" },
  { href: "/tools/box-shadow",          title: "Box Shadow Builder",        desc: "Build CSS box shadows with multiple layers.",                       cat: "Design & Visual" },
  { href: "/tools/border-radius",       title: "Border Radius Builder",     desc: "Shape rounded corners per-side visually.",                         cat: "Design & Visual" },
  { href: "/tools/favicon",             title: "Favicon Generator",         desc: "Upload any image and get favicon PNGs at all standard sizes.",     cat: "Design & Visual" },
  { href: "/tools/units",               title: "Unit Converter",            desc: "Convert length, weight, temperature, area, volume.",               cat: "Converters" },
  { href: "/tools/aspect-ratio",        title: "Aspect Ratio Calculator",   desc: "Calculate width or height while locking an aspect ratio.",         cat: "Converters" },
  { href: "/tools/timestamp",           title: "Timestamp Converter",       desc: "Convert Unix timestamps to human-readable dates.",                 cat: "Converters" },
  { href: "/tools/base-converter",      title: "Number Base Converter",     desc: "Convert between binary, octal, decimal, and hex.",                 cat: "Converters" },
  { href: "/tools/cron",                title: "Cron Expression Builder",   desc: "Build and validate cron schedules.",                               cat: "Converters" },
  { href: "/tools/password",            title: "Password Generator",        desc: "Cryptographically secure passwords.",                              cat: "Converters" },
  { href: "/tools/calculator",          title: "Calculator",                desc: "Basic and advanced scientific calculator.",                         cat: "Converters" },
  { href: "/tools/currency-converter",  title: "Currency Converter",        desc: "Live exchange rates for 160+ currencies.",                         cat: "Converters" },
  { href: "/tools/time-calculator",     title: "Time Calculator",           desc: "Calculate durations, add/subtract time.",                          cat: "Converters" },
  { href: "/tools/percentage-calculator", title: "Percentage Calculator",   desc: "Calculate percentages, increases, decreases.",                     cat: "Converters" },
  { href: "/tools/average-calculator",  title: "Average Calculator",        desc: "Mean, median, mode, and range.",                                   cat: "Converters" },
  { href: "/tools/http-status",         title: "HTTP Status Codes",         desc: "Searchable reference for every HTTP status code.",                 cat: "Reference" },
  { href: "/tools/framework-reference", title: "Framework Reference",       desc: "Snippets for Tailwind, Bootstrap, React, and Next.js.",            cat: "Reference" },
  { href: "/tools/utm-builder",         title: "UTM Builder",               desc: "Build UTM-tagged URLs for campaign tracking.",                     cat: "Reference" },
  { href: "/tools/image-editor",        title: "Image Editor",              desc: "Resize, rotate, flip, and adjust quality.",                        cat: "Images & PDFs" },
  { href: "/tools/raster-to-svg",       title: "PNG / JPG → SVG",          desc: "Vectorize raster images to scalable SVG.",                         cat: "Images & PDFs" },
  { href: "/tools/image-compressor",    title: "Image Compressor",          desc: "Compress JPEG, PNG, and WEBP images in bulk.",                     cat: "Images & PDFs" },
  { href: "/tools/svg-to-png",          title: "SVG to PNG",                desc: "Convert SVG files or pasted code to PNG.",                         cat: "Images & PDFs" },
  { href: "/tools/background-remover",  title: "Background Remover",        desc: "AI-powered background removal.",                                   cat: "Images & PDFs" },
  { href: "/tools/exif",                title: "EXIF Viewer",               desc: "Read camera settings, GPS, and metadata from images.",             cat: "Images & PDFs" },
  { href: "/tools/pdf-merge",           title: "PDF Merge",                 desc: "Combine multiple PDFs into one.",                                  cat: "Images & PDFs" },
  { href: "/tools/pdf-to-images",       title: "PDF to Images",             desc: "Convert each PDF page to a PNG.",                                  cat: "Images & PDFs" },
  { href: "/tools/qr",                  title: "QR Code Generator",         desc: "Generate QR codes from any URL or text.",                          cat: "Images & PDFs" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setIdx(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = query.trim()
    ? TOOLS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase()) ||
        t.cat.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 9)
    : TOOLS.slice(0, 9);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-950/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div className="w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setIdx(0); }}
              onKeyDown={e => {
                if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)); }
                if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
                if (e.key === "Enter" && filtered[idx]) navigate(filtered[idx].href);
              }}
              placeholder="Search tools…"
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-600"
            />
            <kbd className="text-slate-600 text-xs bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 font-mono shrink-0">esc</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No tools found</p>
            ) : (
              filtered.map((tool, i) => (
                <button
                  key={tool.href}
                  onClick={() => navigate(tool.href)}
                  onMouseEnter={() => setIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === idx ? "bg-blue-600/20" : "hover:bg-slate-800/40"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${i === idx ? "text-white" : "text-slate-300"}`}>{tool.title}</p>
                    <p className="text-slate-500 text-xs truncate">{tool.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0 hidden sm:block">{tool.cat}</span>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-800/60 flex items-center gap-4 text-xs text-slate-600">
            <span><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">↵</kbd> open</span>
            <span className="ml-auto"><kbd className="font-mono bg-slate-800/80 px-1 rounded text-[10px]">⌘K</kbd> toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
