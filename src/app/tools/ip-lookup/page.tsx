"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, MapPin, Wifi, Server } from "lucide-react";
import type { IpLookupResult } from "@/app/api/ip-lookup/route";

function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map(c => String.fromCodePoint(0x1f1e0 - 65 + c.charCodeAt(0)))
    .join("");
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-slate-200 text-sm font-medium break-all">{value || <span className="text-slate-600">—</span>}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="animate-pulse bg-slate-800 rounded-xl h-16 w-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800 rounded-xl h-16" />
        ))}
      </div>
    </div>
  );
}

export default function IpLookupPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (ip?: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ip-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip ?? input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data as IpLookupResult);
    } catch {
      setError("Network error — could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lookup("");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">IP Address Lookup</h1>
        <p className="text-slate-500 text-sm mb-8">
          Geolocate any IPv4, IPv6 address or hostname, or look up your own IP.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="Enter IP address or hostname, or leave blank for your IP"
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <button
              onClick={() => lookup()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              {loading ? "Looking up…" : "Look Up"}
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
              <p className="text-slate-500 text-xs mb-1">IP Address</p>
              <p className="text-3xl font-bold text-white font-mono">{result.ip}</p>
              {result.isPrivate && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs font-medium">
                  <Server className="w-3.5 h-3.5" />
                  Private / Local IP — no geolocation available
                </div>
              )}
            </div>

            {!result.isPrivate && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard
                    label="Country"
                    value={result.country ? `${flagEmoji(result.countryCode)} ${result.country}` : ""}
                    icon={<Globe className="w-3 h-3" />}
                  />
                  <InfoCard
                    label="Region"
                    value={result.region}
                    icon={<MapPin className="w-3 h-3" />}
                  />
                  <InfoCard
                    label="City"
                    value={result.city}
                    icon={<MapPin className="w-3 h-3" />}
                  />
                  <InfoCard
                    label="ZIP / Postal"
                    value={result.zip}
                    icon={<MapPin className="w-3 h-3" />}
                  />
                  <InfoCard
                    label="ISP"
                    value={result.isp}
                    icon={<Wifi className="w-3 h-3" />}
                  />
                  <InfoCard
                    label="Organization"
                    value={result.org}
                    icon={<Server className="w-3 h-3" />}
                  />
                </div>

                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1.5">AS Number</p>
                  <p className="text-slate-200 text-sm font-mono">{result.as || "—"}</p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>Coordinates</span>
                    <span className="text-slate-600">(not exact)</span>
                  </div>
                  <p className="text-slate-200 text-sm font-mono">
                    {result.lat}, {result.lon}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <h2 className="text-slate-300 text-sm font-medium mb-3">Private IP Ranges</h2>
          <div className="space-y-1.5">
            {[
              { range: "10.0.0.0/8", desc: "Class A private network" },
              { range: "172.16.0.0/12", desc: "Class B private networks (172.16–172.31)" },
              { range: "192.168.0.0/16", desc: "Class C private network" },
              { range: "127.0.0.0/8", desc: "Loopback addresses" },
            ].map(({ range, desc }, i) => (
              <div
                key={range}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${i % 2 === 0 ? "bg-slate-800/30" : ""}`}
              >
                <code className="text-slate-300 font-mono">{range}</code>
                <span className="text-slate-500 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
