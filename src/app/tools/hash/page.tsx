"use client";

import { useState } from "react";
import Link from "next/link";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = typeof ALGOS[number];

async function hashText(text: string, algo: Algo): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function HashPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Partial<Record<Algo, string>>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async (text: string) => {
    if (!text) { setHashes({}); return; }
    setLoading(true);
    const results: Partial<Record<Algo, string>> = {};
    await Promise.all(ALGOS.map(async (algo) => {
      results[algo] = await hashText(text, algo);
    }));
    setHashes(results);
    setLoading(false);
  };

  const copy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleInput = (v: string) => {
    setInput(v);
    generate(v);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Hash Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser.</p>

        <div className="space-y-5">
          <textarea
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder="Enter text to hash…"
            className="w-full h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
          />

          {loading && (
            <div className="text-slate-500 text-sm">Computing hashes…</div>
          )}

          {!loading && Object.keys(hashes).length > 0 && (
            <div className="space-y-2">
              {ALGOS.map(algo => {
                const hash = hashes[algo];
                if (!hash) return null;
                return (
                  <div key={algo} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 text-xs font-mono font-bold">{algo}</span>
                      <button onClick={() => copy(hash)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                        {copied === hash ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <code className="text-slate-300 text-xs font-mono break-all leading-relaxed">{hash}</code>
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
