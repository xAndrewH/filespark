"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "encode" | "decode";
type Variant = "component" | "full" | "form";

const VARIANTS: { id: Variant; label: string; desc: string }[] = [
  { id: "component", label: "encodeURIComponent", desc: "Encodes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( )  — use for query-string values" },
  { id: "full",      label: "encodeURI",          desc: "Preserves URL structure chars like : / ? # & = @ — use for full URLs" },
  { id: "form",      label: "Form-encoded",       desc: "Spaces become +, rest is percent-encoded — used by HTML forms (application/x-www-form-urlencoded)" },
];

function encode(input: string, variant: Variant): string {
  if (variant === "component") return encodeURIComponent(input);
  if (variant === "full") return encodeURI(input);
  // form: space → +, everything else via encodeURIComponent except unreserved chars
  return Array.from(input).map(c =>
    c === " " ? "+" : /[A-Za-z0-9\-_.!~*'()]/.test(c) ? c : encodeURIComponent(c)
  ).join("");
}

function decode(input: string, variant: Variant): string {
  if (variant === "form") return decodeURIComponent(input.replace(/\+/g, " "));
  return decodeURIComponent(input);
}

export default function UrlEncodePage() {
  const [input, setInput]     = useState("");
  const [output, setOutput]   = useState("");
  const [mode, setMode]       = useState<Mode>("encode");
  const [variant, setVariant] = useState<Variant>("component");
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);

  const run = (value: string, m: Mode, v: Variant) => {
    setError("");
    if (!value) { setOutput(""); return; }
    try {
      setOutput(m === "encode" ? encode(value, v) : decode(value, v));
    } catch {
      setOutput("");
      setError(m === "decode" ? "Invalid percent-encoded string." : "Could not encode input.");
    }
  };

  const handleInput = (val: string) => { setInput(val); run(val, mode, variant); };

  const switchMode = (m: Mode) => {
    setMode(m); setInput(output); run(output, m, variant);
  };

  const changeVariant = (v: Variant) => { setVariant(v); run(input, mode, v); };

  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const doubleEncoded = mode === "encode" && /%25[0-9A-Fa-f]{2}/.test(output);
  const plusInDecode  = mode === "decode" && variant !== "form" && input.includes("+");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">URL Encoder / Decoder</h1>
        <p className="text-slate-500 text-sm mb-8">Percent-encode or decode URLs and query strings.</p>

        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
            {(["encode", "decode"] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>

          {/* Variant */}
          <div>
            <label className="text-slate-400 text-xs block mb-2">Encoding method</label>
            <div className="space-y-1.5">
              {VARIANTS.map(({ id, label, desc }) => (
                <label key={id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${variant === id ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800/60 bg-slate-900/40 hover:border-slate-700"}`}>
                  <input type="radio" name="variant" value={id} checked={variant === id}
                    onChange={() => changeVariant(id)} className="mt-0.5 accent-blue-500 shrink-0" />
                  <div>
                    <p className="text-white text-xs font-mono font-medium">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">{mode === "encode" ? "Plain text / URL" : "Encoded string"}</label>
              {input && (
                <button onClick={() => { setInput(""); setOutput(""); setError(""); }}
                  className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Clear</button>
              )}
            </div>
            <textarea value={input} onChange={e => handleInput(e.target.value)}
              placeholder={mode === "encode" ? "https://example.com/search?q=hello world&lang=en" : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello+world"}
              className="w-full h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {doubleEncoded && (
            <div className="flex gap-2 text-amber-400 text-xs bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
              <span className="shrink-0">⚠</span>
              <span>Output contains <code className="font-mono">%25</code> — the input may already be encoded. Encoding it again causes double-encoding.</span>
            </div>
          )}
          {plusInDecode && (
            <div className="flex gap-2 text-amber-400 text-xs bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
              <span className="shrink-0">ℹ</span>
              <span>Input contains <code className="font-mono">+</code> signs. If they represent spaces (HTML form data), switch to <strong>Form-encoded</strong> to decode them correctly.</span>
            </div>
          )}

          {/* Output */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">{mode === "encode" ? "Encoded output" : "Decoded text"}</label>
              {output && <span className="text-slate-600 text-xs">{output.length} chars</span>}
            </div>
            <textarea readOnly value={output} placeholder="Output will appear here…"
              className="w-full h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none placeholder-slate-600" />
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
