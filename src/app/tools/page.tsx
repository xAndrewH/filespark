"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Hash, Terminal, BookOpen, Barcode, Heart, FileJson2, Fingerprint, Database, FileCode2, Network, Columns, FlaskConical, MessageSquare, Mail, Smartphone, Star, Users, CheckCheck, Sigma, Languages, MousePointer2, Megaphone, Newspaper, TestTube2, BookMarked, Code, Cpu, Radio, Rss, Webhook, TableProperties, SlidersHorizontal, FileDiff, Workflow, LineChart, AreaChart } from "lucide-react";
import { useToolHistory } from "@/hooks/useToolHistory";
import { TOOL_CATEGORIES, ALL_TOOLS, TOOL_COUNT, type IconComponent } from "@/lib/tool-registry";

const PLACEHOLDER_COUNT = Math.floor(TOOL_COUNT / 10) * 10;


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
    return TOOL_CATEGORIES.map(c => ({
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
          <p className="text-slate-400 text-base">{TOOL_COUNT} browser-side utilities. No account, no uploads, no limits.</p>
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
            placeholder={`Search ${PLACEHOLDER_COUNT}+ tools…`}
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
            All <span className="ml-1 opacity-70">{TOOL_COUNT}</span>
          </button>
          {TOOL_CATEGORIES.map(c => (
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
