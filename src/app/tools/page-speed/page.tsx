"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageAnalysis, CategoryResult, AnalysisIssue } from "@/app/api/page-speed/route";

/* ── Helpers ─────────────────────────────────────────────────────── */
function scoreColor(score: number): string {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Poor";
}

function scoreLabelCls(score: number): string {
  if (score >= 90) return "text-green-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function ttfbLabel(ms: number): string {
  if (ms <= 200) return "Fast";
  if (ms <= 600) return "Moderate";
  if (ms <= 1500) return "Slow";
  return "Very Slow";
}

function ttfbCls(ms: number): string {
  if (ms <= 200) return "text-green-400";
  if (ms <= 600) return "text-orange-400";
  return "text-red-400";
}

function fmtBytes(b: number): string {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000) return `${Math.round(b / 1000)} KB`;
  return `${b} B`;
}

function impactCls(impact: AnalysisIssue["impact"]): string {
  if (impact === "high") return "text-red-400";
  if (impact === "medium") return "text-orange-400";
  return "text-slate-500";
}

function impactDot(impact: AnalysisIssue["impact"]): string {
  if (impact === "high") return "#ff4e42";
  if (impact === "medium") return "#ffa400";
  return "#64748b";
}

/* ── Score ring ──────────────────────────────────────────────────── */
function ScoreRing({ score, label, accent }: { score: number; label: string; accent: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (score / 100) * circ}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-white leading-none">{score}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-slate-300 text-xs font-semibold">{label}</p>
        <p className={`text-xs mt-0.5 ${scoreLabelCls(score)}`}>{scoreLabel(score)}</p>
      </div>
    </div>
  );
}

/* ── Check row ───────────────────────────────────────────────────── */
function CheckRow({ label, pass, detail }: { label: string; pass: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-800/40 last:border-0">
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
  return (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: impactDot(issue.impact) }} />
        <span className="flex-1 text-slate-200 text-sm">{issue.title}</span>
        <span className={`text-xs font-medium shrink-0 capitalize ${impactCls(issue.impact)}`}>{issue.impact}</span>
        <svg className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-slate-500 text-xs leading-relaxed">{issue.description}</p>
          {issue.details && issue.details.length > 0 && (
            <ul className="space-y-1">
              {issue.details.map((d, i) => <li key={i} className="text-slate-600 text-xs font-mono truncate">↳ {d}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Category section ────────────────────────────────────────────── */
function CategorySection({
  title, accent, result, checks, expanded, onToggle,
}: {
  title: string;
  accent: string;
  result: CategoryResult;
  checks: { label: string; pass: boolean; detail?: string }[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasIssues = result.issues.length > 0;
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs">{result.passed}/{result.total} passed</span>
          <span className="text-sm font-bold" style={{ color: scoreColor(result.score) }}>{result.score}</span>
        </div>
      </div>

      {/* Checks */}
      <div className="px-5 divide-y divide-slate-800/40">
        {checks.map(c => <CheckRow key={c.label} {...c} />)}
      </div>

      {/* Issues */}
      {hasIssues && (
        <div className="px-5 pb-4 pt-3 space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Issues</p>
          {result.issues
            .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.impact]) - ({ high: 0, medium: 1, low: 2 }[b.impact]))
            .map(issue => (
              <IssueRow key={issue.id} issue={issue} expanded={expanded.has(issue.id)} onToggle={() => onToggle(issue.id)} />
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Score legend ────────────────────────────────────────────────── */
function ScoreLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      {[{ color: "#ff4e42", label: "0–49 Poor" }, { color: "#ffa400", label: "50–89 Needs improvement" }, { color: "#0cce6b", label: "90–100 Good" }].map(({ color, label }) => (
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

  const r = result;
  const c = r?.categories;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Page Speed</h1>
        <p className="text-slate-500 text-sm mb-8">Analyzes performance, accessibility, best practices, and SEO — similar to Lighthouse, no API key needed.</p>

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
              <p className="text-slate-600 text-xs mt-1">Fetching and auditing resources</p>
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
        {r && c && !loading && (
          <div className="mt-6 space-y-5">

            {/* 4 score rings */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-5">
                <ScoreRing score={c.performance.score}   label="Performance"    accent="#3b82f6" />
                <ScoreRing score={c.accessibility.score} label="Accessibility"  accent="#10b981" />
                <ScoreRing score={c.bestPractices.score} label="Best Practices" accent="#f59e0b" />
                <ScoreRing score={c.seo.score}           label="SEO"            accent="#a855f7" />
              </div>
              <div className="border-t border-slate-800/60 pt-4 space-y-2">
                <p className="text-slate-400 text-xs">
                  <span className="text-slate-300 font-medium">Analyzed:</span> {r.finalUrl}
                </p>
                {r.hasTitle && <p className="text-slate-600 text-xs truncate">"{r.title}"</p>}
                <ScoreLegend />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: "TTFB", value: r.ttfb >= 1000 ? `${(r.ttfb / 1000).toFixed(1)}s` : `${r.ttfb}ms`, cls: ttfbCls(r.ttfb), sub: ttfbLabel(r.ttfb) },
                { label: "HTML", value: fmtBytes(r.htmlSize), cls: "text-white", sub: r.compressed ? "Compressed" : "No gzip" },
                { label: "Scripts", value: String(r.scripts.length), cls: "text-white", sub: `${r.renderBlockingScripts.length} blocking` },
                { label: "CSS files", value: String(r.stylesheets.length), cls: "text-white", sub: `${r.inlineStyles} inline` },
                { label: "Images", value: String(r.images.length), cls: "text-white", sub: `${r.lazyImageCount} lazy` },
                { label: "3rd parties", value: String(r.thirdPartyDomains.length), cls: "text-white", sub: "domains" },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                  <p className={`text-lg font-bold leading-none ${s.cls}`}>{s.value}</p>
                  <p className="text-slate-600 text-xs mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Performance */}
            <CategorySection
              title="Performance"
              accent="#3b82f6"
              result={c.performance}
              expanded={expanded}
              onToggle={toggleIssue}
              checks={[
                { label: "Fast server response (TTFB ≤ 600ms)", pass: r.ttfb <= 600, detail: `${r.ttfb}ms` },
                { label: "Text compression enabled", pass: r.compressed },
                { label: "Reasonable HTML size (< 150 KB)", pass: r.htmlSize < 150_000, detail: fmtBytes(r.htmlSize) },
                { label: "No render-blocking scripts", pass: r.renderBlockingScripts.length === 0, detail: r.renderBlockingScripts.length > 0 ? `${r.renderBlockingScripts.length} found` : undefined },
                { label: "Few render-blocking stylesheets (≤ 3)", pass: r.stylesheets.length <= 3, detail: `${r.stylesheets.length} found` },
                { label: "Viewport meta tag present", pass: r.hasViewport },
                { label: "Images use lazy loading", pass: r.images.length <= 3 || r.lazyImageCount >= r.images.length - 1 },
                { label: "Modern image formats (WebP/AVIF)", pass: r.modernImageCount > 0 || r.legacyImageCount === 0 },
                { label: "Few third-party domains (≤ 3)", pass: r.thirdPartyDomains.length <= 3, detail: `${r.thirdPartyDomains.length} found` },
                { label: "Preconnect hints for 3rd parties", pass: r.hasPreconnect || r.thirdPartyDomains.length === 0 },
              ]}
            />

            {/* Accessibility */}
            <CategorySection
              title="Accessibility"
              accent="#10b981"
              result={c.accessibility}
              expanded={expanded}
              onToggle={toggleIssue}
              checks={[
                { label: "HTML lang attribute set", pass: r.hasLang, detail: r.lang || undefined },
                { label: "All images have alt text", pass: r.imagesWithoutAlt === 0, detail: r.imagesWithoutAlt > 0 ? `${r.imagesWithoutAlt} missing` : undefined },
                { label: "Images have width & height", pass: r.imagesWithoutDimensions === 0, detail: r.imagesWithoutDimensions > 0 ? `${r.imagesWithoutDimensions} missing` : undefined },
                { label: "Character set declared", pass: r.hasCharset },
                { label: "Buttons have accessible labels", pass: r.buttonsWithoutLabel === 0, detail: r.buttonsWithoutLabel > 0 ? `${r.buttonsWithoutLabel} unlabelled` : undefined },
                { label: "Form inputs have associated labels", pass: r.inputsWithoutLabel === 0, detail: r.inputsWithoutLabel > 0 ? `${r.inputsWithoutLabel} unlabelled` : undefined },
                { label: "Exactly one H1 heading", pass: r.h1Count === 1, detail: `${r.h1Count} found` },
              ]}
            />

            {/* Best Practices */}
            <CategorySection
              title="Best Practices"
              accent="#f59e0b"
              result={c.bestPractices}
              expanded={expanded}
              onToggle={toggleIssue}
              checks={[
                { label: "Served over HTTPS", pass: r.https },
                { label: "DOCTYPE html declared", pass: r.hasDoctype },
                { label: "Character set meta tag", pass: r.hasCharset },
                { label: "No mixed content (HTTP on HTTPS)", pass: r.mixedContentCount === 0, detail: r.mixedContentCount > 0 ? `${r.mixedContentCount} found` : undefined },
                { label: "Cache-Control header present", pass: r.hasCacheControl },
                { label: 'External links have rel="noopener"', pass: r.externalLinksWithoutNoopener === 0, detail: r.externalLinksWithoutNoopener > 0 ? `${r.externalLinksWithoutNoopener} missing` : undefined },
                { label: "Password fields not on HTTP", pass: !r.passwordInputOnHttp },
              ]}
            />

            {/* SEO */}
            <CategorySection
              title="SEO"
              accent="#a855f7"
              result={c.seo}
              expanded={expanded}
              onToggle={toggleIssue}
              checks={[
                { label: "Title tag (10–60 chars)", pass: r.hasTitle && r.titleLength >= 10 && r.titleLength <= 60, detail: r.hasTitle ? `${r.titleLength} chars` : "missing" },
                { label: "Meta description (50–160 chars)", pass: r.hasMetaDescription && r.metaDescriptionLength >= 50 && r.metaDescriptionLength <= 160, detail: r.hasMetaDescription ? `${r.metaDescriptionLength} chars` : "missing" },
                { label: "HTML lang attribute", pass: r.hasLang },
                { label: "Exactly one H1", pass: r.h1Count === 1, detail: `${r.h1Count} found` },
                { label: "Not blocked by noindex", pass: !r.isNoIndex },
                { label: "Canonical URL declared", pass: r.hasCanonical },
                { label: "Open Graph tags", pass: r.hasOgTags },
                { label: "Structured data (JSON-LD)", pass: r.hasStructuredData },
              ]}
            />

            <p className="text-slate-700 text-xs text-center pb-4">
              Static HTML analysis · FileSpark · {new Date(r.fetchTime).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
