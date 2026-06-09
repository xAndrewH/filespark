"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type CalcMode = "cpm" | "cpc" | "ctr";

function parseNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={`w-full bg-slate-900 border border-slate-700/60 rounded-lg ${prefix ? "pl-7" : "px-3"} ${suffix ? "pr-10" : "pr-3"} py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function CPMMode() {
  const [spend, setSpend] = useState("");
  const [impressions, setImpressions] = useState("");

  const s = parseNum(spend);
  const imp = parseNum(impressions);
  const cpm = s !== null && imp !== null && imp > 0 ? (s / imp) * 1000 : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
        <div className="flex flex-col gap-4">
          <InputField label="Total Spend" value={spend} onChange={setSpend} prefix="$" />
          <InputField label="Impressions" value={impressions} onChange={setImpressions} />
        </div>
      </div>
      <ResultCard
        label="CPM (Cost per 1,000 Impressions)"
        value={cpm !== null ? `$${cpm.toFixed(2)}` : "|"}
      />
      <p className="text-xs text-slate-500 font-mono text-center">CPM = (Spend ÷ Impressions) × 1,000</p>
    </div>
  );
}

function CPCMode() {
  const [spend, setSpend] = useState("");
  const [clicks, setClicks] = useState("");

  const s = parseNum(spend);
  const c = parseNum(clicks);
  const cpc = s !== null && c !== null && c > 0 ? s / c : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
        <div className="flex flex-col gap-4">
          <InputField label="Total Spend" value={spend} onChange={setSpend} prefix="$" />
          <InputField label="Clicks" value={clicks} onChange={setClicks} />
        </div>
      </div>
      <ResultCard
        label="CPC (Cost per Click)"
        value={cpc !== null ? `$${cpc.toFixed(2)}` : "|"}
      />
      <p className="text-xs text-slate-500 font-mono text-center">CPC = Spend ÷ Clicks</p>
    </div>
  );
}

function CTRMode() {
  const [clicks, setClicks] = useState("");
  const [impressions, setImpressions] = useState("");

  const c = parseNum(clicks);
  const imp = parseNum(impressions);
  const ctr = c !== null && imp !== null && imp > 0 ? (c / imp) * 100 : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
        <div className="flex flex-col gap-4">
          <InputField label="Clicks" value={clicks} onChange={setClicks} />
          <InputField label="Impressions" value={impressions} onChange={setImpressions} />
        </div>
      </div>
      <ResultCard
        label="CTR (Click-Through Rate)"
        value={ctr !== null ? `${ctr.toFixed(3)}%` : "|"}
      />
      <p className="text-xs text-slate-500 font-mono text-center">CTR = (Clicks ÷ Impressions) × 100</p>
    </div>
  );
}

const modeOptions: { value: CalcMode; label: string }[] = [
  { value: "cpm", label: "CPM from Spend + Impressions" },
  { value: "cpc", label: "CPC from Spend + Clicks" },
  { value: "ctr", label: "CTR from Clicks + Impressions" },
];

const quickRef = [
  { term: "CPM", def: "Cost Per 1,000 Impressions", formula: "Spend / Impressions × 1000" },
  { term: "CPC", def: "Cost Per Click", formula: "Spend / Clicks" },
  { term: "CTR", def: "Click-Through Rate", formula: "Clicks / Impressions × 100" },
  { term: "CPA", def: "Cost Per Acquisition", formula: "Spend / Conversions" },
  { term: "ROAS", def: "Return On Ad Spend", formula: "Revenue / Spend" },
];

export default function CPMCalculatorPage() {
  const [mode, setMode] = useState<CalcMode>("cpm");

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

        <h1 className="text-3xl font-bold text-white mb-1">CPM / CPC / CTR Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">
          Calculate key ad metrics. Choose two values to find the third.
        </p>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-1.5">Calculate</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CalcMode)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
          >
            {modeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {mode === "cpm" && <CPMMode />}
        {mode === "cpc" && <CPCMode />}
        {mode === "ctr" && <CTRMode />}

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mt-8">
          <p className="text-white text-sm font-semibold mb-3">Quick Reference</p>
          <div className="flex flex-col gap-3">
            {quickRef.map((item) => (
              <div key={item.term} className="flex items-start gap-3">
                <span className="text-blue-400 text-xs font-bold font-mono w-12 shrink-0 pt-0.5">{item.term}</span>
                <div>
                  <p className="text-slate-300 text-sm">{item.def}</p>
                  <p className="text-slate-600 text-xs font-mono">{item.formula}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
