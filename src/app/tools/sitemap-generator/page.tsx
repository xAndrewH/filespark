"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SitemapEntry } from "@/app/api/fetch-sitemap/route";

type Changefreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
interface UrlOverride { changefreq?: Changefreq; priority?: string; lastmod?: string; }

const CHANGEFREQ_OPTIONS: Changefreq[] = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

function todayString() { return new Date().toISOString().split("T")[0]; }

function generateXML(urls: string[], globalFreq: Changefreq, globalPriority: string, globalLastmod: string, overrides: Record<string, UrlOverride>): string {
  const items = urls.filter(u => u.trim()).map(url => {
    const ov = overrides[url] ?? {};
    const freq = ov.changefreq ?? globalFreq;
    const prio = ov.priority ?? globalPriority;
    const lm   = ov.lastmod ?? globalLastmod;
    return ["  <url>",
      `    <loc>${url.trim()}</loc>`,
      lm   ? `    <lastmod>${lm}</lastmod>`         : null,
      freq ? `    <changefreq>${freq}</changefreq>` : null,
      prio ? `    <priority>${prio}</priority>`     : null,
      "  </url>",
    ].filter(Boolean).join("\n");
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>`;
}

/* ── Fetch-from-site panel ───────────────────────────────────── */
function FetchPanel({ onFetched }: {
  onFetched: (entries: SitemapEntry[], replace: boolean) => void;
}) {
  const [domain, setDomain]   = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState<{ ok: boolean; msg: string; sources?: string[]; count?: number } | null>(null);
  const [mode, setMode]       = useState<"replace" | "append">("replace");

  const fetch_ = async () => {
    const d = domain.trim();
    if (!d) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/fetch-sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setStatus({ ok: false, msg: json.error ?? "Failed to fetch sitemap." });
        return;
      }
      onFetched(json.entries as SitemapEntry[], mode === "replace");
      setStatus({
        ok: true,
        msg: `Found ${json.total} URL${json.total !== 1 ? "s" : ""}`,
        sources: json.sources,
        count: json.total,
      });
    } catch {
      setStatus({ ok: false, msg: "Network error — check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
        </svg>
        <h2 className="text-white text-sm font-semibold">Fetch from site</h2>
      </div>
      <p className="text-slate-500 text-xs">Enter a domain to pull its existing sitemap — reads robots.txt first, then falls back to /sitemap.xml.</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetch_()}
          placeholder="example.com"
          className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
        />
        <button
          onClick={fetch_}
          disabled={loading || !domain.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-2"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          {loading ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {/* Replace / Append toggle */}
      <div className="flex gap-1 w-fit">
        {(["replace", "append"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              mode === m ? "bg-slate-700 text-white border-slate-600" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            {m === "replace" ? "Replace existing URLs" : "Append to existing URLs"}
          </button>
        ))}
      </div>

      {/* Status */}
      {status && (
        <div className={`rounded-xl px-3 py-2.5 text-xs space-y-1 ${status.ok ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          <p className={`font-medium ${status.ok ? "text-green-400" : "text-red-400"}`}>
            {status.ok ? "✓ " : "✗ "}{status.msg}
          </p>
          {status.sources?.map(s => (
            <p key={s} className="text-slate-500 font-mono truncate">↳ {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function SitemapGeneratorPage() {
  const [rawUrls,       setRawUrls]       = useState("https://example.com\nhttps://example.com/about\nhttps://example.com/pricing\nhttps://example.com/contact");
  const [globalFreq,    setGlobalFreq]    = useState<Changefreq>("weekly");
  const [globalPriority,setGlobalPriority]= useState("0.8");
  const [globalLastmod, setGlobalLastmod] = useState(todayString());
  const [overrides,     setOverrides]     = useState<Record<string, UrlOverride>>({});
  const [selectedUrl,   setSelectedUrl]   = useState<string | null>(null);
  const [copied,        setCopied]        = useState(false);

  const urls = useMemo(() =>
    rawUrls.split("\n").map(u => u.trim()).filter(Boolean), [rawUrls]);
  const validUrls   = urls.filter(isValidUrl);
  const invalidUrls = urls.filter(u => !isValidUrl(u));

  const xml = useMemo(() =>
    generateXML(validUrls, globalFreq, globalPriority, globalLastmod, overrides),
    [validUrls, globalFreq, globalPriority, globalLastmod, overrides]);

  const handleFetched = (entries: SitemapEntry[], replace: boolean) => {
    const newUrls = entries.map(e => e.loc);
    setRawUrls(replace ? newUrls.join("\n") : [rawUrls.trim(), ...newUrls].filter(Boolean).join("\n"));

    // Pre-populate overrides from fetched metadata
    setOverrides(prev => {
      const next = replace ? {} : { ...prev };
      for (const e of entries) {
        const ov: UrlOverride = {};
        if (e.changefreq) ov.changefreq = e.changefreq as Changefreq;
        if (e.priority)   ov.priority   = e.priority;
        if (e.lastmod)    ov.lastmod    = e.lastmod;
        if (Object.keys(ov).length > 0) next[e.loc] = ov;
      }
      return next;
    });
  };

  const updateOverride = (url: string, field: keyof UrlOverride, value: string) =>
    setOverrides(prev => ({ ...prev, [url]: { ...prev[url], [field]: value || undefined } }));

  const removeOverride = (url: string, field: keyof UrlOverride) =>
    setOverrides(prev => {
      const ov = { ...prev[url] };
      delete ov[field];
      return { ...prev, [url]: ov };
    });

  const copy = async () => {
    await navigator.clipboard.writeText(xml);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "sitemap.xml"; a.click();
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
        <p className="text-slate-500 text-sm mb-8">Fetch a live sitemap from any site, or build your own from scratch — then export valid XML.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">

            {/* Fetch from site */}
            <FetchPanel onFetched={handleFetched} />

            {/* Manual URL input */}
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
                  <p className="text-xs font-medium text-red-400">Invalid URLs (excluded):</p>
                  {invalidUrls.map(u => <p key={u} className="text-xs text-red-400/70 font-mono truncate">{u}</p>)}
                </div>
              )}
            </div>

            {/* Global settings */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h2 className="text-white text-sm font-semibold">Global Settings</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Change Freq</label>
                  <select value={globalFreq} onChange={e => setGlobalFreq(e.target.value as Changefreq)}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]">
                    {CHANGEFREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Priority</label>
                  <select value={globalPriority} onChange={e => setGlobalPriority(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]">
                    {["1.0","0.9","0.8","0.7","0.6","0.5","0.4","0.3","0.2","0.1","0.0"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Last Modified</label>
                <input type="date" value={globalLastmod} onChange={e => setGlobalLastmod(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]" />
              </div>
            </div>

            {/* Per-URL overrides */}
            {validUrls.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
                <h2 className="text-white text-sm font-semibold">Per-URL Overrides</h2>
                <p className="text-slate-500 text-xs">Click a URL to set custom settings for that entry.</p>
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {validUrls.map(url => {
                    const hasOverride = overrides[url] && Object.values(overrides[url]).some(Boolean);
                    return (
                      <button key={url}
                        onClick={() => setSelectedUrl(selectedUrl === url ? null : url)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${
                          selectedUrl === url
                            ? "bg-blue-600/20 border border-blue-500/40 text-blue-300"
                            : "bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-800/70"
                        }`}>
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
                        <button onClick={() => setOverrides(prev => { const n = {...prev}; delete n[selectedUrl]; return n; })}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear overrides</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-400">Change Freq</label>
                        <select value={selOv.changefreq ?? ""}
                          onChange={e => e.target.value ? updateOverride(selectedUrl, "changefreq", e.target.value) : removeOverride(selectedUrl, "changefreq")}
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]">
                          <option value="">— global default —</option>
                          {CHANGEFREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-400">Priority</label>
                        <select value={selOv.priority ?? ""}
                          onChange={e => e.target.value ? updateOverride(selectedUrl, "priority", e.target.value) : removeOverride(selectedUrl, "priority")}
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]">
                          <option value="">— global default —</option>
                          {["1.0","0.9","0.8","0.7","0.6","0.5","0.4","0.3","0.2","0.1","0.0"].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-400">Last Modified</label>
                      <input type="date" value={selOv.lastmod ?? ""}
                        onChange={e => e.target.value ? updateOverride(selectedUrl, "lastmod", e.target.value) : removeOverride(selectedUrl, "lastmod")}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 [color-scheme:dark]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column — XML output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-semibold">sitemap.xml <span className="text-slate-500 font-normal">({validUrls.length} URLs)</span></h2>
              <div className="flex gap-2">
                <button onClick={copy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={download}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors">
                  Download
                </button>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 overflow-auto" style={{ maxHeight: "700px" }}>
              <pre className="text-slate-300 text-xs font-mono whitespace-pre leading-relaxed">{xml}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
