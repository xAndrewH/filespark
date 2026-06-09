"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Shield, Clock, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { HeaderAnalysisResult } from "@/app/api/http-headers/route";

const KEY_SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  caching: "Caching",
  content: "Content",
  cors: "CORS",
  server: "Server",
  other: "Other",
};

const CATEGORY_ORDER = ["security", "caching", "content", "cors", "server", "other"];

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (code >= 300 && code < 400) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700/60 text-slate-500 hover:text-slate-300"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CategorySection({
  category,
  headers,
  presentKeys,
}: {
  category: string;
  headers: HeaderAnalysisResult["headers"];
  presentKeys: Set<string>;
}) {
  const [open, setOpen] = useState(true);
  const label = CATEGORY_LABELS[category] ?? category;

  const criticalMissing =
    category === "security"
      ? KEY_SECURITY_HEADERS.filter(k => !presentKeys.has(k))
      : [];

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 border-b border-slate-700/40 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-200 text-sm font-medium">{label}</span>
          <span className="text-slate-500 text-xs">({headers.length})</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-800/40">
          {headers.map((h, i) => (
            <div
              key={h.name}
              className={`group flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-slate-800/30" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-200 text-sm font-medium font-mono">{h.name}</span>
                  {category === "security" && (
                    <span className="px-1.5 py-0.5 text-xs rounded border bg-green-500/10 text-green-400 border-green-500/20">
                      set
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs font-mono mt-0.5 break-all">{h.value}</p>
                {h.description && (
                  <p className="text-slate-600 text-xs mt-0.5">{h.description}</p>
                )}
              </div>
              <CopyButton value={h.value} />
            </div>
          ))}
          {category === "security" && criticalMissing.length > 0 && (
            <div className="px-4 py-3 bg-red-500/5">
              <p className="text-slate-500 text-xs mb-1.5">Missing security headers:</p>
              <div className="flex flex-wrap gap-1.5">
                {criticalMissing.map(k => (
                  <span
                    key={k}
                    className="px-1.5 py-0.5 text-xs rounded border bg-red-500/10 text-red-400 border-red-500/20 font-mono"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="animate-pulse bg-slate-800 rounded-xl h-20" />
      <div className="animate-pulse bg-slate-800 rounded-xl h-12" />
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-slate-800 rounded-xl h-32" />
      ))}
    </div>
  );
}

export default function HttpHeadersPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    const url = input.trim();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/http-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data as HeaderAnalysisResult);
    } catch {
      setError("Network error | could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const grouped: Record<string, HeaderAnalysisResult["headers"]> = {};
  const presentKeys = new Set<string>();
  if (result) {
    for (const h of result.headers) {
      presentKeys.add(h.name.toLowerCase());
      if (!grouped[h.category]) grouped[h.category] = [];
      grouped[h.category].push(h);
    }
  }

  const securityScore = KEY_SECURITY_HEADERS.filter(k => presentKeys.has(k)).length;
  const scoreColor =
    securityScore >= 5 ? "bg-green-500" : securityScore >= 3 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">HTTP Header Analyzer</h1>
        <p className="text-slate-500 text-sm mb-8">
          Inspect response headers, security posture, and caching configuration for any URL.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder="https://example.com"
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>

        {loading && <Skeleton />}

        {error && !loading && (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-1 text-sm font-bold rounded-lg border ${statusColor(result.statusCode)}`}
                    >
                      {result.statusCode} {result.statusText}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-mono break-all">{result.finalUrl}</p>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-medium">{securityScore}/6</span>
                  <span className="text-slate-500">security headers</span>
                </div>
              </div>

              <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor}`}
                  style={{ width: `${(securityScore / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Response time</p>
                  <p className="text-slate-200 text-sm font-medium">{result.responseTime}ms</p>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Total headers</p>
                  <p className="text-slate-200 text-sm font-medium">{result.headers.length}</p>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Redirects</p>
                  <p className="text-slate-200 text-sm font-medium">{result.redirectChain.length}</p>
                </div>
              </div>
            </div>

            {result.redirectChain.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h3 className="text-slate-300 text-sm font-medium mb-3">Redirect Chain</h3>
                <ol className="space-y-1.5">
                  {result.redirectChain.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-slate-600 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span className="text-slate-400 font-mono text-xs break-all">{u}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                headers={grouped[cat]}
                presentKeys={presentKeys}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
