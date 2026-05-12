"use client";

import { useState } from "react";
import Link from "next/link";

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const process = (value: string, m: "encode" | "decode") => {
    setError("");
    if (!value) { setOutput(""); return; }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(value))));
      } else {
        setOutput(decodeURIComponent(escape(atob(value))));
      }
    } catch {
      setOutput("");
      setError(m === "decode" ? "Invalid Base64 string." : "Could not encode input.");
    }
  };

  const handleInput = (v: string) => {
    setInput(v);
    process(v, mode);
  };

  const switchMode = (m: "encode" | "decode") => {
    setMode(m);
    setInput(output);
    process(output, m);
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Base64 Encoder / Decoder</h1>
        <p className="text-slate-500 text-sm mb-8">Encode text to Base64 or decode Base64 back to text.</p>

        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
            {(["encode", "decode"] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">{mode === "encode" ? "Plain text" : "Base64 string"}</label>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
              className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="relative">
            <label className="text-slate-400 text-xs mb-1.5 block">{mode === "encode" ? "Base64 output" : "Decoded text"}</label>
            <textarea
              readOnly
              value={output}
              placeholder="Output will appear here…"
              className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none placeholder-slate-600"
            />
            {output && (
              <button onClick={copy}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
