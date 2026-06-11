"use client";

import { useState } from "react";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";

/** Round to 4 significant figures, stripping unnecessary trailing zeros. */
function fmt(n: number): string {
  if (!isFinite(n)) return "|";
  const s = parseFloat(n.toPrecision(4));
  return String(s);
}

function parseNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

// ── Mode 1: What is X% of Y? ─────────────────────────────────────────────────
function Mode1() {
  const [pct, setPct] = useState("");
  const [num, setNum] = useState("");

  const x = parseNum(pct);
  const y = parseNum(num);
  const result = x !== null && y !== null ? fmt((x / 100) * y) : "|";

  return (
    <Card title='What is X% of Y?'>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 text-sm">What is</span>
        <Input value={pct} onChange={setPct} placeholder="X" suffix="%" width="w-24" />
        <span className="text-slate-400 text-sm">of</span>
        <Input value={num} onChange={setNum} placeholder="Y" width="w-28" />
        <span className="text-slate-400 text-sm">?</span>
      </div>
      <Result value={result} />
    </Card>
  );
}

// ── Mode 2: X is what % of Y? ────────────────────────────────────────────────
function Mode2() {
  const [val, setVal] = useState("");
  const [total, setTotal] = useState("");

  const x = parseNum(val);
  const y = parseNum(total);
  const result = x !== null && y !== null && y !== 0 ? fmt((x / y) * 100) + "%" : "|";

  return (
    <Card title="X is what % of Y?">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={val} onChange={setVal} placeholder="X" width="w-28" />
        <span className="text-slate-400 text-sm">is what % of</span>
        <Input value={total} onChange={setTotal} placeholder="Y" width="w-28" />
        <span className="text-slate-400 text-sm">?</span>
      </div>
      <Result value={result} />
    </Card>
  );
}

// ── Mode 3: Percentage change from X to Y ────────────────────────────────────
function Mode3() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const x = parseNum(from);
  const y = parseNum(to);

  let result = "|";
  let colorClass = "text-white";
  if (x !== null && y !== null && x !== 0) {
    const change = ((y - x) / Math.abs(x)) * 100;
    const abs = fmt(Math.abs(change));
    if (change > 0) {
      result = `+${abs}% increase`;
      colorClass = "text-green-400";
    } else if (change < 0) {
      result = `−${abs}% decrease`;
      colorClass = "text-red-400";
    } else {
      result = "0% (no change)";
      colorClass = "text-slate-400";
    }
  }

  return (
    <Card title="Percentage change from X to Y">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 text-sm">From</span>
        <Input value={from} onChange={setFrom} placeholder="X (original)" width="w-28" />
        <span className="text-slate-400 text-sm">to</span>
        <Input value={to} onChange={setTo} placeholder="Y (new)" width="w-28" />
      </div>
      <Result value={result} colorClass={colorClass} />
    </Card>
  );
}

// ── Mode 4: X increased/decreased by Y% ──────────────────────────────────────
function Mode4() {
  const [base, setBase] = useState("");
  const [pct, setPct] = useState("");
  const [dir, setDir] = useState<"increase" | "decrease">("increase");

  const x = parseNum(base);
  const y = parseNum(pct);
  let result = "|";
  if (x !== null && y !== null) {
    const newVal = dir === "increase" ? x * (1 + y / 100) : x * (1 - y / 100);
    result = fmt(newVal);
  }

  return (
    <Card title="X increased/decreased by Y%">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={base} onChange={setBase} placeholder="X" width="w-28" />
        <Toggle
          options={[
            { label: "increased", value: "increase" },
            { label: "decreased", value: "decrease" },
          ]}
          value={dir}
          onChange={(v) => setDir(v as "increase" | "decrease")}
        />
        <span className="text-slate-400 text-sm">by</span>
        <Input value={pct} onChange={setPct} placeholder="Y" suffix="%" width="w-24" />
      </div>
      <Result value={result} />
    </Card>
  );
}

// ── Mode 5: X% more/less than Y ──────────────────────────────────────────────
function Mode5() {
  const [pct, setPct] = useState("");
  const [base, setBase] = useState("");
  const [dir, setDir] = useState<"more" | "less">("more");

  const x = parseNum(pct);
  const y = parseNum(base);
  let result = "|";
  if (x !== null && y !== null) {
    const newVal = dir === "more" ? y * (1 + x / 100) : y * (1 - x / 100);
    result = fmt(newVal);
  }

  return (
    <Card title="X% more/less than Y">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={pct} onChange={setPct} placeholder="X" suffix="%" width="w-24" />
        <Toggle
          options={[
            { label: "more", value: "more" },
            { label: "less", value: "less" },
          ]}
          value={dir}
          onChange={(v) => setDir(v as "more" | "less")}
        />
        <span className="text-slate-400 text-sm">than</span>
        <Input value={base} onChange={setBase} placeholder="Y" width="w-28" />
      </div>
      <Result value={result} />
    </Card>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
      <p className="text-white text-sm font-semibold mb-3">{title}</p>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  suffix,
  width = "w-28",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  width?: string;
}) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${width} bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      {suffix && (
        <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Result({
  value,
  colorClass = "text-white",
}: {
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-4 mt-3 text-center">
      <span className={`text-2xl font-bold ${value === "|" ? "text-slate-600" : colorClass}`}>
        {value}
      </span>
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-700/50 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 text-sm transition-colors ${
            value === opt.value
              ? "bg-blue-600 text-white font-medium"
              : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PercentageCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Percentage Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">
          Five ways to work with percentages. Results update as you type.
        </p>

        <div className="flex flex-col gap-4">
          <Mode1 />
          <Mode2 />
          <Mode3 />
          <Mode4 />
          <Mode5 />
        </div>

        <RelatedTools current="/tools/percentage-calculator" />
      </div>
    </div>
  );
}
