"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const BASES = [
  { label: "Binary",      base: 2,  prefix: "0b", placeholder: "1010 1111" },
  { label: "Octal",       base: 8,  prefix: "0o", placeholder: "257"       },
  { label: "Decimal",     base: 10, prefix: "",   placeholder: "255"       },
  { label: "Hexadecimal", base: 16, prefix: "0x", placeholder: "FF"        },
];

export default function BaseConverterPage() {
  const [values, setValues] = useState<Record<number, string>>({ 2: "", 8: "", 10: "", 16: "" });
  const [error, setError] = useState("");

  const handleChange = useCallback((fromBase: number, raw: string) => {
    setError("");
    const clean = raw.replace(/\s/g, "").toUpperCase();
    setValues(v => ({ ...v, [fromBase]: raw }));
    if (!clean) {
      setValues({ 2: "", 8: "", 10: "", 16: "" });
      return;
    }
    const decimal = parseInt(clean, fromBase);
    if (isNaN(decimal) || decimal < 0) {
      setError(`"${clean}" is not a valid base-${fromBase} number`);
      return;
    }
    const next: Record<number, string> = { [fromBase]: raw };
    for (const { base } of BASES) {
      if (base !== fromBase) {
        const converted = decimal.toString(base).toUpperCase();
        next[base] = base === 2
          ? converted.replace(/(.{4})/g, "$1 ").trim()
          : converted;
      }
    }
    setValues(next);
  }, []);

  const [copied, setCopied] = useState<number | null>(null);
  const copy = (base: number) => {
    navigator.clipboard.writeText(values[base].replace(/\s/g, ""));
    setCopied(base);
    setTimeout(() => setCopied(null), 1500);
  };

  const decimalVal = parseInt(values[10] || "0", 10);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Number Base Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert numbers between binary, octal, decimal, and hexadecimal.</p>

        <div className="space-y-4">
          {BASES.map(({ label, base, prefix, placeholder }) => (
            <div key={base} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white text-sm font-medium">{label}</span>
                  <span className="text-slate-600 text-xs ml-2">base {base}</span>
                </div>
                <div className="flex items-center gap-2">
                  {prefix && <code className="text-slate-600 text-xs font-mono">{prefix}</code>}
                  <button onClick={() => copy(base)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                    {copied === base ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
              <input
                value={values[base]}
                onChange={e => handleChange(base, e.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 placeholder-slate-600"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Bit visualizer */}
          {values[2] && !error && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-3">Bit pattern (padded to byte boundary)</p>
              <div className="flex flex-wrap gap-1">
                {values[2].replace(/\s/g, "").padStart(Math.ceil(values[2].replace(/\s/g, "").length / 8) * 8, "0").split("").map((bit, i) => (
                  <div key={i}>
                    {i > 0 && i % 8 === 0 && <span className="w-2 inline-block" />}
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono font-bold ${bit === "1" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>
                      {bit}
                    </span>
                  </div>
                ))}
              </div>
              {!isNaN(decimalVal) && (
                <p className="text-slate-500 text-xs mt-3">{decimalVal.toLocaleString()} decimal · {Math.ceil(values[2].replace(/\s/g, "").length / 8)} byte{Math.ceil(values[2].replace(/\s/g, "").length / 8) !== 1 ? "s" : ""}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
