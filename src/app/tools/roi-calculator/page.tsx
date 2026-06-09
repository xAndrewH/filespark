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

function ResultCard({
  label,
  value,
  formula,
}: {
  label: string;
  value: string;
  formula?: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      {formula && <div className="text-xs text-slate-600 mt-2 font-mono">{formula}</div>}
    </div>
  );
}

function SimpleROI() {
  const [investment, setInvestment] = useState("");
  const [entryMode, setEntryMode] = useState<"finalValue" | "netProfit">("finalValue");
  const [finalValue, setFinalValue] = useState("");
  const [netProfitInput, setNetProfitInput] = useState("");

  const inv = parseNum(investment);

  let roiPct: number | null = null;
  let netProfit: number | null = null;
  let multiple: number | null = null;

  if (entryMode === "finalValue") {
    const fv = parseNum(finalValue);
    if (inv !== null && fv !== null && inv > 0) {
      netProfit = fv - inv;
      roiPct = (netProfit / inv) * 100;
      multiple = fv / inv;
    }
  } else {
    const np = parseNum(netProfitInput);
    if (inv !== null && np !== null && inv > 0) {
      netProfit = np;
      roiPct = (np / inv) * 100;
      multiple = 1 + np / inv;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Initial Investment</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-slate-400">Enter:</span>
              <div className="inline-flex rounded-lg border border-slate-700/50 overflow-hidden">
                <button
                  onClick={() => setEntryMode("finalValue")}
                  className={`px-3 py-1.5 text-xs transition-colors ${entryMode === "finalValue" ? "bg-blue-600 text-white font-medium" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
                >
                  Final Value
                </button>
                <button
                  onClick={() => setEntryMode("netProfit")}
                  className={`px-3 py-1.5 text-xs transition-colors ${entryMode === "netProfit" ? "bg-blue-600 text-white font-medium" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
                >
                  Net Profit
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={entryMode === "finalValue" ? finalValue : netProfitInput}
                onChange={(e) =>
                  entryMode === "finalValue"
                    ? setFinalValue(e.target.value)
                    : setNetProfitInput(e.target.value)
                }
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultCard
          label="ROI"
          value={roiPct !== null ? `${roiPct.toFixed(1)}%` : "|"}
          formula="(Gain − Cost) / Cost × 100"
        />
        <ResultCard
          label="Net Profit"
          value={netProfit !== null ? fmtDollar(netProfit) : "|"}
          formula="Final Value − Investment"
        />
        <ResultCard
          label="Multiple"
          value={multiple !== null ? `${multiple.toFixed(2)}x` : "|"}
          formula="Final Value / Investment"
        />
      </div>
    </div>
  );
}

function InvestmentPeriod() {
  const [investment, setInvestment] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState(5);

  const inv = parseNum(investment);
  const rate = parseNum(annualReturn);

  let finalValue: number | null = null;
  let totalGain: number | null = null;
  let cagr: number | null = null;
  let annualizedROI: number | null = null;

  if (inv !== null && rate !== null && inv > 0) {
    finalValue = inv * Math.pow(1 + rate / 100, years);
    totalGain = finalValue - inv;
    cagr = rate;
    annualizedROI = rate;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Initial Investment</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Annual Return</label>
            <div className="relative">
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Time Period: <span className="text-slate-200 font-medium">{years} year{years !== 1 ? "s" : ""}</span>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 yr</span>
              <span>30 yrs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          label="Final Value"
          value={finalValue !== null ? fmtDollar(finalValue) : "|"}
          formula="P × (1 + r)^t"
        />
        <ResultCard
          label="Total Gain"
          value={totalGain !== null ? fmtDollar(totalGain) : "|"}
          formula="Final Value − Investment"
        />
        <ResultCard
          label="CAGR"
          value={cagr !== null ? `${cagr.toFixed(2)}%` : "|"}
          formula="Annual compound rate"
        />
        <ResultCard
          label="Annualized ROI"
          value={annualizedROI !== null ? `${annualizedROI.toFixed(2)}%` : "|"}
          formula="Return per year"
        />
      </div>
    </div>
  );
}

export default function ROICalculatorPage() {
  const [mode, setMode] = useState<"simple" | "period">("simple");

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

        <h1 className="text-3xl font-bold text-white mb-1">ROI Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">
          Calculate Return on Investment for simple or time-based scenarios.
        </p>

        <div className="inline-flex rounded-lg border border-slate-700/50 overflow-hidden mb-6">
          <button
            onClick={() => setMode("simple")}
            className={`px-4 py-2 text-sm transition-colors ${mode === "simple" ? "bg-blue-600 text-white font-medium" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
          >
            Simple ROI
          </button>
          <button
            onClick={() => setMode("period")}
            className={`px-4 py-2 text-sm transition-colors ${mode === "period" ? "bg-blue-600 text-white font-medium" : "bg-slate-800/60 text-slate-400 hover:text-white"}`}
          >
            Investment Period
          </button>
        </div>

        {mode === "simple" ? <SimpleROI /> : <InvestmentPeriod />}
      </div>
    </div>
  );
}
