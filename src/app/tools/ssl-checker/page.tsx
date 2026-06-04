"use client";

import { useState } from "react";
import Link from "next/link";
import type { SslCheckResult } from "@/app/api/ssl-check/route";

function formatDate(str: string) {
  try {
    return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return str;
  }
}

function SkeletonRow() {
  return <div className="h-4 bg-slate-800 rounded animate-pulse" />;
}

export default function SslCheckerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SslCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedHost, setCheckedHost] = useState("");

  const check = async () => {
    const hostname = input.replace(/^https?:\/\//i, "").split("/")[0].trim();
    if (!hostname) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setCheckedHost(hostname);
    try {
      const res = await fetch("/api/ssl-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error");
      } else {
        setResult(data as SslCheckResult);
      }
    } catch {
      setError("Network error — could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") check();
  };

  const statusBadge = result
    ? result.isExpired
      ? { label: "Expired", classes: "bg-red-500/20 text-red-400 border-red-500/40" }
      : result.isExpiringSoon
        ? { label: "Expiring Soon", classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" }
        : { label: "Valid", classes: "bg-green-500/20 text-green-400 border-green-500/40" }
    : null;

  const daysBarPct = result
    ? Math.min(100, Math.max(0, (result.daysUntil / result.totalDays) * 100))
    : 0;
  const daysBarColor = result?.isExpired
    ? "bg-red-500"
    : result?.isExpiringSoon
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">SSL Certificate Checker</h1>
        <p className="text-slate-500 text-sm mb-8">Enter a domain to inspect its SSL certificate — expiry, issuer, SANs, and fingerprint.</p>

        {/* Input */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Domain</label>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="example.com or https://example.com"
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={check}
                disabled={loading || !input.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
              >
                {loading ? "Checking…" : "Check"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-24 h-6 bg-slate-800 rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 shrink-0 h-4 bg-slate-800 rounded animate-pulse" />
                  <div className="flex-1"><SkeletonRow /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <div>
                <p className="text-red-400 text-sm font-medium">Could not check {checkedHost}</p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && statusBadge && (
          <div className="mt-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge.classes}`}>
                {statusBadge.label}
              </span>
              <span className="text-slate-300 text-sm font-medium">{checkedHost}</span>
            </div>

            {/* Details grid */}
            <div className="space-y-3">
              {[
                { label: "Issued To", value: [result.subject.CN, result.subject.O].filter(Boolean).join(" — ") || "—" },
                { label: "Issued By", value: [result.issuer.CN, result.issuer.O].filter(Boolean).join(" — ") || "—" },
                { label: "Valid From", value: formatDate(result.validFrom) },
                { label: "Valid To", value: formatDate(result.validTo) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="text-slate-500 text-xs w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-slate-200 text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* Days remaining progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Days Remaining</span>
                <span className={`text-sm font-semibold ${result.isExpired ? "text-red-400" : result.isExpiringSoon ? "text-yellow-400" : "text-green-400"}`}>
                  {result.isExpired
                    ? `Expired ${Math.abs(result.daysUntil)} days ago`
                    : `${result.daysUntil} of ${result.totalDays} days`}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${daysBarColor}`}
                  style={{ width: `${daysBarPct}%` }}
                />
              </div>
            </div>

            {/* SANs */}
            {result.sans.length > 0 && (
              <div className="space-y-2">
                <span className="text-slate-500 text-xs">Subject Alternative Names ({result.sans.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.sans.map(san => (
                    <span key={san} className="text-xs bg-slate-800 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                      {san}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fingerprint */}
            {result.fingerprint256 && (
              <div className="space-y-1.5">
                <span className="text-slate-500 text-xs">SHA-256 Fingerprint</span>
                <p className="text-slate-400 text-xs font-mono break-all bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 leading-relaxed">
                  {result.fingerprint256}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
