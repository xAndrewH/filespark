import Link from "next/link";
import type { Metadata } from "next";
import { ToolsScrollSaver, ToolsScrollRestorer } from "@/components/ToolsScrollHandler";

export const metadata: Metadata = { title: "Tools — FileFlow" };

const CATEGORIES = [
  {
    id: "text-code",
    name: "Text & Code",
    tools: [
      { href: "/tools/word-counter",  icon: "📝", title: "Word Counter",             description: "Count words, characters, sentences, and reading time. Includes top-word frequency." },
      { href: "/tools/markdown",      icon: "✍️", title: "Markdown Editor",          description: "Split-pane editor with live HTML preview and copy-to-HTML button." },
      { href: "/tools/diff",          icon: "⟺",  title: "Text Diff Checker",        description: "Paste two blocks of text and see exactly what changed, line by line." },
      { href: "/tools/lorem",         icon: "¶",  title: "Lorem Ipsum Generator",    description: "Generate paragraphs, sentences, or words of placeholder text." },
      { href: "/tools/base64",        icon: "🔤", title: "Base64 Encoder / Decoder", description: "Encode plain text to Base64 or decode Base64 strings back to text." },
      { href: "/tools/url-encode",    icon: "🔗", title: "URL Encoder / Decoder",    description: "Percent-encode URLs or decode encoded query strings instantly." },
      { href: "/tools/hash",          icon: "🔐", title: "Hash Generator",            description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser." },
      { href: "/tools/json",          icon: "{ }", title: "JSON Formatter",           description: "Validate, format with configurable indentation, and minify JSON." },
      { href: "/tools/regex",         icon: ".*", title: "Regex Tester",              description: "Test regular expressions with live match highlighting and match list." },
      { href: "/tools/csv-json",      icon: "⇄",  title: "CSV ↔ JSON",               description: "Convert between CSV and JSON with a live table preview." },
    ],
  },
  {
    id: "design-visual",
    name: "Design & Visual",
    tools: [
      { href: "/tools/color-picker",   icon: "🎨", title: "Color Picker",             description: "Pick a color and instantly get HEX, RGB, HSL, and CMYK values. Build palettes." },
      { href: "/tools/palette",        icon: "🖌️", title: "Color Palette Generator",  description: "Generate complementary, triadic, analogous, and shade palettes from any color." },
      { href: "/tools/gradient",       icon: "🌈", title: "CSS Gradient Builder",     description: "Build linear and radial gradients visually and copy the CSS output." },
      { href: "/tools/glassmorphism",  icon: "🪟", title: "Glassmorphism Generator",  description: "Build glass-effect UI cards with blur, opacity, and border controls." },
      { href: "/tools/box-shadow",     icon: "🔲", title: "Box Shadow Builder",       description: "Build CSS box shadows with multiple layers, presets, and live preview." },
      { href: "/tools/border-radius",  icon: "⬜", title: "Border Radius Builder",    description: "Shape rounded corners per-side visually and copy the CSS output." },
      { href: "/tools/favicon",        icon: "⭐", title: "Favicon Generator",        description: "Upload any image and get favicon PNGs at all standard sizes as a ZIP." },
    ],
  },
  {
    id: "converters",
    name: "Converters & Calculators",
    tools: [
      { href: "/tools/units",          icon: "📐", title: "Unit Converter",           description: "Convert length, weight, temperature, area, volume, speed, and data units." },
      { href: "/tools/aspect-ratio",   icon: "⛶",  title: "Aspect Ratio Calculator",  description: "Calculate width or height while locking an aspect ratio. Includes presets." },
      { href: "/tools/timestamp",      icon: "🕐", title: "Timestamp Converter",      description: "Convert Unix timestamps to human-readable dates and back, with a live clock." },
      { href: "/tools/base-converter", icon: "🔢", title: "Number Base Converter",    description: "Convert numbers between binary, octal, decimal, and hexadecimal with bit view." },
      { href: "/tools/cron",           icon: "⏱️", title: "Cron Expression Builder",  description: "Build and validate cron schedules with presets and next-run preview." },
      { href: "/tools/password",       icon: "🔑", title: "Password Generator",       description: "Cryptographically secure passwords with strength scoring and bulk generation." },
    ],
  },
  {
    id: "reference",
    name: "Reference",
    tools: [
      { href: "/tools/http-status",    icon: "📡", title: "HTTP Status Codes",        description: "Searchable reference for every HTTP status code with descriptions." },
    ],
  },
  {
    id: "images-pdfs",
    name: "Images & PDFs",
    tools: [
      { href: "/tools/image-editor",       icon: "🖼️", title: "Image Editor",        description: "Resize, rotate, flip, and adjust quality. Supports JPG, PNG, WEBP and more." },
      { href: "/tools/raster-to-svg",      icon: "✦",  title: "PNG / JPG → SVG",     description: "Vectorize raster images to scalable SVG with color trace, B&W trace, or embed." },
      { href: "/tools/image-compressor",   icon: "🗜️", title: "Image Compressor",    description: "Compress JPEG, PNG, and WEBP images in bulk with quality control." },
      { href: "/tools/svg-to-png",         icon: "✦",  title: "SVG to PNG",          description: "Convert SVG files or pasted code to PNG at up to 4× scale." },
      { href: "/tools/background-remover", icon: "✂️", title: "Background Remover",  description: "AI-powered background removal — runs entirely in your browser." },
      { href: "/tools/exif",               icon: "📷", title: "EXIF Viewer",          description: "Read image metadata — camera settings, GPS coordinates, timestamps and more." },
      { href: "/tools/pdf-merge",          icon: "📄", title: "PDF Merge",            description: "Combine multiple PDFs into one document, reorder pages before merging." },
      { href: "/tools/pdf-to-images",      icon: "🖨️", title: "PDF to Images",       description: "Convert each PDF page to a PNG at Standard, High, or Ultra quality." },
      { href: "/tools/qr",                 icon: "⬛", title: "QR Code Generator",   description: "Generate QR codes from any URL or text. Customize colors and download as PNG." },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileFlow
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Tools</h1>
          <p className="text-slate-400 text-lg">Standalone utilities — no account, no upload limits, all browser-side.</p>
        </div>

        <div className="space-y-12">
          {CATEGORIES.map(({ id, name, tools }) => (
            <div key={name} id={id} className="scroll-mt-8">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">{name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map(({ href, icon, title, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xl font-mono">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors">{title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 group-hover:text-blue-400 text-xs font-medium transition-colors">
                      Open
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToolsScrollSaver />
      <ToolsScrollRestorer />
    </div>
  );
}
