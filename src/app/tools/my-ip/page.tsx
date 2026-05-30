"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type IpData = {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  timezone: string;
  latitude: number;
  longitude: number;
  currency: string;
  languages: string;
};

export default function MyIpPage() {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchIp = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.status === 429) {
        setError("Rate limited, try again shortly.");
        return;
      }
      if (!res.ok) {
        setError("Failed to fetch IP information.");
        return;
      }
      const json = await res.json();
      setData(json as IpData);
    } catch {
      setError("Failed to fetch IP information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIp();
  }, [fetchIp]);

  const copyIp = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">What&apos;s My IP</h1>
        <p className="text-slate-500 text-sm mb-8">See your public IP address and network information.</p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-slate-800/60 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-3 mt-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-xl p-4 space-y-2">
                    <div className="h-3 bg-slate-700/60 rounded w-1/2" />
                    <div className="h-4 bg-slate-700/40 rounded w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-6 space-y-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchIp}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-sm rounded-xl transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-xs mb-1">Your IP Address</p>
                <p className="text-4xl font-mono font-bold text-white break-all">{data.ip}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyIp}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-sm rounded-xl transition-colors"
                >
                  {copied ? "Copied!" : "Copy IP"}
                </button>
                <button
                  onClick={fetchIp}
                  className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white text-sm rounded-xl transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Location</p>
                  <p className="text-white text-sm">{[data.city, data.region, data.country_name].filter(Boolean).join(", ")}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Timezone</p>
                  <p className="text-white text-sm">{data.timezone}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">ISP / Org</p>
                  <p className="text-white text-sm break-all">{data.org}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Coordinates</p>
                  <p className="text-white text-sm font-mono">{data.latitude}, {data.longitude}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Currency</p>
                  <p className="text-white text-sm">{data.currency}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Languages</p>
                  <p className="text-white text-sm">{data.languages}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">
          Your IP is visible to every website you visit.
        </p>
      </div>
    </div>
  );
}
