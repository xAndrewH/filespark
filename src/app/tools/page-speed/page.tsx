"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageAnalysis, AnalysisIssue } from "@/app/api/page-speed/route";

/* ── Helpers ─────────────────────────────────────────────────────── */
function scoreColor(score: number): string {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function ttfbColor(ms: number): string {
  if (ms <= 200) return "#0cce6b";
  if (ms <= 600) return "#ffa400";
  return "#ff4e42";
}

function ttfbLabel(ms: number): { text: string; cls: string } {
  if (ms <= 200) return { text: "Fast", cls: "text-green-400" };
  if (ms <= 600) return { text: "Moderate", cls: "text-orange-400" };
  if (ms <= 1500) return { text: "Slow", cls: "text-red-400" };
  return { text: "Very Slow", cls: "text-red-500" };
}

function fmtBytes(b: number): string {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000) return `${Math.round(b / 1000)} KB`;
  return `${b} B`;
}

function impactColor(impact: AnalysisIssue["impact"]): string {
  if (impact === "high") return "#ff4e42";
  if (impact === "medium") return "#ffa400";
  return "#94a3b8";
}

function impactLabel(impact: AnalysisIssue["impact"]): string {
  if (impact === "high") return "High";
  if (impact === "medium") return "Medium";
  return "Low";
}

function impactCls(impact: AnalysisIssue["impact"]): string {
  if (impact === "high") return "text-red-400";
  if (impact === "medium") return "text-orange-400";
  return "text-slate-400";
}

/* ── Score ring ──────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  const bgColor = score >= 90 ? "#0cce6b22" : score >= 50 ? "#ffa40022" : "#ff4e4222";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (score / 100) * circ}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: bgColor, borderRadius: "50%" }}>
          <span className="text-4xl font-black text-white leading-none">{score}</span>
          <span className="text-xs text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-white text-sm font-semibold">Performance</p>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-1.5">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold leading-none" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className={`text-xs font-medium ${sub.includes("Good") || sub.includes("Fast") ? "text-green-400" : sub.includes("Slow") || sub.includes("Poor") ? "text-red-400" : "text-orange-400"}`}>{sub}</p>}
    </div>
  );
}

/* ── Check row ───────────────────────────────────────────────────── */
function CheckRow({ label, pass, detail }: { label: string; pass: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${pass ? "bg-green-500/20" : "bg-red-500/20"}`}>
        {pass
          ? <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </div>
      <span className="flex-1 text-sm text-slate-300">{label}</span>
      {detail && <span className="text-xs text-slate-500 shrink-0">{detail}</span>}
    </div>
  );
}

/* ── Issue row ───────────────────────────────────────────────────── */
function IssueRow({ issue, expanded, onToggle }: { issue: AnalysisIssue; expanded: boolean; onToggle: () => void }) {
  const color = impactColor(issue.impact);
  return (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="flex-1 text-slate-200 text-sm">{issue.title}</span>
        <span className={`text-xs font-medium shrink-0 ${impactCls(issue.impact)}`}>{impactLabel(issue.impact)}</span>
        <svg className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-slate-500 text-xs leading-relaxed">{issue.description}</p>
          {issue.details && issue.details.length > 0 && (
            <ul className="space-y-1">
              {issue.details.map((d, i) => (
                <li key={i} className="text-slate-600 text-xs font-mono truncate">↳ {d}</li>
              ))}
            </ul>
          )}
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
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<PageAnalysis | null>(null);
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
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data as PageAnalysis);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleIssue = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Page Speed</h1>
        <p className="text-slate-500 text-sm mb-8">Analyze any URL — TTFB, page weight, render-blocking resources, compression, and more. No API keys needed.</p>

        {/* Input */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
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
              <p className="text-slate-300 text-sm font-medium">Analyzing page…</p>
              <p className="text-slate-600 text-xs mt-1">Fetching and parsing resources</p>
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

            {/* Score card */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreRing score={result.score} />
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Analyzed URL</p>
                    <p className="text-white text-sm font-medium break-all">{result.finalUrl}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Issues found</p>
                    <p className="text-white text-sm font-semibold">
                      {result.issues.filter(i => i.impact === "high").length} high &nbsp;·&nbsp;
                      {result.issues.filter(i => i.impact === "medium").length} medium &nbsp;·&nbsp;
                      {result.issues.filter(i => i.impact === "low").length} low
                    </p>
                  </div>
                  <ScoreLegend />
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Performance Metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard
                  label="Time to First Byte"
                  value={result.ttfb >= 1000 ? `${(result.ttfb / 1000).toFixed(2)} s` : `${result.ttfb} ms`}
                  sub={ttfbLabel(result.ttfb).text}
                  color={ttfbColor(result.ttfb)}
                />
                <StatCard
                  label="HTML Size"
                  value={fmtBytes(result.htmlSize)}
                  sub={result.compressed ? "Compressed ✓" : "No compression"}
                />
                <StatCard
                  label="Scripts"
                  value={String(result.scripts.length)}
                  sub={result.renderBlockingScripts.length > 0 ? `${result.renderBlockingScripts.length} render-blocking` : "None blocking"}
                />
                <StatCard
                  label="Stylesheets"
                  value={String(result.stylesheets.length)}
                  sub={result.stylesheets.length > 3 ? "Consider combining" : "OK"}
                />
                <StatCard
                  label="Images"
                  value={String(result.images.length)}
                  sub={result.images.filter(i => !i.hasAlt).length > 0 ? `${result.images.filter(i => !i.hasAlt).length} missing alt` : "All have alt"}
                />
                <StatCard
                  label="Inline Scripts"
                  value={String(result.inlineScripts)}
                  sub={result.inlineScripts > 5 ? "Consider externalizing" : "OK"}
                />
              </div>
            </div>

            {/* Quick checks */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Checks</p>
              <div className="divide-y divide-slate-800/40">
                <CheckRow label="HTTPS enabled" pass={result.https} />
                <CheckRow label="Text compression (gzip/br)" pass={result.compressed} />
                <CheckRow label="Viewport meta tag" pass={result.hasViewport} />
                <CheckRow label="Cache-Control header" pass={result.hasCacheControl} />
                <CheckRow label="Title tag present" pass={result.hasTitle} detail={result.hasTitle ? `${result.titleLength} chars` : undefined} />
                <CheckRow label="No render-blocking scripts" pass={result.renderBlockingScripts.length === 0} detail={result.renderBlockingScripts.length > 0 ? `${result.renderBlockingScripts.length} found` : undefined} />
                <CheckRow label="All images have alt text" pass={result.images.filter(i => !i.hasAlt).length === 0} detail={result.images.filter(i => !i.hasAlt).length > 0 ? `${result.images.filter(i => !i.hasAlt).length} missing` : undefined} />
                <CheckRow label="Images have dimensions" pass={result.images.filter(i => !i.hasDimensions).length === 0} detail={result.images.filter(i => !i.hasDimensions).length > 0 ? `${result.images.filter(i => !i.hasDimensions).length} missing` : undefined} />
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Issues &amp; Opportunities</p>
                <div className="space-y-2">
                  {result.issues
                    .sort((a, b) => {
                      const order = { high: 0, medium: 1, low: 2 };
                      return order[a.impact] - order[b.impact];
                    })
                    .map(issue => (
                      <IssueRow key={issue.id} issue={issue} expanded={expanded.has(issue.id)} onToggle={() => toggleIssue(issue.id)} />
                    ))}
                </div>
              </div>
            )}

            {result.issues.length === 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400 text-sm">No issues detected — page looks well-optimized!</p>
              </div>
            )}

            <p className="text-slate-700 text-xs text-center pb-4">
              Analyzed via FileSpark server · {new Date(result.fetchTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
