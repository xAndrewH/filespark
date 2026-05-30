"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "add" | "remove" | "compare";

function fmt(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function NumInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
      <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500">
        {prefix && (
          <span className="px-3 text-slate-500 text-sm select-none">{prefix}</span>
        )}
        <input
          type="number"
          min={0}
          step={step ?? "any"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent py-2 text-white text-sm focus:outline-none min-w-0 px-2"
        />
        {suffix && (
          <span className="px-3 text-slate-500 text-sm select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function SalesTaxPage() {
  const [tab, setTab] = useState<Tab>("add");

  const [addPrice, setAddPrice] = useState("100");
  const [addRate, setAddRate] = useState("8");

  const [removePrice, setRemovePrice] = useState("108");
  const [removeRate, setRemoveRate] = useState("8");

  const [comparePrice, setComparePrice] = useState("100");
  const [compareRates, setCompareRates] = useState(["5", "8", "10", "15"]);

  const addPriceNum = parseFloat(addPrice) || 0;
  const addRateNum = parseFloat(addRate) || 0;
  const addTax = addPriceNum * (addRateNum / 100);
  const addTotal = addPriceNum + addTax;

  const removePriceNum = parseFloat(removePrice) || 0;
  const removeRateNum = parseFloat(removeRate) || 0;
  const removeOriginal = removePriceNum / (1 + removeRateNum / 100);
  const removeTax = removePriceNum - removeOriginal;

  const comparePriceNum = parseFloat(comparePrice) || 0;
  const compareRows = compareRates.map((r) => {
    const rate = parseFloat(r) || 0;
    const tax = comparePriceNum * (rate / 100);
    return { rate, tax, total: comparePriceNum + tax };
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">
          Sales Tax Calculator
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Calculate tax amount and total price.
        </p>

        <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 mb-5">
          {(
            [
              ["add", "Add Tax"],
              ["remove", "Remove Tax"],
              ["compare", "Compare Rates"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
                tab === id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "add" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <NumInput
              label="Price (before tax)"
              value={addPrice}
              onChange={setAddPrice}
              prefix="$"
            />
            <NumInput
              label="Tax Rate"
              value={addRate}
              onChange={setAddRate}
              suffix="%"
            />
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Pre-tax</span>
                <span className="text-slate-300 text-sm">{fmt(addPriceNum)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Tax Amount</span>
                <span className="text-amber-400 text-sm font-medium">{fmt(addTax)}</span>
              </div>
              <div className="border-t border-slate-700/60 pt-3 flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">Total Price</span>
                <span className="text-white text-xl font-bold">{fmt(addTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "remove" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <NumInput
              label="Price (includes tax)"
              value={removePrice}
              onChange={setRemovePrice}
              prefix="$"
            />
            <NumInput
              label="Tax Rate"
              value={removeRate}
              onChange={setRemoveRate}
              suffix="%"
            />
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Original Price</span>
                <span className="text-white text-xl font-bold">{fmt(removeOriginal)}</span>
              </div>
              <div className="border-t border-slate-700/60 pt-3 flex justify-between items-center">
                <span className="text-slate-400 text-sm">Tax Amount</span>
                <span className="text-amber-400 text-sm font-medium">{fmt(removeTax)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "compare" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <NumInput
              label="Price (before tax)"
              value={comparePrice}
              onChange={setComparePrice}
              prefix="$"
            />
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">
                Tax Rates to Compare
              </label>
              <div className="grid grid-cols-4 gap-2">
                {compareRates.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500"
                  >
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={r}
                      onChange={(e) => {
                        const next = [...compareRates];
                        next[i] = e.target.value;
                        setCompareRates(next);
                      }}
                      className="flex-1 bg-transparent py-2 text-white text-sm focus:outline-none min-w-0 px-2 text-center"
                    />
                    <span className="pr-2 text-slate-500 text-sm select-none">%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60">
                    <th className="text-left text-slate-400 px-4 py-2.5 font-medium">Rate</th>
                    <th className="text-right text-slate-400 px-4 py-2.5 font-medium">Tax Amount</th>
                    <th className="text-right text-slate-400 px-4 py-2.5 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map(({ rate, tax, total }, i) => (
                    <tr
                      key={i}
                      className={i < compareRows.length - 1 ? "border-b border-slate-700/40" : ""}
                    >
                      <td className="text-slate-300 px-4 py-2.5">{rate}%</td>
                      <td className="text-amber-400 px-4 py-2.5 text-right">{fmt(tax)}</td>
                      <td className="text-slate-300 px-4 py-2.5 text-right font-medium">{fmt(total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
