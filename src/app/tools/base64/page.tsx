"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

type Mode = "encode" | "decode";

function toBase64(bytes: Uint8Array, urlSafe: boolean, wrap: boolean): string {
  let binary = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK)
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  if (wrap) b64 = b64.match(/.{1,76}/g)?.join("\n") ?? b64;
  return b64;
}

function fromBase64(input: string, urlSafe: boolean): Uint8Array {
  let clean = input.replace(/\s/g, "");
  if (urlSafe) clean = clean.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (clean.length % 4)) % 4;
  const padded = clean + "=".repeat(pad);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export default function Base64Page() {
  const [input, setInput]     = useState("");
  const [output, setOutput]   = useState("");
  const [mode, setMode]       = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [wrap, setWrap]       = useState(false);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = useCallback((value: string, m: Mode, us: boolean, wr: boolean) => {
    setError("");
    if (!value) { setOutput(""); return; }
    try {
      if (m === "encode") {
        setOutput(toBase64(new TextEncoder().encode(value), us, wr));
      } else {
        setOutput(new TextDecoder().decode(fromBase64(value, us)));
      }
    } catch {
      setOutput("");
      setError(m === "decode" ? "Invalid Base64 string." : "Could not encode input.");
    }
  }, []);

  const handleInput = (v: string) => {
    setInput(v); setFileName(null); run(v, mode, urlSafe, wrap);
  };

  const switchMode = (m: Mode) => {
    setMode(m); setInput(output); run(output, m, urlSafe, wrap);
  };

  const toggle = (key: "urlSafe" | "wrap") => {
    const us = key === "urlSafe" ? !urlSafe : urlSafe;
    const wr = key === "wrap"    ? !wrap    : wrap;
    if (key === "urlSafe") setUrlSafe(us); else setWrap(wr);
    run(input, mode, us, wr);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      const b64 = toBase64(bytes, urlSafe, wrap);
      setMode("encode"); setFileName(file.name); setInput(""); setOutput(b64); setError("");
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const inputBytes = mode === "encode" && input ? new TextEncoder().encode(input).length : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Base64 Encoder / Decoder</h1>
        <p className="text-slate-500 text-sm mb-8">Encode text or files to Base64, or decode Base64 back to text.</p>

        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
              {(["encode", "decode"] as const).map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={() => toggle("urlSafe")}
              title="Replaces + with - and / with _ (no padding). Used in JWTs and URL-safe contexts."
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${urlSafe ? "bg-violet-600/20 border-violet-500/50 text-violet-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"}`}>
              URL-safe
            </button>
            {mode === "encode" && (
              <button onClick={() => toggle("wrap")}
                title="Wraps output at 76 characters (MIME / PEM format)."
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${wrap ? "bg-violet-600/20 border-violet-500/50 text-violet-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"}`}>
                MIME wrap
              </button>
            )}
            {mode === "encode" && (
              <>
                <button onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white transition-colors">
                  Encode file…
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              </>
            )}
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">
                {fileName ? `File: ${fileName}` : mode === "encode" ? "Plain text" : "Base64 string"}
              </label>
              <div className="flex items-center gap-3">
                {inputBytes !== null && <span className="text-slate-600 text-xs">{inputBytes} bytes</span>}
                {(input || fileName) && (
                  <button onClick={() => { setInput(""); setOutput(""); setError(""); setFileName(null); }}
                    className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Clear</button>
                )}
              </div>
            </div>
            {fileName ? (
              <div className="w-full h-16 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-slate-300 text-sm truncate">{fileName}</span>
              </div>
            ) : (
              <textarea value={input} onChange={e => handleInput(e.target.value)}
                placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
                className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Output */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">{mode === "encode" ? "Base64 output" : "Decoded text"}</label>
              {output && <span className="text-slate-600 text-xs">{output.replace(/\n/g, "").length} chars</span>}
            </div>
            <textarea readOnly value={output} placeholder="Output will appear here…"
              className="w-full h-40 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none placeholder-slate-600" />
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
