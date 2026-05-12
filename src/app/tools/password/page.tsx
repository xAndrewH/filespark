"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generate(length: number, opts: Record<string, boolean>): string {
  let pool = "";
  if (opts.upper)   pool += CHARS.upper;
  if (opts.lower)   pool += CHARS.lower;
  if (opts.numbers) pool += CHARS.numbers;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((n) => pool[n % pool.length]).join("");
}

function strength(pw: string) {
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const types = checks.filter((r) => r.test(pw)).length;
  const score = (pw.length >= 16 ? 2 : pw.length >= 10 ? 1 : 0) + (types >= 3 ? 2 : types >= 2 ? 1 : 0);
  const levels = [
    { label: "Very Weak",  color: "bg-red-500",    w: "w-1/5"  },
    { label: "Weak",       color: "bg-orange-500", w: "w-2/5"  },
    { label: "Fair",       color: "bg-yellow-500", w: "w-3/5"  },
    { label: "Strong",     color: "bg-blue-500",   w: "w-4/5"  },
    { label: "Very Strong",color: "bg-green-500",  w: "w-full" },
  ];
  return levels[Math.min(score, 4)];
}

export default function PasswordPage() {
  const [length, setLength]   = useState(16);
  const [opts, setOpts]       = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const [count, setCount]     = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied]   = useState<string | null>(null);

  const generateAll = useCallback(() => {
    setPasswords(Array.from({ length: count }, () => generate(length, opts)));
  }, [length, opts, count]);

  const copy = (pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopied(pw);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggle = (key: string) => setOpts((o) => ({ ...o, [key]: !o[key as keyof typeof o] }));

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Password Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Cryptographically secure passwords generated in your browser.</p>

        <div className="space-y-5">
          {/* Length */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white text-sm font-medium">Length</label>
              <span className="text-blue-400 font-mono text-sm font-bold">{length}</span>
            </div>
            <input type="range" min={4} max={128} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-slate-600 text-xs mt-1"><span>4</span><span>128</span></div>
          </div>

          {/* Options */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-3">Character types</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "upper",   label: "Uppercase",  ex: "A–Z"    },
                { key: "lower",   label: "Lowercase",  ex: "a–z"    },
                { key: "numbers", label: "Numbers",    ex: "0–9"    },
                { key: "symbols", label: "Symbols",    ex: "!@#$%"  },
              ].map(({ key, label, ex }) => (
                <button key={key} onClick={() => toggle(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    opts[key as keyof typeof opts]
                      ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white"
                  }`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${opts[key as keyof typeof opts] ? "bg-blue-500" : "bg-slate-700"}`}>
                    {opts[key as keyof typeof opts] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <span>{label}</span>
                  <span className="text-xs opacity-50 ml-auto font-mono">{ex}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Count + Generate */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2">
              <span className="text-slate-400 text-sm">Generate</span>
              <select value={count} onChange={(e) => setCount(+e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none">
                {[1,5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-slate-400 text-sm">passwords</span>
            </div>
            <button onClick={generateAll}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Generate
            </button>
          </div>

          {/* Results */}
          {passwords.length > 0 && (
            <div className="space-y-2">
              {passwords.map((pw, i) => {
                const s = strength(pw);
                return (
                  <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <code className="flex-1 text-white text-sm font-mono break-all">{pw}</code>
                      <button onClick={() => copy(pw)}
                        className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                        {copied === pw ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${s.color} ${s.w}`} />
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
