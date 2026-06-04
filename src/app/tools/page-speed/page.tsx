"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Types (inlined so no server route import needed) ─────────────── */
interface PsiMetric {
  id: string;
  title: string;
  displayValue: string;
  score: number | null;
  numericValue?: number;
}

interface PsiAudit {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score: number | null;
  savingsMs?: number;
  savingsBytes?: number;
}

interface FieldMetric { value: number; category: "FAST" | "AVERAGE" | "SLOW" }

interface PageSpeedResult {
  url: string;
  finalUrl: string;
  strategy: "mobile" | "desktop";
  fetchTime: string;
  performanceScore: number;
  metrics: { fcp: PsiMetric; si: PsiMetric; lcp: PsiMetric; tbt: PsiMetric; cls: PsiMetric; tti: PsiMetric; ttfb?: PsiMetric };
  opportunities: PsiAudit[];
  diagnostics: PsiAudit[];
  fieldData?: { fcp?: FieldMetric; lcp?: FieldMetric; cls?: FieldMetric; fid?: FieldMetric; inp?: FieldMetric; overallCategory?: string };
}

/* ── PSI parse helpers ───────────────────────────────────────────── */
function extractMetric(audits: Record<string, unknown>, key: string): PsiMetric {
  const a = audits[key] as Record<string, unknown> | undefined;
  if (!a) return { id: key, title: key, displayValue: "N/A", score: null };
  return {
    id: key, title: (a.title as string) ?? key,
    displayValue: (a.displayValue as string) ?? "N/A",
    score: typeof a.score === "number" ? a.score : null,
    numericValue: typeof a.numericValue === "number" ? a.numericValue : undefined,
  };
}

function extractAudits(audits: Record<string, unknown>, ids: string[]): PsiAudit[] {
  return ids.map(id => {
    const a = audits[id] as Record<string, unknown> | undefined;
    if (!a || (typeof a.score === "number" && a.score >= 0.9)) return null;
    const details = a.details as Record<string, unknown> | undefined;
    return {
      id, title: (a.title as string) ?? id,
      description: (a.description as string) ?? "",
      displayValue: (a.displayValue as string) ?? undefined,
      score: typeof a.score === "number" ? a.score : null,
      savingsMs: typeof details?.overallSavingsMs === "number" ? details.overallSavingsMs as number : undefined,
      savingsBytes: typeof details?.overallSavingsBytes === "number" ? details.overallSavingsBytes as number : undefined,
    } satisfies PsiAudit;
  }).filter(Boolean) as PsiAudit[];
}

function parsePsiResponse(data: Record<string, unknown>, url: string, strategy: "mobile" | "desktop"): PageSpeedResult {
  const lr = data.lighthouseResult as Record<string, unknown>;
  const audits = (lr?.audits ?? {}) as Record<string, unknown>;
  const categories = (lr?.categories ?? {}) as Record<string, unknown>;
  const perfScore = Math.round(((categories.performance as Record<string, unknown>)?.score as number ?? 0) * 100);

  const le = data.loadingExperience as Record<string, unknown> | undefined;
  const leMetrics = (le?.metrics ?? {}) as Record<string, unknown>;
  function fieldMetric(key: string): FieldMetric | undefined {
    const m = leMetrics[key] as Record<string, unknown> | undefined;
    if (!m || typeof m.percentile !== "number") return undefined;
    return { value: m.percentile as number, category: m.category as FieldMetric["category"] };
  }

  return {
    url, finalUrl: (data.id as string) ?? url, strategy,
    fetchTime: (lr?.fetchTime as string) ?? new Date().toISOString(),
    performanceScore: perfScore,
    metrics: {
      fcp:  extractMetric(audits, "first-contentful-paint"),
      si:   extractMetric(audits, "speed-index"),
      lcp:  extractMetric(audits, "largest-contentful-paint"),
      tbt:  extractMetric(audits, "total-blocking-time"),
      cls:  extractMetric(audits, "cumulative-layout-shift"),
      tti:  extractMetric(audits, "interactive"),
      ttfb: extractMetric(audits, "server-response-time"),
    },
    opportunities: extractAudits(audits, [
      "render-blocking-resources", "unused-css-rules", "unused-javascript",
      "uses-optimized-images", "uses-webp-images", "uses-text-compression",
      "uses-long-cache-ttl", "efficient-animated-content", "uses-responsive-images",
      "preload-lcp-image", "uses-rel-preconnect", "font-display",
    ]),
    diagnostics: extractAudits(audits, [
      "dom-size", "critical-request-chains", "network-requests", "network-rtt",
      "network-server-latency", "main-thread-tasks", "bootup-time",
      "third-party-summary", "no-document-write", "uses-passive-event-listeners",
    ]),
    fieldData: {
      fcp: fieldMetric("FIRST_CONTENTFUL_PAINT_MS"),
      lcp: fieldMetric("LARGEST_CONTENTFUL_PAINT_MS"),
      cls: fieldMetric("CUMULATIVE_LAYOUT_SHIFT_SCORE"),
      fid: fieldMetric("FIRST_INPUT_DELAY_MS"),
      inp: fieldMetric("INTERACTION_TO_NEXT_PAINT"),
      overallCategory: le?.overall_category as string | undefined,
    },
  };
}

/* ── helpers ─────────────────────────────────────────────────────── */
function scoreColor(score: number | null) {
  if (score === null) return "#94a3b8";
  if (score >= 0.9) return "#0cce6b";
  if (score >= 0.5) return "#ffa400";
  return "#ff4e42";
}
function scoreLabel(score: number | null): { text: string; cls: string } {
  if (score === null) return { text: "N/A", cls: "text-slate-400" };
  if (score >= 0.9) return { text: "Good", cls: "text-green-400" };
  if (score >= 0.5) return { text: "Needs Improvement", cls: "text-orange-400" };
  return { text: "Poor", cls: "text-red-400" };
}
function fieldCategoryColor(cat?: string) {
  if (cat === "FAST") return "text-green-400";
  if (cat === "AVERAGE") return "text-orange-400";
  if (cat === "SLOW") return "text-red-400";
  return "text-slate-400";
}
function fieldCategoryLabel(cat?: string) {
  if (cat === "FAST") return "Fast";
  if (cat === "AVERAGE") return "Moderate";
  if (cat === "SLOW") return "Slow";
  return "—";
}
function formatMs(ms?: number) {
  if (ms === undefined) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

const LS_KEY = "psi_api_key";

/* ── Score ring ──────────────────────────────────────────────────── */
function ScoreRing({ score, strategy }: { score: number; strategy: string }) {
  const r = 52, circ = 2 * Math.PI * r;
  const color = score >= 90 ? "#0cce6b" : score >= 50 ? "#ffa400" : "#ff4e42";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full" style={{ background: `${color}18` }}>
          <span className="text-4xl font-black text-white leading-none">{score}</span>
          <span className="text-xs text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white text-sm font-semibold">Performance</p>
        <p className="text-slate-500 text-xs mt-0.5">{strategy === "mobile" ? "📱 Mobile" : "🖥️ Desktop"}</p>
      </div>
    </div>
  );
}

/* ── Metric card ─────────────────────────────────────────────────── */
function MetricCard({ metric }: { metric: PsiMetric }) {
  const color = scoreColor(metric.score);
  const { text, cls } = scoreLabel(metric.score);
  const SHORT: Record<string, string> = {
    "first-contentful-paint": "FCP", "speed-index": "SI",
    "largest-contentful-paint": "LCP", "total-blocking-time": "TBT",
    "cumulative-layout-shift": "CLS", "interactive": "TTI", "server-response-time": "TTFB",
  };
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-slate-400 text-xs leading-snug">{metric.title}</span>
        <span className="text-slate-600 text-xs font-mono shrink-0">{SHORT[metric.id] ?? metric.id.toUpperCase()}</span>
      </div>
      <p className="text-white text-xl font-bold leading-none">{metric.displayValue}</p>
      <div className="space-y-1">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${metric.score !== null ? Math.round(metric.score * 100) : 0}%`, backgroundColor: color }} />
        </div>
        <span className={`text-xs font-medium ${cls}`}>{text}</span>
      </div>
    </div>
  );
}

/* ── Audit row ───────────────────────────────────────────────────── */
function AuditRow({ audit, expanded, onToggle }: { audit: PsiAudit; expanded: boolean; onToggle: () => void }) {
  const hasSavings = audit.savingsMs || audit.savingsBytes;
  return (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: scoreColor(audit.score) }} />
        <span className="flex-1 text-slate-200 text-sm">{audit.title}</span>
        {hasSavings && (
          <span className="text-slate-500 text-xs shrink-0">
            {audit.savingsMs ? `−${formatMs(audit.savingsMs)}` : ""}
            {audit.savingsBytes ? `−${Math.round(audit.savingsBytes / 1024)} KB` : ""}
          </span>
        )}
        {audit.displayValue && !hasSavings && <span className="text-slate-500 text-xs shrink-0">{audit.displayValue}</span>}
        <svg className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && audit.description && (
        <div className="px-4 pb-3">
          <p className="text-slate-500 text-xs leading-relaxed">{audit.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function PageSpeedPage() {
  const [input, setInput]       = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<PageSpeedResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey]     = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem(LS_KEY) ?? "");
  }, []);

  const saveKey = (k: string) => {
    setApiKey(k);
    if (k.trim()) localStorage.setItem(LS_KEY, k.trim());
    else localStorage.removeItem(LS_KEY);
    setShowKeyInput(false);
  };

  const analyze = async () => {
    let url = input.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
    setLoading(true);
    setResult(null);
    setError(null);
    setExpanded(new Set());

    try {
      const key = localStorage.getItem(LS_KEY) ?? "";
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
        + `?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance`
        + (key ? `&key=${key}` : "");

      const res = await fetch(psiUrl, { signal: AbortSignal.timeout(30000) });
      const data = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        const errMsg = ((data?.error as Record<string, unknown>)?.message as string) ?? "";
        if (res.status === 429) {
          setError("Rate limit hit. Add a free Google API key below to get your own quota (25,000 requests/day).");
        } else if (res.status === 400 && errMsg.toLowerCase().includes("key")) {
          setError("Invalid API key. Check the key you entered and try again, or remove it to use the keyless limit.");
        } else {
          setError(errMsg || `PageSpeed Insights returned ${res.status}`);
        }
        return;
      }

      setResult(parsePsiResponse(data, url, strategy));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("abort") || msg.includes("timeout")) {
        setError("Request timed out — Lighthouse audits can take 15–30 seconds. Try again.");
      } else {
        setError(`Request failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAudit = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const metricList = result
    ? [result.metrics.fcp, result.metrics.si, result.metrics.lcp, result.metrics.tbt, result.metrics.cls, result.metrics.tti]
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Page Speed</h1>
        <p className="text-slate-500 text-sm mb-8">Powered by Google PageSpeed Insights — real Lighthouse scores, Core Web Vitals, and actionable opportunities.</p>

        {/* Input */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder="https://example.com"
              className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors shrink-0"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Strategy */}
            <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-lg">
              {(["mobile", "desktop"] as const).map(s => (
                <button key={s} onClick={() => setStrategy(s)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${strategy === s ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                  {s === "mobile" ? "📱 Mobile" : "🖥️ Desktop"}
                </button>
              ))}
            </div>

            {/* API Key toggle */}
            <button onClick={() => setShowKeyInput(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              {apiKey ? <span className="text-green-500">API Key set</span> : "Add API Key"}
            </button>
          </div>

          {/* API key input */}
          {showKeyInput && (
            <ApiKeyPanel current={apiKey} onSave={saveKey} />
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 flex flex-col items-center gap-4 py-12">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full animate-spin-slow" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#3b82f6" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset="245" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-300 text-sm font-medium">Running Lighthouse audit…</p>
              <p className="text-slate-600 text-xs mt-1">This takes 15–30 seconds</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            {error.includes("Rate limit") && (
              <div className="ml-8">
                <button onClick={() => setShowKeyInput(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
                  Add a free Google API key
                </button>
                <p className="text-slate-600 text-xs mt-1.5">
                  Get one free at <span className="text-slate-400">console.cloud.google.com</span> → Enable "PageSpeed Insights API" → Credentials → Create API Key
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-6 space-y-5">
            {/* Score */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreRing score={result.performanceScore} strategy={result.strategy} />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Analyzed URL</p>
                    <p className="text-white text-sm font-medium break-all">{result.finalUrl}</p>
                  </div>
                  {result.fieldData?.overallCategory && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Field Data (real users)</p>
                      <span className={`text-sm font-semibold ${fieldCategoryColor(result.fieldData.overallCategory)}`}>
                        {fieldCategoryLabel(result.fieldData.overallCategory)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 justify-center sm:justify-start">
                    {[{ color: "#ff4e42", label: "0–49 Poor" }, { color: "#ffa400", label: "50–89 Needs improvement" }, { color: "#0cce6b", label: "90–100 Good" }].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Core Web Vitals &amp; Metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {metricList.map(m => <MetricCard key={m.id} metric={m} />)}
              </div>
            </div>

            {result.metrics.ttfb && (
              <div className="grid grid-cols-1">
                <MetricCard metric={result.metrics.ttfb} />
              </div>
            )}

            {/* Field data */}
            {result.fieldData && Object.values(result.fieldData).some(Boolean) && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Field Data — Real User Measurements (p75)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "fcp", label: "FCP", v: result.fieldData.fcp, fmt: (n: number) => formatMs(n) },
                    { key: "lcp", label: "LCP", v: result.fieldData.lcp, fmt: (n: number) => formatMs(n) },
                    { key: "cls", label: "CLS", v: result.fieldData.cls, fmt: (n: number) => n.toFixed(3) },
                    { key: "fid", label: "FID", v: result.fieldData.fid, fmt: (n: number) => formatMs(n) },
                    { key: "inp", label: "INP", v: result.fieldData.inp, fmt: (n: number) => formatMs(n) },
                  ].filter(d => d.v).map(({ key, label, v, fmt }) => (
                    <div key={key} className="bg-slate-800/40 rounded-xl px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">{label}</span>
                        <span className={`text-xs font-medium ${fieldCategoryColor(v?.category)}`}>{fieldCategoryLabel(v?.category)}</span>
                      </div>
                      <p className="text-white text-lg font-bold">{v ? fmt(v.value) : "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {result.opportunities.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Opportunities</p>
                <div className="space-y-2">
                  {result.opportunities.map(a => (
                    <AuditRow key={a.id} audit={a} expanded={expanded.has(a.id)} onToggle={() => toggleAudit(a.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostics */}
            {result.diagnostics.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Diagnostics</p>
                <div className="space-y-2">
                  {result.diagnostics.map(a => (
                    <AuditRow key={a.id} audit={a} expanded={expanded.has(a.id)} onToggle={() => toggleAudit(a.id)} />
                  ))}
                </div>
              </div>
            )}

            <p className="text-slate-700 text-xs text-center pb-4">
              Google PageSpeed Insights · Lighthouse {result.strategy} · {new Date(result.fetchTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── API Key panel ───────────────────────────────────────────────── */
function ApiKeyPanel({ current, onSave }: { current: string; onSave: (k: string) => void }) {
  const [val, setVal] = useState(current);
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-slate-300 text-xs font-medium mb-0.5">Google API Key <span className="text-slate-500 font-normal">(optional — stored locally, never sent to our servers)</span></p>
        <p className="text-slate-500 text-xs leading-relaxed">
          Without a key, requests go directly from your browser and share Google&apos;s public quota (may be busy).
          A free key gives you 25,000 requests/day. Get one at{" "}
          <span className="text-blue-400">console.cloud.google.com</span> → Enable &quot;PageSpeed Insights API&quot; → Credentials → Create API Key.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="AIza…"
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500/60 transition-colors"
        />
        <button onClick={() => onSave(val)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
          Save
        </button>
        {current && (
          <button onClick={() => onSave("")} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
