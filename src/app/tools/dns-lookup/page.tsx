"use client";

import { useState } from "react";
import Link from "next/link";
import type { DnsLookupResult, DnsRecord } from "@/app/api/dns-lookup/route";

const RECORD_ORDER = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];
const RECORD_COLORS: { [k: string]: string } = {
  A: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  AAAA: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  CNAME: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  MX: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  NS: "bg-green-500/20 text-green-400 border-green-500/40",
  TXT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  SOA: "bg-slate-500/20 text-slate-400 border-slate-500/40",
};

function RecordTable({ type, records }: { type: string; records: DnsRecord[] }) {
  const color = RECORD_COLORS[type] ?? "bg-slate-500/20 text-slate-400 border-slate-500/40";
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/40 border-b border-slate-700/40">
        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${color}`}>{type}</span>
        <span className="text-slate-500 text-xs">{records.length} record{records.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y divide-slate-800/40">
        {records.map((r, i) => (
          <div key={i} className="px-4 py-2.5 flex gap-4 items-start">
            <code className="text-slate-200 text-sm font-mono break-all flex-1">{r.value}</code>
            {r.extra && <span className="text-slate-500 text-xs shrink-0 mt-0.5">{r.extra}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DnsLookupPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DnsLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    const domain = input.replace(/^https?:\/\//i, "").split("/")[0].trim();
    if (!domain) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data as DnsLookupResult);
    } catch {
      setError("Network error | could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const orderedTypes = result
    ? [...RECORD_ORDER.filter(t => result.records[t]), ...Object.keys(result.records).filter(t => !RECORD_ORDER.includes(t))]
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">DNS Lookup</h1>
        <p className="text-slate-500 text-sm mb-8">Query A, AAAA, CNAME, MX, NS, TXT, and SOA records for any domain.</p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Domain</label>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lookup()}
                placeholder="example.com"
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={lookup}
                disabled={loading || !input.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
              >
                {loading ? "Looking up…" : "Lookup"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2 animate-pulse">
                <div className="h-4 w-16 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-800 rounded" />
              </div>
            ))}
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
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">Results for <span className="text-white font-medium">{result.domain}</span></p>
              <span className="text-slate-500 text-xs">{Object.values(result.records).flat().length} records found</span>
            </div>
            {orderedTypes.map(type => (
              <RecordTable key={type} type={type} records={result.records[type]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
