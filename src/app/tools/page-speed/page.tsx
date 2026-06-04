"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageSpeedResult } from "@/app/api/page-speed/route";

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "text-green-400 bg-green-500/10 border-green-500/30"
    : score >= 70 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
    : "text-red-400 bg-red-500/10 border-red-500/30";
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-3 ${color}`}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/40 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="text-right">
        <span className="text-slate-200 text-sm font-medium">{value}</span>
        {sub && <div className="text-slate-500 text-xs">{sub}</div>}
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function PageSpeedPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    let url = input.trim();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/page-speed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Page Speed Estimator</h1>
        <p className="text-slate-500 text-sm mb-8">Analyze load time, TTFB, resource counts, and get actionable performance tips for any public URL.</p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">URL</label>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && check()}
                placeholder="https://example.com"
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={check}
                disabled={loading || !input.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
              >
                {loading ? "Analyzing…" : "Analyze"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-800 rounded-xl" />)}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-slate-800 rounded" />)}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="mt-5 space-y-4">
            {/* Scores */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Performance Scores</p>
              <div className="grid grid-cols-4 gap-3">
                <ScoreBadge score={result.scores.performance} label="Overall" />
                <ScoreBadge score={result.scores.ttfbScore} label="TTFB" />
                <ScoreBadge score={result.scores.sizeScore} label="Size" />
                <ScoreBadge score={result.scores.requestScore} label="Requests" />
              </div>
              <p className="text-slate-600 text-xs">Scores are estimates based on direct server-side fetch — not a full browser render.</p>
            </div>

            {/* Metrics */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Metrics</p>
              <MetricRow label="Status" value={`${result.statusCode}`} sub={result.finalUrl !== result.url ? `→ ${result.finalUrl}` : undefined} />
              <MetricRow label="TTFB" value={`${result.ttfbMs} ms`} sub={result.ttfbMs < 200 ? "Excellent" : result.ttfbMs < 400 ? "Good" : result.ttfbMs < 600 ? "Needs work" : "Slow"} />
              <MetricRow label="Load Time" value={`${result.loadTimeMs} ms`} />
              <MetricRow label="HTML Size" value={formatBytes(result.contentSizeBytes)} />
            </div>

            {/* Resources */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Resources (HTML-detected)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Scripts", v: result.resourceCounts.scripts },
                  { label: "Stylesheets", v: result.resourceCounts.stylesheets },
                  { label: "Images", v: result.resourceCounts.images },
                  { label: "Fonts", v: result.resourceCounts.fonts },
                ].map(({ label, v }) => (
                  <div key={label} className="bg-slate-800/40 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{label}</span>
                    <span className="text-slate-200 text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Suggestions */}
            {(result.issues.length > 0 || result.suggestions.length > 0) && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                {result.issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-red-400 uppercase tracking-wide">Issues Found</p>
                    {result.issues.map((issue, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-red-400 shrink-0 mt-0.5">●</span>
                        <p className="text-slate-300 text-sm">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Suggestions</p>
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-yellow-400 shrink-0 mt-0.5">→</span>
                        <p className="text-slate-400 text-sm">{s}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key headers */}
            {Object.keys(result.headers).length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Key Response Headers</p>
                <div className="space-y-1.5">
                  {["content-type", "cache-control", "content-encoding", "x-frame-options", "strict-transport-security", "server", "x-powered-by"].map(k => {
                    const v = result.headers[k];
                    if (!v) return null;
                    return (
                      <div key={k} className="flex gap-4">
                        <span className="text-slate-500 text-xs font-mono w-48 shrink-0 pt-0.5">{k}</span>
                        <span className="text-slate-300 text-xs font-mono break-all">{v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
