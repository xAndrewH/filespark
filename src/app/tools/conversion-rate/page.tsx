"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "conversion" | "revenue" | "abtest";

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Simple z-test for two proportions
function zTestTwoProps(n1: number, p1: number, n2: number, p2: number) {
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);
  if (pPool === 0 || pPool === 1) return { z: 0, pValue: 1, significant: false };
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, pValue: 1, significant: false };
  const z = Math.abs((p2 - p1) / se);
  // Approximate two-tailed p-value using error function
  const pValue = 2 * (1 - normalCDF(z));
  return { z, pValue, significant: pValue < 0.05 };
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const phi = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? phi : 1 - phi;
}

const BENCHMARKS = [
  { label: "E-commerce", range: "2–4%", min: 2, max: 4 },
  { label: "SaaS / Free Trial", range: "5–7%", min: 5, max: 7 },
  { label: "Lead Generation", range: "10–15%", min: 10, max: 15 },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-4 text-center">
      <p className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-white text-xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function NumInput({ label, value, onChange, placeholder, prefix, suffix }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; prefix?: string; suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className={`w-full bg-slate-800/60 border border-slate-700/50 rounded-lg py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors ${prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-7" : "px-3"}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ConversionRatePage() {
  const [tab, setTab] = useState<Tab>("conversion");

  // Tab 1
  const [visitors, setVisitors] = useState("1000");
  const [conversions, setConversions] = useState("35");

  // Tab 2
  const [revVisitors, setRevVisitors] = useState("10000");
  const [currentCvr, setCurrentCvr] = useState("2.5");
  const [aov, setAov] = useState("85");
  const [targetCvr, setTargetCvr] = useState("3.5");

  // Tab 3
  const [ctrlVisitors, setCtrlVisitors] = useState("5000");
  const [ctrlConv, setCtrlConv] = useState("100");
  const [varVisitors, setVarVisitors] = useState("5000");
  const [varConv, setVarConv] = useState("130");

  const tabs: { id: Tab; label: string }[] = [
    { id: "conversion", label: "Conversion Rate" },
    { id: "revenue", label: "Revenue Impact" },
    { id: "abtest", label: "A/B Test" },
  ];

  // Tab 1 calcs
  const v = parseFloat(visitors) || 0;
  const c = parseFloat(conversions) || 0;
  const cvr = v > 0 ? (c / v) * 100 : 0;

  // Tab 2 calcs
  const rv = parseFloat(revVisitors) || 0;
  const cc = parseFloat(currentCvr) || 0;
  const aovVal = parseFloat(aov) || 0;
  const tc = parseFloat(targetCvr) || 0;
  const currentRevenue = rv * (cc / 100) * aovVal;
  const targetRevenue = rv * (tc / 100) * aovVal;
  const revenueIncrease = targetRevenue - currentRevenue;
  const revenueIncreasePct = currentRevenue > 0 ? (revenueIncrease / currentRevenue) * 100 : 0;

  // Tab 3 calcs
  const cv = parseFloat(ctrlVisitors) || 0;
  const cc2 = parseFloat(ctrlConv) || 0;
  const vv = parseFloat(varVisitors) || 0;
  const vc = parseFloat(varConv) || 0;
  const ctrlRate = cv > 0 ? (cc2 / cv) * 100 : 0;
  const varRate = vv > 0 ? (vc / vv) * 100 : 0;
  const uplift = ctrlRate > 0 ? ((varRate - ctrlRate) / ctrlRate) * 100 : 0;
  const { z, pValue, significant } = (cv > 0 && vv > 0 && cc2 > 0 && vc > 0)
    ? zTestTwoProps(cv, cc2 / cv, vv, vc / vv)
    : { z: 0, pValue: 1, significant: false };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Conversion Rate Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">Calculate conversion rates, revenue impact, and A/B test significance.</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-900/60 border border-slate-800/60 p-1 rounded-xl">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Conversion Rate */}
        {tab === "conversion" && (
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Visitors" value={visitors} onChange={setVisitors} placeholder="1000" />
                <NumInput label="Conversions" value={conversions} onChange={setConversions} placeholder="35" />
              </div>
            </div>

            {v > 0 && (
              <>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 text-center">
                  <p className="text-slate-500 text-xs mb-1">Conversion Rate</p>
                  <p className="text-5xl font-bold text-white tabular-nums">{fmt(cvr)}<span className="text-2xl text-slate-400">%</span></p>
                  <p className="text-slate-500 text-xs mt-1">{c.toLocaleString()} out of {v.toLocaleString()} visitors</p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                  <p className="text-white text-sm font-medium mb-3">Industry Benchmarks</p>
                  <div className="space-y-3">
                    {BENCHMARKS.map(b => {
                      const isInRange = cvr >= b.min && cvr <= b.max;
                      const isAbove = cvr > b.max;
                      return (
                        <div key={b.label} className="flex items-center gap-3">
                          <div className="w-32 shrink-0">
                            <p className="text-slate-300 text-xs font-medium">{b.label}</p>
                            <p className="text-slate-500 text-xs">{b.range}</p>
                          </div>
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isAbove ? "bg-green-500" : isInRange ? "bg-blue-500" : "bg-slate-600"}`}
                              style={{ width: `${Math.min((cvr / b.max) * 100, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-16 text-right ${isAbove ? "text-green-400" : isInRange ? "text-blue-400" : "text-slate-500"}`}>
                            {isAbove ? "Above" : isInRange ? "In range" : "Below"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Revenue Impact */}
        {tab === "revenue" && (
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Monthly Visitors" value={revVisitors} onChange={setRevVisitors} />
                <NumInput label="Avg. Order Value" value={aov} onChange={setAov} prefix="$" />
                <NumInput label="Current CVR" value={currentCvr} onChange={setCurrentCvr} suffix="%" />
                <NumInput label="Target CVR" value={targetCvr} onChange={setTargetCvr} suffix="%" />
              </div>
            </div>

            {rv > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Current Revenue" value={fmtUSD(currentRevenue)} sub="per month" />
                <StatCard label="Target Revenue" value={fmtUSD(targetRevenue)} sub="per month" />
                <StatCard
                  label="Revenue Increase"
                  value={`${revenueIncrease >= 0 ? "+" : ""}${fmtUSD(revenueIncrease)}`}
                  sub="additional per month"
                />
                <StatCard
                  label="Relative Increase"
                  value={`${revenueIncreasePct >= 0 ? "+" : ""}${fmt(revenueIncreasePct)}%`}
                  sub="revenue growth"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: A/B Test */}
        {tab === "abtest" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <p className="text-white text-sm font-semibold">Control</p>
                <NumInput label="Visitors" value={ctrlVisitors} onChange={setCtrlVisitors} />
                <NumInput label="Conversions" value={ctrlConv} onChange={setCtrlConv} />
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <p className="text-white text-sm font-semibold">Variant</p>
                <NumInput label="Visitors" value={varVisitors} onChange={setVarVisitors} />
                <NumInput label="Conversions" value={varConv} onChange={setVarConv} />
              </div>
            </div>

            {cv > 0 && vv > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Control Rate" value={`${fmt(ctrlRate)}%`} />
                  <StatCard label="Variant Rate" value={`${fmt(varRate)}%`} />
                  <StatCard
                    label="Relative Uplift"
                    value={`${uplift >= 0 ? "+" : ""}${fmt(uplift)}%`}
                  />
                  <StatCard label="p-value" value={fmt(pValue, 4)} sub={significant ? "significant (p < 0.05)" : "not significant"} />
                </div>

                <div className={`bg-slate-900/60 border rounded-2xl p-5 ${significant ? "border-green-500/40" : "border-slate-800/60"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${significant ? "bg-green-500/20" : "bg-slate-800"}`}>
                      {significant ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${significant ? "text-green-400" : "text-slate-300"}`}>
                        {significant ? "Statistically Significant" : "Not Yet Significant"}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {significant
                          ? `Result is significant at 95% confidence (z=${fmt(z, 3)}). The variant likely performs better.`
                          : `Need more data to reach 95% confidence. z-score: ${fmt(z, 3)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
