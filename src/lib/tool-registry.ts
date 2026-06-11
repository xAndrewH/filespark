import React from "react";
import { Type, FileCode, GitCompare, AlignLeft, Shuffle, Link as LucideLink, Hash, Braces, Search, Table2, CaseSensitive, SpellCheck, Code2, Wand2, Paintbrush, Terminal, Pipette, Palette, Blend, Layers, BoxSelect, SquareDashed, Bookmark, Ruler, Maximize2, Clock, Binary, Timer, Key, Calculator, Coins, Hourglass, Percent, BarChart2, ImagePlus, Minimize2, Scissors, PenTool, FileImage, Camera, FilePlus2, ScanLine, QrCode, Globe, BookOpen, Tag, Image, ZoomIn, FileMinus2, Replace, CalendarDays, Receipt, Wifi, MapPin, Play, ShieldCheck, Share2, Contrast, Database, Lock, Zap, Bot, Map, FileText, Mail, Smartphone, TrendingUp, DollarSign, Gauge, Server, MousePointer2, PackageMinus, Activity, LayoutTemplate, Newspaper, Code, PenLine, ListChecks, FileSearch, PieChart, Film, FileOutput, RefreshCw, Images } from "lucide-react";

export type IconComponent = React.ComponentType<{ className?: string }>;

export interface Tool {
  href: string;
  icon: IconComponent;
  title: string;
  description: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: IconComponent;
  tools: Tool[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "text-writing",
    name: "Text & Writing",
    icon: Type,
    tools: [
      { href: "/tools/word-counter",     icon: Type,          title: "Word Counter",             description: "Count words, characters, sentences, and reading time." },
      { href: "/tools/markdown",         icon: FileCode,      title: "Markdown Editor",          description: "Split-pane editor with live HTML preview." },
      { href: "/tools/diff",             icon: GitCompare,    title: "Text Diff Checker",        description: "Paste two texts and see exactly what changed." },
      { href: "/tools/lorem",            icon: AlignLeft,     title: "Lorem Ipsum Generator",    description: "Generate paragraphs, sentences, or words of placeholder text." },
      { href: "/tools/find-replace",     icon: Replace,       title: "Find & Replace",           description: "Find and replace text with plain-text or regex patterns." },
      { href: "/tools/case-converter",   icon: CaseSensitive, title: "Case Converter",           description: "Convert text between camelCase, snake_case, kebab-case, and more." },
      { href: "/tools/grammar-checker",  icon: SpellCheck,    title: "Grammar & Spell Checker",  description: "Check grammar, spelling, and style instantly in your browser." },
      { href: "/tools/html-to-markdown", icon: FileText,      title: "HTML → Markdown",          description: "Convert pasted HTML into clean Markdown." },
    ],
  },
  {
    id: "developer",
    name: "Developer",
    icon: Code2,
    tools: [
      { href: "/tools/json",              icon: Braces,       title: "JSON Formatter",           description: "Validate, format with configurable indentation, and minify JSON." },
      { href: "/tools/base64",            icon: Shuffle,      title: "Base64 Encoder / Decoder", description: "Encode plain text to Base64 or decode Base64 strings." },
      { href: "/tools/url-encode",        icon: LucideLink,   title: "URL Encoder / Decoder",    description: "Percent-encode URLs or decode encoded query strings." },
      { href: "/tools/hash",              icon: Hash,         title: "Hash Generator",           description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes." },
      { href: "/tools/regex",             icon: Search,       title: "Regex Tester",             description: "Test regular expressions with live match highlighting." },
      { href: "/tools/regex-cheatsheet",  icon: FileSearch,   title: "Regex Cheat Sheet",        description: "Searchable reference for regex syntax, anchors, quantifiers, and groups." },
      { href: "/tools/csv-json",          icon: Table2,       title: "CSV ↔ JSON",               description: "Convert between CSV and JSON with a live table preview." },
      { href: "/tools/html-beautifier",   icon: Code2,        title: "HTML Beautifier",          description: "Format and indent HTML following W3C best practices." },
      { href: "/tools/js-beautifier",     icon: Wand2,        title: "JavaScript Beautifier",    description: "Format JavaScript and TypeScript following Airbnb / ESLint standards." },
      { href: "/tools/css-beautifier",    icon: Paintbrush,   title: "CSS Beautifier",           description: "Format CSS, SCSS, and Sass with proper spacing and rule separation." },
      { href: "/tools/python-beautifier", icon: Terminal,     title: "Python Beautifier",        description: "Format Python code with PEP 8 compliant 4-space indentation." },
      { href: "/tools/css-minifier",      icon: PackageMinus, title: "CSS Minifier",             description: "Strip whitespace and comments from CSS to reduce file size." },
      { href: "/tools/js-minifier",       icon: Minimize2,    title: "JS Minifier",              description: "Minify JavaScript and TypeScript for production builds." },
      { href: "/tools/robots-generator",  icon: Bot,          title: "Robots.txt Generator",     description: "Build allow/disallow rules and preview your robots.txt file." },
      { href: "/tools/cron",              icon: Timer,        title: "Cron Expression Builder",  description: "Build and validate cron schedules with next-run preview." },
      { href: "/tools/timestamp",         icon: Clock,        title: "Timestamp Converter",      description: "Convert Unix timestamps to human-readable dates and back." },
      { href: "/tools/base-converter",    icon: Binary,       title: "Number Base Converter",    description: "Convert numbers between binary, octal, decimal, and hex." },
      { href: "/tools/password",          icon: Key,          title: "Password Generator",       description: "Cryptographically secure passwords with strength scoring." },
      { href: "/tools/code-to-image",     icon: Code,         title: "Code to Image",            description: "Turn a code snippet into a shareable, styled PNG." },
      { href: "/tools/jwt-decoder",       icon: ShieldCheck,  title: "JWT Decoder",              description: "Decode and inspect JWT headers, payloads, claims, and expiry." },
      { href: "/tools/image-to-base64",   icon: FileImage,    title: "Image → Base64",           description: "Convert images to Base64 data URIs, or decode them back to files." },
      { href: "/tools/mock-data",         icon: Database,     title: "Mock Data Generator",      description: "Build a schema and generate fake JSON, CSV, or SQL test data." },
      { href: "/tools/framework-reference", icon: BookOpen,   title: "Framework Reference",      description: "Snippets for Tailwind, Bootstrap, Sass, React, and Next.js." },
    ],
  },
  {
    id: "design",
    name: "Design",
    icon: Palette,
    tools: [
      { href: "/tools/color-picker",    icon: Pipette,        title: "Color Picker",             description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly." },
      { href: "/tools/palette",         icon: Palette,        title: "Color Palette Generator",  description: "Generate complementary, triadic, and analogous palettes." },
      { href: "/tools/gradient",        icon: Blend,          title: "CSS Gradient Builder",     description: "Build linear and radial gradients and copy the CSS." },
      { href: "/tools/glassmorphism",   icon: Layers,         title: "Glassmorphism Generator",  description: "Build glass-effect UI cards with blur and opacity controls." },
      { href: "/tools/box-shadow",      icon: BoxSelect,      title: "Box Shadow Builder",       description: "Build CSS box shadows with multiple layers and live preview." },
      { href: "/tools/border-radius",   icon: SquareDashed,   title: "Border Radius Builder",    description: "Shape rounded corners per-side visually and copy the CSS." },
      { href: "/tools/color-contrast",  icon: Contrast,       title: "Color Contrast Checker",   description: "Check foreground/background pairs against WCAG AA and AAA ratios." },
      { href: "/tools/css-grid",        icon: LayoutTemplate, title: "CSS Grid Builder",         description: "Visual grid builder | set rows, columns, and gaps, then copy the CSS." },
      { href: "/tools/css-animation",   icon: Zap,            title: "CSS Animation Builder",    description: "Build keyframe animations visually and export the CSS." },
      { href: "/tools/favicon",         icon: Bookmark,       title: "Favicon Generator",        description: "Upload any image and get favicon PNGs at all standard sizes." },
    ],
  },
  {
    id: "images-media",
    name: "Images & Media",
    icon: Image,
    tools: [
      { href: "/tools/image-editor",       icon: ImagePlus,  title: "Image Editor",                description: "Resize, rotate, flip, and adjust quality for any image." },
      { href: "/tools/image-converter",    icon: RefreshCw,  title: "Image Converter",             description: "Convert images between PNG, JPG, and WEBP in bulk." },
      { href: "/tools/image-compressor",   icon: Minimize2,  title: "Image Compressor",            description: "Compress JPEG, PNG, and WEBP images in bulk." },
      { href: "/tools/background-remover", icon: Scissors,   title: "Background Remover",          description: "Remove backgrounds instantly in your browser." },
      { href: "/tools/upscale-image",      icon: ZoomIn,     title: "Upscale Image",               description: "Upscale images up to 4× resolution using bilinear or nearest-neighbor." },
      { href: "/tools/raster-to-svg",      icon: PenTool,    title: "PNG / JPG → SVG",             description: "Vectorize raster images to scalable SVG." },
      { href: "/tools/svg-to-png",         icon: FileImage,  title: "SVG to PNG",                  description: "Convert SVG files or pasted code to PNG at up to 4× scale." },
      { href: "/tools/placeholder-image",  icon: ImagePlus,  title: "Placeholder Image Generator", description: "Generate placeholder images at any size with custom colors and text." },
      { href: "/tools/youtube-thumbnail",  icon: Play,       title: "YouTube Thumbnail Generator", description: "Design custom 1280×720 thumbnails with text, gradients, and images." },
      { href: "/tools/video-to-gif",       icon: Film,       title: "Video to GIF",                description: "Turn a clip of any video into an optimized GIF, right in your browser." },
      { href: "/tools/images-to-gif",      icon: Images,     title: "Images to GIF",               description: "Combine a sequence of images into an animated GIF." },
      { href: "/tools/exif",               icon: Camera,     title: "EXIF Viewer",                 description: "Read camera settings, GPS, and metadata from images." },
      { href: "/tools/qr",                 icon: QrCode,     title: "QR Code Generator",           description: "Generate QR codes from any URL or text. Download as PNG." },
      { href: "/tools/pdf-merge",          icon: FilePlus2,  title: "PDF Merge",                   description: "Combine multiple PDFs into one, reorder pages before merging." },
      { href: "/tools/image-to-pdf",       icon: FileOutput, title: "Image to PDF",                description: "Combine JPG, PNG, WEBP, or GIF images into a single PDF." },
      { href: "/tools/pdf-to-images",      icon: ScanLine,   title: "PDF to JPG / PNG / WEBP",     description: "Convert PDF pages to JPG, PNG, or WEBP images." },
      { href: "/tools/pdf-pages",          icon: FileMinus2, title: "Reorder / Delete PDF Pages",  description: "Drag to reorder or remove pages from a PDF before saving." },
    ],
  },
  {
    id: "seo-web",
    name: "SEO & Web",
    icon: Globe,
    tools: [
      { href: "/tools/responsive-viewer",   icon: Smartphone, title: "Responsive Design Viewer", description: "Capture real screenshots of any page at multiple device sizes, side by side." },
      { href: "/tools/page-speed",          icon: Gauge,      title: "Page Speed Estimator",    description: "Check load time, TTFB, resource counts, and get performance tips for any URL." },
      { href: "/tools/meta-tag-analyzer",   icon: Tag,        title: "Meta Tag Analyzer",       description: "Enter a URL and see all OG, Twitter Card, and SEO meta tags it serves." },
      { href: "/tools/og-preview",          icon: Share2,     title: "Social Card Preview",     description: "Enter a URL and see how it renders on Facebook, X, and LinkedIn." },
      { href: "/tools/http-headers",        icon: Activity,   title: "HTTP Header Analyzer",    description: "Fetch a URL and inspect all response headers, categorized and scored." },
      { href: "/tools/ssl-checker",         icon: Lock,       title: "SSL Certificate Checker", description: "Enter a domain and see cert expiry, issuer, SANs, and fingerprint." },
      { href: "/tools/dns-lookup",          icon: Server,     title: "DNS Lookup",              description: "Query A, AAAA, CNAME, MX, NS, TXT, and SOA records for any domain." },
      { href: "/tools/ip-lookup",           icon: MapPin,     title: "IP Address Lookup",       description: "Look up geolocation and network details for any IP address." },
      { href: "/tools/my-ip",               icon: Wifi,       title: "What's My IP",            description: "See your public IP address, location, and network info." },
      { href: "/tools/sitemap-generator",   icon: Map,        title: "Sitemap Generator",       description: "Paste a list of URLs and generate a valid sitemap.xml with per-URL overrides." },
      { href: "/tools/og-meta",             icon: Share2,     title: "OG Meta Tag Generator",   description: "Fill in title, description, and image | get the full Open Graph head block." },
      { href: "/tools/schema-generator",    icon: ListChecks, title: "Schema Markup Generator", description: "Choose a Schema.org type and get the JSON-LD snippet for your site." },
      { href: "/tools/utm-builder",         icon: Tag,        title: "UTM Builder",             description: "Build UTM-tagged URLs for campaign tracking." },
      { href: "/tools/http-status",         icon: Globe,      title: "HTTP Status Codes",       description: "Searchable reference for every HTTP status code." },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: TrendingUp,
    tools: [
      { href: "/tools/roas-calculator",     icon: TrendingUp, title: "ROAS Calculator",             description: "Enter ad spend and revenue to calculate return on ad spend." },
      { href: "/tools/roi-calculator",      icon: DollarSign, title: "ROI Calculator",              description: "Calculate ROI, net profit, and compound growth over time." },
      { href: "/tools/cpm-calculator",      icon: BarChart2,  title: "CPM / CPC / CTR Calculator",  description: "Enter any two ad metrics to instantly calculate the third." },
      { href: "/tools/conversion-rate",     icon: Percent,    title: "Conversion Rate Calculator",  description: "Calculate conversion rates, revenue impact, and A/B test significance." },
      { href: "/tools/email-preview",       icon: Mail,       title: "Email Subject Previewer",     description: "Preview how your subject line looks in Gmail and Apple Mail." },
      { href: "/tools/traffic-attribution", icon: PieChart,   title: "Traffic Source Attribution",  description: "Compare last-touch, first-touch, and linear attribution across channels." },
      { href: "/tools/landing-page-template", icon: Newspaper, title: "Landing Page Checklist",    description: "45-item checklist to audit your landing page against conversion best practices." },
      { href: "/tools/invoice-generator",   icon: PenLine,    title: "Invoice Generator",           description: "Fill in line items and preview a clean, printable invoice." },
    ],
  },
  {
    id: "calculators",
    name: "Calculators",
    icon: Calculator,
    tools: [
      { href: "/tools/calculator",            icon: Calculator,   title: "Calculator",               description: "Basic and advanced scientific calculator with history." },
      { href: "/tools/units",                 icon: Ruler,        title: "Unit Converter",           description: "Convert length, weight, temperature, area, volume, and more." },
      { href: "/tools/currency-converter",    icon: Coins,        title: "Currency Converter",       description: "Live exchange rates for 160+ currencies by country." },
      { href: "/tools/percentage-calculator", icon: Percent,      title: "Percentage Calculator",    description: "Calculate percentages, increases, decreases, and differences." },
      { href: "/tools/average-calculator",    icon: BarChart2,    title: "Average Calculator",       description: "Mean, median, mode, and range for any set of numbers." },
      { href: "/tools/time-calculator",       icon: Hourglass,    title: "Time Calculator",          description: "Calculate durations, add/subtract time, combine intervals." },
      { href: "/tools/age-calculator",        icon: CalendarDays, title: "Age Calculator",           description: "Calculate exact age in years, months, and days from a birthdate." },
      { href: "/tools/sales-tax",             icon: Receipt,      title: "Sales Tax Calculator",     description: "Calculate tax amount and total price for any rate." },
      { href: "/tools/aspect-ratio",          icon: Maximize2,    title: "Aspect Ratio Calculator",  description: "Calculate width or height while locking an aspect ratio." },
    ],
  },
];

export interface RegisteredTool extends Tool {
  category: string;
  categoryId: string;
}

export const ALL_TOOLS: RegisteredTool[] = TOOL_CATEGORIES.flatMap(c =>
  c.tools.map(t => ({ ...t, category: c.name, categoryId: c.id }))
);

export const TOOL_COUNT = ALL_TOOLS.length;
