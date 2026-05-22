"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const POPULAR = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL", "SGD", "HKD", "NOK", "SEK", "DKK", "NZD", "ZAR", "KRW", "AED"];

export default function CurrencyConverterPage() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data.result === "success") {
          setRates(data.rates);
          setLastUpdated(new Date(data.time_last_update_unix * 1000).toLocaleDateString());
        } else {
          setError("Failed to load exchange rates.");
        }
      })
      .catch(() => setError("Network error — could not load rates."))
      .finally(() => setLoading(false));
  }, []);

  const swap = useCallback(() => { setFrom(to); setTo(from); }, [from, to]);

  const convert = (amt: string, f: string, t: string) => {
    if (!rates || !amt || isNaN(+amt)) return "";
    const inUsd = +amt / rates[f];
    return (inUsd * rates[t]).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };

  const result = convert(amount, from, to);

  const currencies = rates ? Object.keys(rates).sort() : POPULAR;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Currency Converter</h1>
        <p className="text-slate-500 text-sm mb-8">
          Live exchange rates.{" "}
          {lastUpdated && <span className="text-slate-600">Updated {lastUpdated}.</span>}
        </p>

        {loading && (
          <div className="text-center py-12 text-slate-500 text-sm">Loading exchange rates…</div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && rates && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono focus:outline-none focus:border-blue-500"
                  min="0"
                />
              </div>

              {/* From / Swap / To */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1.5 block">From</label>
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={swap}
                  className="mb-0.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors text-sm">
                  ⇄
                </button>
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1.5 block">To</label>
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">{amount} {from} =</p>
                  <p className="text-white text-3xl font-bold">{result} <span className="text-slate-400 text-lg">{to}</span></p>
                  <p className="text-slate-500 text-xs mt-2">
                    1 {from} = {(rates[to] / rates[from]).toLocaleString("en-US", { maximumFractionDigits: 6 })} {to}
                  </p>
                </div>
              )}
            </div>

            {/* Quick conversions */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">Quick conversions from {from}</p>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR.filter(c => c !== from).slice(0, 10).map(c => (
                  <button
                    key={c}
                    onClick={() => setTo(c)}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-colors ${to === c ? "bg-blue-600/30 border border-blue-500/40 text-blue-300" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white"}`}>
                    <span className="font-medium">{c}</span>
                    <span className="font-mono">{convert("1", from, c)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
