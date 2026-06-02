"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Changefreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

interface UrlOverride {
  changefreq?: Changefreq;
  priority?: string;
  lastmod?: string;
}

const CHANGEFREQ_OPTIONS: Changefreq[] = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateXML(urls: string[], globalFreq: Changefreq, globalPriority: string, globalLastmod: string, overrides: Record<string, UrlOverride>): string {
  const items = urls
    .filter(u => u.trim())
    .map(url => {
      const ov = overrides[url] ?? {};
      const freq = ov.changefreq ?? globalFreq;
      const prio = ov.priority ?? globalPriority;
      const lm = ov.lastmod ?? globalLastmod;
      return [
        "  <url>",
        `    <loc>${url.trim()}</loc>`,
        lm ? `    <lastmod>${lm}</lastmod>` : null,
        freq ? `    <changefreq>${freq}</changefreq>` : null,
        prio ? `    <priority>${prio}</priority>` : null,
        "  </url>",
      ].filter(Boolean).join("\n");
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join("\n")}
</urlset>`;
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function SitemapGeneratorPage() {
  const [rawUrls, setRawUrls] = useState("https://example.com\nhttps://example.com/about\nhttps://example.com/pricing\nhttps://example.com/contact");
  const [globalFreq, setGlobalFreq] = useState<Changefreq>("weekly");
  const [globalPriority, setGlobalPriority] = useState("0.8");
  const [globalLastmod, setGlobalLastmod] = useState(todayString());
  const [overrides, setOverrides] = useState<Record<string, UrlOverride>>({});
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const urls = useMemo(() =>
    rawUrls.split("\n").map(u => u.trim()).filter(Boolean),
    [rawUrls]
  );

  const validUrls = urls.filter(isValidUrl);
  const invalidUrls = urls.filter(u => !isValidUrl(u));

  const xml = useMemo(() =>
    generateXML(validUrls, globalFreq, globalPriority, globalLastmod, overrides),
    [validUrls, globalFreq, globalPriority, globalLastmod, overrides]
  );

  const updateOverride = (url: string, field: keyof UrlOverride, value: string) => {
    setOverrides(prev => ({
      ...prev,
      [url]: { ...prev[url], [field]: value || undefined },
    }));
  };

  const removeOverride = (url: string, field: keyof UrlOverride) => {
    setOverrides(prev => {
      const ov = { ...prev[url] };
      delete ov[field];
      return { ...prev, [url]: ov };
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const selOv = selectedUrl ? (overrides[selectedUrl] ?? {}) : {};

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Sitemap Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Paste URLs to generate a valid XML sitemap. Click any URL to set per-URL overrides.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {/* URLs input */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-sm font-semibold">URLs</h2>
                <span className="text-xs text-slate-500">
                  {validUrls.length} valid{invalidUrls.length > 0 && `, ${invalidUrls.length} invalid`}
                </span>
              </div>
              <textarea
                value={rawUrls}
                onChange={e => setRawUrls(e.target.value)}
                rows={8}
                placeholder="https://example.com&#10;https://example.com/about&#10;https://example.com/contact"
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
              />
              {invalidUrls.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-400">Invalid URLs (will be excluded):</p>
                  {invalidUrls.map(u => (
                    <p key={u} className="text-xs text-red-400/70 font-mono truncate">{u}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Global settings */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h2 className="text-white text-sm font-semibold">Global Settings</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Change Freq</label>
                  <select
                    value={globalFreq}
                    onChange={e => setGlobalFreq(e.target.value as Changefreq)}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                  >
                    {CHANGEFREQ_OPTIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Priority</label>
                  <select
                    value={globalPriority}
                    onChange={e => setGlobalPriority(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                  >
                    {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Last Modified</label>
                <input
                  type="date"
                  value={globalLastmod}
                  onChange={e => setGlobalLastmod(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* URL list with click-to-override */}
            {validUrls.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
                <h2 className="text-white text-sm font-semibold">Per-URL Overrides</h2>
                <p className="text-slate-500 text-xs">Click a URL to set custom settings for that entry.</p>
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {validUrls.map(url => {
                    const hasOverride = overrides[url] && Object.values(overrides[url]).some(Boolean);
                    return (
                      <button
                        key={url}
                        onClick={() => setSelectedUrl(selectedUrl === url ? null : url)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${selectedUrl === url ? "bg-blue-600/20 border border-blue-500/40 text-blue-300" : "bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-800/70"}`}
                      >
                        <span className="flex-1 truncate">{url}</span>
                        {hasOverride && <span className="shrink-0 text-[9px] bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/30">custom</span>}
                      </button>
                    );
                  })}
                </div>

                {selectedUrl && (
                  <div className="border-t border-slate-800/60 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">{selectedUrl}</p>
                      {overrides[selectedUrl] && Object.values(overrides[selectedUrl]).some(Boolean) && (
                        <button
                          onClick={() => setOverrides(prev => { const n = { ...prev }; delete n[selectedUrl]; return n; })}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Clear overrides
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-400">Change Freq</label>
                        <select
                          value={selOv.changefreq ?? ""}
                          onChange={e => e.target.value ? updateOverride(selectedUrl, "changefreq", e.target.value) : removeOverride(selectedUrl, "changefreq")}
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                        >
                          <option value="">— global default —</option>
                          {CHANGEFREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-400">Priority</label>
                        <select
                          value={selOv.priority ?? ""}
                          onChange={e => e.target.value ? updateOverride(selectedUrl, "priority", e.target.value) : removeOverride(selectedUrl, "priority")}
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                        >
                          <option value="">— global default —</option>
                          {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-400">Last Modified</label>
                      <input
                        type="date"
                        value={selOv.lastmod ?? ""}
                        onChange={e => e.target.value ? updateOverride(selectedUrl, "lastmod", e.target.value) : removeOverride(selectedUrl, "lastmod")}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column — XML output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-semibold">sitemap.xml</h2>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={download}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 overflow-auto" style={{ maxHeight: "620px" }}>
              <pre className="text-slate-300 text-xs font-mono whitespace-pre leading-relaxed">{xml}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
