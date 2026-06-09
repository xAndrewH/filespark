"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Type, FileCode, GitCompare, AlignLeft, Shuffle, Link as LucideLink, Hash, Braces, Search, Table2, CaseSensitive, SpellCheck, Code2, Wand2, Paintbrush, Terminal, Pipette, Palette, Blend, Layers, BoxSelect, SquareDashed, Bookmark, Ruler, Maximize2, Clock, Binary, Timer, Key, Calculator, Coins, Hourglass, Percent, BarChart2, ImagePlus, Minimize2, Scissors, PenTool, FileImage, Camera, FilePlus2, ScanLine, QrCode, Globe, BookOpen, Tag, ArrowLeftRight, Image, ZoomIn, FileMinus2, Replace, Barcode, CalendarDays, Receipt, Wifi, MapPin, Play, Heart, ShieldCheck, FileJson2, Share2, Contrast, Fingerprint, Database, FileCode2, Lock, Zap, Network, Bot, Map, FileText, Columns, FlaskConical, MessageSquare, Mail, Smartphone, TrendingUp, Star, DollarSign, Users, Gauge, Server, CheckCheck, Sigma, Languages, MousePointer2, PackageMinus, Activity, Megaphone, LayoutTemplate, Newspaper, TestTube2, BookMarked, Code, Cpu, Radio, Rss, PenLine, ListChecks, Webhook, FileSearch, TableProperties, SlidersHorizontal, FileDiff, Workflow, ClipboardCheck, LineChart, PieChart, AreaChart, Film } from "lucide-react";
import { useToolHistory } from "@/hooks/useToolHistory";

type IconComponent = React.ComponentType<{ className?: string }>;

const CATEGORIES: { id: string; name: string; icon: IconComponent; tools: { href: string; icon: IconComponent; title: string; description: string }[] }[] = [
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
      { href: "/tools/image-compressor",   icon: Minimize2,  title: "Image Compressor",            description: "Compress JPEG, PNG, and WEBP images in bulk." },
      { href: "/tools/background-remover", icon: Scissors,   title: "Background Remover",          description: "Remove backgrounds instantly in your browser." },
      { href: "/tools/upscale-image",      icon: ZoomIn,     title: "Upscale Image",               description: "Upscale images up to 4× resolution using bilinear or nearest-neighbor." },
      { href: "/tools/raster-to-svg",      icon: PenTool,    title: "PNG / JPG → SVG",             description: "Vectorize raster images to scalable SVG." },
      { href: "/tools/svg-to-png",         icon: FileImage,  title: "SVG to PNG",                  description: "Convert SVG files or pasted code to PNG at up to 4× scale." },
      { href: "/tools/placeholder-image",  icon: ImagePlus,  title: "Placeholder Image Generator", description: "Generate placeholder images at any size with custom colors and text." },
      { href: "/tools/youtube-thumbnail",  icon: Play,       title: "YouTube Thumbnail Generator", description: "Design custom 1280×720 thumbnails with text, gradients, and images." },
      { href: "/tools/video-to-gif",       icon: Film,       title: "Video to GIF",                description: "Turn a clip of any video into an optimized GIF, right in your browser." },
      { href: "/tools/exif",               icon: Camera,     title: "EXIF Viewer",                 description: "Read camera settings, GPS, and metadata from images." },
      { href: "/tools/qr",                 icon: QrCode,     title: "QR Code Generator",           description: "Generate QR codes from any URL or text. Download as PNG." },
      { href: "/tools/pdf-merge",          icon: FilePlus2,  title: "PDF Merge",                   description: "Combine multiple PDFs into one, reorder pages before merging." },
      { href: "/tools/pdf-to-images",      icon: ScanLine,   title: "PDF to Images",               description: "Convert each PDF page to a PNG at multiple quality levels." },
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

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, category: c.name, categoryId: c.id })));
const TOTAL = ALL_TOOLS.length;

const COMING_SOON: { icon: IconComponent; title: string; description: string }[] = [
  // Developer | Data & Formats
  { icon: FileCode2,       title: "YAML ↔ JSON",                  description: "Convert between YAML and JSON with schema validation." },
  { icon: Code,            title: "XML Formatter",                 description: "Format, indent, and validate XML documents." },
  { icon: CheckCheck,      title: "JSON Schema Validator",         description: "Validate any JSON payload against a JSON Schema." },
  { icon: FileDiff,        title: "JSON Diff",                     description: "Compare two JSON objects and highlight added, removed, and changed keys." },
  { icon: FileJson2,       title: "JSON → TypeScript",             description: "Paste JSON and get a typed TypeScript interface or Zod schema instantly." },
  { icon: TableProperties, title: "TOML ↔ JSON",                   description: "Convert between TOML config files and JSON." },
  { icon: Database,        title: "SQL Formatter",                 description: "Format and beautify SQL queries with configurable indentation." },
  { icon: Terminal,        title: ".ENV Formatter",                description: "Sort, deduplicate, and convert .env files to JSON or YAML." },
  // Developer | Security & Network
  // JWT Decoder is now live at /tools/jwt-decoder
  { icon: Fingerprint,     title: "UUID / ULID Generator",         description: "Generate cryptographically random UUIDs and ULIDs in bulk." },
  // DNS Lookup is now live at /tools/dns-lookup
  { icon: Network,         title: "IP Subnet Calculator",          description: "CIDR notation → usable hosts, broadcast address, and IP range." },
  // IP Address Lookup is now live at /tools/ip-lookup
  { icon: Webhook,         title: "Webhook Tester",                description: "Generate a unique endpoint and inspect incoming POST payloads live." },
  // HTTP Header Analyzer is now live at /tools/http-headers
  // Developer | CSS & Frontend
  // CSS Minifier is now live at /tools/css-minifier
  // JS Minifier is now live at /tools/js-minifier
  { icon: MousePointer2,   title: "CSS Specificity Calculator",    description: "Paste a CSS selector and instantly see its specificity score." },
  { icon: SlidersHorizontal, title: "Tailwind Class Sorter",       description: "Sort Tailwind class strings per Prettier Tailwind plugin order." },
  // CSS Animation Builder is now live at /tools/css-animation
  // Developer | Coding Utilities
  // Robots.txt Generator is now live at /tools/robots-generator
  // HTML → Markdown is now live at /tools/html-to-markdown
  { icon: Sigma,           title: "Chmod Calculator",              description: "Click a permissions grid and get the octal code and symbolic notation." },
  { icon: Cpu,             title: "Cron Humanizer",                description: "Paste a cron expression and get a plain-English description." },
  // Code to Image is now live at /tools/code-to-image
  // Placeholder Image Generator is now live at /tools/placeholder-image
  { icon: Workflow,        title: "ASCII Art Generator",           description: "Convert text or images into ASCII art." },
  { icon: Columns,         title: "Markdown Table Generator",      description: "Build Markdown tables visually and copy the formatted output." },
  // Images & Media
  // Upscale Image is now live at /tools/upscale-image
  // Reorder / Delete PDF Pages is now live at /tools/pdf-pages
  { icon: Barcode,         title: "Barcode Generator",             description: "Generate Code 128, QR, EAN, and UPC barcodes." },
  // YouTube Thumbnail Generator is now live at /tools/youtube-thumbnail
  // Find & Replace is now live at /tools/find-replace
  // Marketing | Ad & Campaign Math
  // ROAS Calculator is now live at /tools/roas-calculator
  // CPM / CPC / CTR Calculator is now live at /tools/cpm-calculator
  { icon: FlaskConical,    title: "A/B Test Calculator",           description: "Enter visitors and conversions for two variants to check statistical significance." },
  // ROI Calculator is now live at /tools/roi-calculator
  { icon: Users,           title: "Customer LTV Calculator",       description: "Estimate customer lifetime value from AOV, purchase frequency, and lifespan." },
  { icon: LineChart,       title: "Break-Even Calculator",         description: "Fixed costs, variable costs, and price → break-even units and revenue." },
  // Marketing | Content & Copy
  { icon: MessageSquare,   title: "Social Media Character Counter", description: "Live character counter with per-platform limits for X, LinkedIn, Instagram, and more." },
  // Email Subject Line Previewer is now live at /tools/email-preview
  { icon: BookOpen,        title: "Readability Score Checker",     description: "Paste text and get Flesch-Kincaid grade level and reading ease score." },
  { icon: Hash,            title: "Keyword Density Analyzer",      description: "Paste content and see top keywords with their frequency and density percentage." },
  { icon: Megaphone,       title: "Headline Analyzer",             description: "Score your headline on clarity, sentiment, power words, and length." },
  { icon: Mail,            title: "Email Signature Generator",     description: "Fill in your details and generate a formatted HTML email signature." },
  { icon: Star,            title: "NPS Calculator",                description: "Enter promoters, passives, and detractors to calculate your Net Promoter Score." },
  // Invoice Generator is now live at /tools/invoice-generator
  // Marketing | SEO & Web
  // Meta Tag Analyzer is now live at /tools/meta-tag-analyzer
  // Schema Markup Generator is now live at /tools/schema-generator
  { icon: Smartphone,      title: "Social Image Resizer",          description: "Upload one image and export crops for OG, Twitter, LinkedIn, and Instagram." },
  // Page Speed Estimator is now live at /tools/page-speed
  { icon: Rss,             title: "RSS Feed Reader",               description: "Paste an RSS or Atom feed URL and browse entries in a clean reader." },
  { icon: Newspaper,       title: "Press Release Formatter",       description: "Paste your press release and format it to AP Style with boilerplate." },
  { icon: Languages,       title: "Hreflang Tag Generator",        description: "Specify language/region pairs and get the full set of hreflang link tags." },
  // Traffic Source Attribution is now live at /tools/traffic-attribution
  { icon: TestTube2,       title: "UTM Campaign Planner",          description: "Plan and document multiple campaign UTM structures in a shareable sheet." },
  { icon: Radio,           title: "Podcast Show Notes Generator",  description: "Paste a transcript excerpt and generate formatted show notes." },
  { icon: BookMarked,      title: "Content Calendar Template",     description: "Generate a weekly/monthly content calendar you can export to CSV." },
  { icon: AreaChart,       title: "Funnel Conversion Calculator",  description: "Enter stage-by-stage conversion rates and see where your funnel leaks." },
];

export default function ToolsPage() {
  return (
    <Suspense>
      <ToolsPageInner />
    </Suspense>
  );
}

function ToolsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { favorites, recents, toggleFavorite, recordVisit, removeRecent } = useToolHistory();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(() => searchParams.get("cat") ?? null);

  // Keep URL in sync with filter state so the back button restores it
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCategory) params.set("cat", activeCategory);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, activeCategory, router, pathname]);

  // Restore scroll position when returning from a tool page
  useEffect(() => {
    const saved = sessionStorage.getItem("tools-scroll");
    if (saved) {
      sessionStorage.removeItem("tools-scroll");
      const top = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }));
    }
  }, []);

  const saveScroll = useCallback(() => {
    sessionStorage.setItem("tools-scroll", String(window.scrollY));
  }, []);

  const handleNavigate = useCallback((href: string, title: string) => {
    saveScroll();
    recordVisit(href, title);
  }, [saveScroll, recordVisit]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter(t => {
      const matchesCategory = !activeCategory || t.categoryId === activeCategory;
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const isSearching = query.trim().length > 0 || activeCategory !== null;

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
          Back to FileSpark
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tools</h1>
          <p className="text-slate-400 text-base">{TOTAL} browser-side utilities. No account, no uploads, no limits.</p>
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
            placeholder="Search 50+ tools…"
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-2xl pl-11 pr-24 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600 transition-colors"
          />
          {query ? (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 font-mono pointer-events-none">⌘K</kbd>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setQuery(""); setActiveCategory(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null && query === ""
                ? "bg-blue-600 text-white"
                : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white"
            }`}>
            All <span className="ml-1 opacity-70">{TOTAL}</span>
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => { setQuery(""); setActiveCategory(activeCategory === c.id ? null : c.id); }}
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

        {/* Search results - flat list */}
        {isSearching && filtered.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(({ href, icon, title, description, category }) => (
                <ToolCard key={href} href={href} icon={icon} title={title} description={description} tag={category}
                  isFavorite={favorites.includes(href)}
                  onFavorite={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(href); }}
                  onNavigate={() => handleNavigate(href, title)} />
              ))}
            </div>
          </div>
        )}

        {/* Default - grouped by category */}
        {!isSearching && (
          <div className="space-y-10">

            {/* Favorites */}
            {favorites.length > 0 && (
              <section className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  <h2 className="text-white text-sm font-semibold">Favorites</h2>
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-slate-600 text-xs">{favorites.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {favorites.map(href => {
                    const tool = ALL_TOOLS.find(t => t.href === href);
                    if (!tool) return null;
                    return (
                      <ToolCard key={href} href={tool.href} icon={tool.icon} title={tool.title} description={tool.description}
                        isFavorite
                        onFavorite={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(href); }}
                        onNavigate={() => handleNavigate(href, tool.title)} />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recently used */}
            {recents.length > 0 && (
              <section className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white text-sm font-semibold">Recently Used</h2>
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-slate-600 text-xs">{recents.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recents.map(({ href, title }) => {
                    const tool = ALL_TOOLS.find(t => t.href === href);
                    if (!tool) return null;
                    return (
                      <ToolCard key={href} href={tool.href} icon={tool.icon} title={tool.title} description={tool.description}
                        isFavorite={favorites.includes(href)}
                        onFavorite={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(href); }}
                        onRemove={e => { e.preventDefault(); e.stopPropagation(); removeRecent(href); }}
                        onNavigate={() => handleNavigate(href, title)} />
                    );
                  })}
                </div>
              </section>
            )}

            {groupedFiltered.map(({ id, name, tools }) => (
              <section key={id} id={id} className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white text-sm font-semibold">{name}</h2>
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-slate-600 text-xs">{tools.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map(({ href, icon, title, description }) => (
                    <ToolCard key={href} href={href} icon={icon} title={title} description={description}
                      isFavorite={favorites.includes(href)}
                      onFavorite={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(href); }}
                      onNavigate={() => handleNavigate(href, title)} />
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

function ToolCard({ href, icon: Icon, title, description, tag, onNavigate, isFavorite, onFavorite, onRemove }: {
  href: string; icon: IconComponent; title: string; description: string; tag?: string;
  onNavigate: () => void; isFavorite?: boolean; onFavorite?: (e: React.MouseEvent) => void;
  onRemove?: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/70 transition-all duration-150"
    >
      <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-300 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors leading-snug">{title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {onFavorite && (
              <button
                onClick={onFavorite}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className={`w-5 h-5 flex items-center justify-center rounded transition-all ${isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? "text-pink-400 fill-pink-400" : "text-slate-500 hover:text-pink-400"}`} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                title="Remove from recently used"
                className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700/60"
              >
                <svg className="w-3 h-3 text-slate-500 hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg className="w-3 h-3 text-slate-600 group-hover:text-blue-400 mt-0.5 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </div>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mt-0.5 line-clamp-2">{description}</p>
        {tag && <span className="inline-block mt-1.5 text-[10px] text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded-md">{tag}</span>}
      </div>
    </Link>
  );
}

function ComingSoonCard({ icon: Icon, title, description }: { icon: IconComponent; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 opacity-60 cursor-default select-none">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
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
