"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function parseNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function fmtDollar(n: number): string {
  return n < 0
    ? `-$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function ROASCalculatorPage() {
  const [spend, setSpend] = useState("");
  const [revenue, setRevenue] = useState("");

  const s = parseNum(spend);
  const r = parseNum(revenue);

  const roas = s !== null && r !== null && s > 0 ? r / s : null;
  const netProfit = s !== null && r !== null ? r - s : null;
  const profitMargin = netProfit !== null && r !== null && r > 0 ? (netProfit / r) * 100 : null;

  const roasDisplay = roas !== null ? `${roas.toFixed(2)}x` : "—";
  const netProfitDisplay = netProfit !== null ? fmtDollar(netProfit) : "—";
  const marginDisplay = profitMargin !== null ? `${profitMargin.toFixed(1)}%` : "—";

  const guideRows = [
    { roas: "< 1x", label: "Losing money" },
    { roas: "1x", label: "Breaking even" },
    { roas: "2–3x", label: "Marginal" },
    { roas: "4x+", label: "Healthy" },
    { roas: "10x+", label: "Excellent" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">ROAS Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">
          Calculate Return on Ad Spend and related metrics. Results update as you type.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Ad Spend</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                <input
                  type="number"
                  value={spend}
                  onChange={(e) => setSpend(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Revenue Generated</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <ResultCard label="ROAS" value={roasDisplay} />
          <ResultCard label="Net Profit" value={netProfitDisplay} />
          <ResultCard label="Profit Margin" value={marginDisplay} />
          <ResultCard label="Break-even ROAS" value="1.0x" />
        </div>

        {roas !== null && roas < 1 && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">Your campaign is losing money. For every $1 spent, you are generating {(roas * 100).toFixed(0)}¢ in revenue.</p>
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <p className="text-white text-sm font-semibold mb-3">ROAS Guide</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left text-slate-400 font-medium pb-2">ROAS</th>
                <th className="text-left text-slate-400 font-medium pb-2">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {guideRows.map((row) => (
                <tr key={row.roas} className="border-b border-slate-800/30 last:border-0">
                  <td className="py-2 text-slate-300 font-mono">{row.roas}</td>
                  <td className="py-2 text-slate-400">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-slate-500 text-xs mt-3">
            Break-even ROAS is always 1.0x — you need $1 in revenue for every $1 spent to cover ad costs. Profit requires ROAS above your cost-of-goods ratio.
          </p>
        </div>
      </div>
    </div>
  );
}
