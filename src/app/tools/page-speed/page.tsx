"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageSpeedResult, PsiMetric, PsiAudit } from "@/app/api/page-speed/route";

/* ── helpers ─────────────────────────────────────────────────────── */
function scoreColor(score: number | null): string {
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

function fieldCategoryColor(cat?: string): string {
  if (cat === "FAST") return "text-green-400";
  if (cat === "AVERAGE") return "text-orange-400";
  if (cat === "SLOW") return "text-red-400";
  return "text-slate-400";
}

function fieldCategoryLabel(cat?: string): string {
  if (cat === "FAST") return "Fast";
  if (cat === "AVERAGE") return "Moderate";
  if (cat === "SLOW") return "Slow";
  return "—";
}

function formatMs(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

/* ── Score ring ──────────────────────────────────────────────────── */
function ScoreRing({ score, strategy }: { score: number; strategy: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 90 ? "#0cce6b" : score >= 50 ? "#ffa400" : "#ff4e42";
  const bgColor = score >= 90 ? "#0cce6b22" : score >= 50 ? "#ffa40022" : "#ff4e4222";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - pct * circ}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: bgColor, borderRadius: "50%" }}>
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
  const barPct = metric.score !== null ? Math.round(metric.score * 100) : 0;

  const SHORT_LABELS: Record<string, string> = {
    "first-contentful-paint": "FCP",
    "speed-index": "SI",
    "largest-contentful-paint": "LCP",
    "total-blocking-time": "TBT",
    "cumulative-layout-shift": "CLS",
    "interactive": "TTI",
    "server-response-time": "TTFB",
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-slate-400 text-xs leading-snug">{metric.title}</span>
        <span className="text-slate-600 text-xs font-mono shrink-0">{SHORT_LABELS[metric.id] ?? metric.id.toUpperCase()}</span>
      </div>
      <p className="text-white text-xl font-bold leading-none">{metric.displayValue}</p>
      <div className="space-y-1">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: color }} />
        </div>
        <span className={`text-xs font-medium ${cls}`}>{text}</span>
      </div>
    </div>
  );
}

/* ── Opportunity row ─────────────────────────────────────────────── */
function AuditRow({ audit, expanded, onToggle }: { audit: PsiAudit; expanded: boolean; onToggle: () => void }) {
  const color = scoreColor(audit.score);
  const hasSavings = audit.savingsMs || audit.savingsBytes;

  return (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="flex-1 text-slate-200 text-sm">{audit.title}</span>
        {hasSavings && (
          <span className="text-slate-500 text-xs shrink-0">
            {audit.savingsMs ? `−${formatMs(audit.savingsMs)}` : ""}
            {audit.savingsBytes ? `−${Math.round(audit.savingsBytes / 1024)} KB` : ""}
          </span>
        )}
        {audit.displayValue && !hasSavings && (
          <span className="text-slate-500 text-xs shrink-0">{audit.displayValue}</span>
        )}
        <svg className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && audit.description && (
        <div className="px-4 pb-3 pt-0">
          <p className="text-slate-500 text-xs leading-relaxed">{audit.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}</p>
        </div>
      )}
    </div>
  );
}

/* ── Score legend ────────────────────────────────────────────────── */
function ScoreLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      {[
        { color: "#ff4e42", label: "0–49 Poor" },
        { color: "#ffa400", label: "50–89 Needs improvement" },
        { color: "#0cce6b", label: "90–100 Good" },
      ].map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
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

  const analyze = async () => {
    const url = input.trim();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setExpanded(new Set());
    try {
      const res = await fetch("/api/page-speed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, strategy }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data as PageSpeedResult);
    } catch {
      setError("Network error — could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAudit = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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

          {/* Strategy toggle */}
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-lg w-fit">
            {(["mobile", "desktop"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  strategy === s ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s === "mobile" ? "📱 Mobile" : "🖥️ Desktop"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 flex flex-col items-center gap-4 py-12">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90 animate-spin-slow" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset="245" />
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
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-6 space-y-5">

            {/* Score + legend */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreRing score={result.performanceScore} strategy={result.strategy} />
                <div className="flex-1 space-y-4 text-center sm:text-left">
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
                  <ScoreLegend />
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Core Web Vitals &amp; Metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {metricList.map(m => <MetricCard key={m.id} metric={m} />)}
              </div>
            </div>

            {/* TTFB */}
            {result.metrics.ttfb && (
              <div className="grid grid-cols-1 gap-3">
                <MetricCard metric={result.metrics.ttfb} />
              </div>
            )}

            {/* Field data detail */}
            {result.fieldData && (result.fieldData.fcp || result.fieldData.lcp || result.fieldData.cls) && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Field Data — Real User Measurements</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "fcp", label: "FCP", value: result.fieldData.fcp, fmt: (v: number) => formatMs(v) },
                    { key: "lcp", label: "LCP", value: result.fieldData.lcp, fmt: (v: number) => formatMs(v) },
                    { key: "cls", label: "CLS", value: result.fieldData.cls, fmt: (v: number) => v.toFixed(2) },
                    { key: "fid", label: "FID", value: result.fieldData.fid, fmt: (v: number) => formatMs(v) },
                    { key: "inp", label: "INP", value: result.fieldData.inp, fmt: (v: number) => formatMs(v) },
                  ].filter(d => d.value).map(({ key, label, value, fmt }) => (
                    <div key={key} className="bg-slate-800/40 rounded-xl px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">{label}</span>
                        <span className={`text-xs font-medium ${fieldCategoryColor(value?.category)}`}>
                          {fieldCategoryLabel(value?.category)}
                        </span>
                      </div>
                      <p className="text-white text-lg font-bold">{value ? fmt(value.value) : "—"}</p>
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

            {/* Footer note */}
            <p className="text-slate-700 text-xs text-center pb-4">
              Data from Google PageSpeed Insights · Lighthouse {result.strategy} audit · {new Date(result.fetchTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
