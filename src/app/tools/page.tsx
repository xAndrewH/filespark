"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "text-code",
    name: "Text & Code",
    icon: "✍️",
    tools: [
      { href: "/tools/word-counter",    icon: "📝", title: "Word Counter",             description: "Count words, characters, sentences, and reading time." },
      { href: "/tools/markdown",        icon: "✍️", title: "Markdown Editor",          description: "Split-pane editor with live HTML preview." },
      { href: "/tools/diff",            icon: "⟺",  title: "Text Diff Checker",        description: "Paste two texts and see exactly what changed." },
      { href: "/tools/lorem",           icon: "¶",  title: "Lorem Ipsum Generator",    description: "Generate paragraphs, sentences, or words of placeholder text." },
      { href: "/tools/base64",          icon: "🔤", title: "Base64 Encoder / Decoder", description: "Encode plain text to Base64 or decode Base64 strings." },
      { href: "/tools/url-encode",      icon: "🔗", title: "URL Encoder / Decoder",    description: "Percent-encode URLs or decode encoded query strings." },
      { href: "/tools/hash",            icon: "🔐", title: "Hash Generator",            description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes." },
      { href: "/tools/json",            icon: "{ }", title: "JSON Formatter",           description: "Validate, format with configurable indentation, and minify JSON." },
      { href: "/tools/regex",           icon: ".*", title: "Regex Tester",              description: "Test regular expressions with live match highlighting." },
      { href: "/tools/csv-json",        icon: "⇄",  title: "CSV ↔ JSON",               description: "Convert between CSV and JSON with a live table preview." },
      { href: "/tools/case-converter",  icon: "Aa", title: "Case Converter",           description: "Convert text between camelCase, snake_case, kebab-case, and more." },
      { href: "/tools/grammar-checker", icon: "✏️", title: "Grammar & Spell Checker",  description: "Check grammar, spelling, and style powered by LanguageTool." },
      { href: "/tools/html-beautifier",  icon: "🌐", title: "HTML Beautifier",           description: "Format and indent HTML following W3C best practices." },
      { href: "/tools/js-beautifier",    icon: "✨", title: "JavaScript Beautifier",     description: "Format JavaScript and TypeScript following Airbnb / ESLint standards." },
      { href: "/tools/css-beautifier",   icon: "🎨", title: "CSS Beautifier",            description: "Format CSS, SCSS, and Sass with proper spacing and rule separation." },
      { href: "/tools/python-beautifier",icon: "🐍", title: "Python Beautifier",         description: "Format Python code with PEP 8 compliant 4-space indentation." },
    ],
  },
  {
    id: "design-visual",
    name: "Design & Visual",
    icon: "🎨",
    tools: [
      { href: "/tools/color-picker",   icon: "🎨", title: "Color Picker",             description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly." },
      { href: "/tools/palette",        icon: "🖌️", title: "Color Palette Generator",  description: "Generate complementary, triadic, and analogous palettes." },
      { href: "/tools/gradient",       icon: "🌈", title: "CSS Gradient Builder",     description: "Build linear and radial gradients and copy the CSS." },
      { href: "/tools/glassmorphism",  icon: "🪟", title: "Glassmorphism Generator",  description: "Build glass-effect UI cards with blur and opacity controls." },
      { href: "/tools/box-shadow",     icon: "🔲", title: "Box Shadow Builder",       description: "Build CSS box shadows with multiple layers and live preview." },
      { href: "/tools/border-radius",  icon: "⬜", title: "Border Radius Builder",    description: "Shape rounded corners per-side visually and copy the CSS." },
      { href: "/tools/favicon",        icon: "⭐", title: "Favicon Generator",        description: "Upload any image and get favicon PNGs at all standard sizes." },
    ],
  },
  {
    id: "converters",
    name: "Converters & Calculators",
    icon: "🔢",
    tools: [
      { href: "/tools/units",              icon: "📐", title: "Unit Converter",          description: "Convert length, weight, temperature, area, volume, and more." },
      { href: "/tools/aspect-ratio",       icon: "⛶",  title: "Aspect Ratio Calculator", description: "Calculate width or height while locking an aspect ratio." },
      { href: "/tools/timestamp",          icon: "🕐", title: "Timestamp Converter",     description: "Convert Unix timestamps to human-readable dates and back." },
      { href: "/tools/base-converter",     icon: "🔢", title: "Number Base Converter",   description: "Convert numbers between binary, octal, decimal, and hex." },
      { href: "/tools/cron",               icon: "⏱️", title: "Cron Expression Builder", description: "Build and validate cron schedules with next-run preview." },
      { href: "/tools/password",           icon: "🔑", title: "Password Generator",      description: "Cryptographically secure passwords with strength scoring." },
      { href: "/tools/calculator",         icon: "🧮", title: "Calculator",              description: "Basic and advanced scientific calculator with history." },
      { href: "/tools/currency-converter", icon: "💱", title: "Currency Converter",      description: "Live exchange rates for 160+ currencies by country." },
      { href: "/tools/time-calculator",    icon: "⏱",  title: "Time Calculator",         description: "Calculate durations, add/subtract time, combine intervals." },
    ],
  },
  {
    id: "reference",
    name: "Reference",
    icon: "📚",
    tools: [
      { href: "/tools/http-status",        icon: "📡", title: "HTTP Status Codes",      description: "Searchable reference for every HTTP status code." },
      { href: "/tools/framework-reference", icon: "📚", title: "Framework Reference",    description: "Snippets for Tailwind, Bootstrap, Sass, React, and Next.js." },
    ],
  },
  {
    id: "images-pdfs",
    name: "Images & PDFs",
    icon: "🖼️",
    tools: [
      { href: "/tools/image-editor",       icon: "🖼️", title: "Image Editor",           description: "Resize, rotate, flip, and adjust quality for any image." },
      { href: "/tools/raster-to-svg",      icon: "✦",  title: "PNG / JPG → SVG",        description: "Vectorize raster images to scalable SVG." },
      { href: "/tools/image-compressor",   icon: "🗜️", title: "Image Compressor",       description: "Compress JPEG, PNG, and WEBP images in bulk." },
      { href: "/tools/svg-to-png",         icon: "✦",  title: "SVG to PNG",             description: "Convert SVG files or pasted code to PNG at up to 4× scale." },
      { href: "/tools/background-remover", icon: "✂️", title: "Background Remover",     description: "AI-powered background removal in your browser." },
      { href: "/tools/exif",               icon: "📷", title: "EXIF Viewer",             description: "Read camera settings, GPS, and metadata from images." },
      { href: "/tools/pdf-merge",          icon: "📄", title: "PDF Merge",               description: "Combine multiple PDFs into one, reorder pages before merging." },
      { href: "/tools/pdf-to-images",      icon: "🖨️", title: "PDF to Images",          description: "Convert each PDF page to a PNG at multiple quality levels." },
      { href: "/tools/qr",                 icon: "⬛", title: "QR Code Generator",      description: "Generate QR codes from any URL or text. Download as PNG." },
    ],
  },
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, category: c.name, categoryId: c.id })));
const TOTAL = ALL_TOOLS.length;

const COMING_SOON = [
  { icon: "🔍", title: "Upscale Image",              description: "AI-powered image upscaling up to 4× resolution." },
  { icon: "📑", title: "Reorder / Delete PDF Pages", description: "Drag to reorder or remove pages from a PDF before saving." },
  { icon: "🔎", title: "Find & Replace",             description: "Find and replace text across one or multiple files." },
  { icon: "▮",  title: "Barcode Generator",          description: "Generate Code 128, QR, EAN, and UPC barcodes." },
  { icon: "🎂", title: "Age Calculator",             description: "Calculate exact age in years, months, and days from a birthdate." },
  { icon: "💯", title: "Percentage Calculator",      description: "Calculate percentages, increases, decreases, and differences." },
  { icon: "📊", title: "Average Calculator",         description: "Mean, median, mode, and range for any set of numbers." },
  { icon: "🧾", title: "Sales Tax Calculator",       description: "Calculate tax amount and total price for any rate." },
  { icon: "🔗", title: "UTM Builder",                description: "Build UTM-tagged URLs for campaign tracking." },
  { icon: "🌐", title: "What's My IP",               description: "See your public IP address, location, and network info." },
  { icon: "🔍", title: "IP Address Lookup",          description: "Look up geolocation and network details for any IP." },
  { icon: "▶️", title: "YouTube Thumbnail Downloader", description: "Download thumbnails from any YouTube video in all resolutions." },
];

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter(t => {
      const matchesCategory = !activeCategory || t.categoryId === activeCategory;
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const isSearching = query.trim().length > 0 || activeCategory !== null;

  // Group filtered results by category for non-search view
  const groupedFiltered = useMemo(() => {
    return CATEGORIES.map(c => ({
      ...c,
      tools: filtered.filter(t => t.categoryId === c.id),
    })).filter(c => c.tools.length > 0);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-14">

        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileFlow
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tools</h1>
          <p className="text-slate-400 text-base">{TOTAL} browser-side utilities — no account, no uploads, no limits.</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${TOTAL} tools…`}
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-2xl pl-11 pr-10 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-blue-600 text-white"
                : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white"
            }`}>
            All <span className="ml-1 opacity-70">{TOTAL}</span>
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white"
              }`}>
              {c.name} <span className="ml-1 opacity-70">{c.tools.length}</span>
            </button>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-1">No tools match &ldquo;{query}&rdquo;</p>
            <p className="text-slate-600 text-sm">Try a different keyword or <button onClick={() => { setQuery(""); setActiveCategory(null); }} className="text-blue-400 hover:text-blue-300 underline underline-offset-2">browse all tools</button></p>
          </div>
        )}

        {/* Search results — flat list */}
        {isSearching && filtered.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(({ href, icon, title, description, category }) => (
                <ToolCard key={href} href={href} icon={icon} title={title} description={description} tag={category} />
              ))}
            </div>
          </div>
        )}

        {/* Default — grouped by category */}
        {!isSearching && (
          <div className="space-y-10">
            {groupedFiltered.map(({ id, name, tools }) => (
              <section key={id} id={id} className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white text-sm font-semibold">{name}</h2>
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-slate-600 text-xs">{tools.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map(({ href, icon, title, description }) => (
                    <ToolCard key={href} href={href} icon={icon} title={title} description={description} />
                  ))}
                </div>
              </section>
            ))}

            {/* Coming soon */}
            <section className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-white text-sm font-semibold">Coming Soon</h2>
                <div className="h-px flex-1 bg-slate-800/60" />
                <span className="text-slate-600 text-xs">{COMING_SOON.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMING_SOON.map(({ icon, title, description }) => (
                  <ComingSoonCard key={title} icon={icon} title={title} description={description} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ href, icon, title, description, tag }: {
  href: string; icon: string; title: string; description: string; tag?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/70 transition-all duration-150"
    >
      <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors leading-snug">{title}</h3>
          <svg className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mt-0.5 line-clamp-2">{description}</p>
        {tag && <span className="inline-block mt-1.5 text-[10px] text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded-md">{tag}</span>}
      </div>
    </Link>
  );
}

function ComingSoonCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 opacity-60 cursor-default select-none">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-lg grayscale">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-slate-400 font-medium text-sm leading-snug">{title}</h3>
          <span className="text-[9px] font-semibold tracking-wide uppercase text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700/50">Soon</span>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed mt-0.5 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
