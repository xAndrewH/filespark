"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { md5 } from "js-md5";

type OutputFormat = "hex" | "HEX" | "base64";
type Algo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGOS: Algo[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function computeHash(data: Uint8Array, algo: Algo, fmt: OutputFormat): Promise<string> {
  if (algo === "MD5") {
    if (fmt === "base64") return md5.base64(data);
    const h = md5.hex(data);
    return fmt === "HEX" ? h.toUpperCase() : h;
  }
  const buf = await crypto.subtle.digest(algo, data.buffer as ArrayBuffer);
  const bytes = new Uint8Array(buf);
  if (fmt === "base64") {
    let bin = "";
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }
  const h = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  return fmt === "HEX" ? h.toUpperCase() : h;
}

export default function HashPage() {
  const [input, setInput]       = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [hashes, setHashes]     = useState<Partial<Record<Algo, string>>>({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState<string | null>(null);
  const [fmt, setFmt]           = useState<OutputFormat>("hex");
  const genId   = useRef(0);
  const lastData = useRef<Uint8Array | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const compute = useCallback(async (data: Uint8Array, id: number, format: OutputFormat) => {
    setLoading(true); setError("");
    try {
      const results: Partial<Record<Algo, string>> = {};
      await Promise.all(ALGOS.map(async algo => { results[algo] = await computeHash(data, algo, format); }));
      if (id !== genId.current) return;
      setHashes(results);
    } catch (e) {
      if (id !== genId.current) return;
      setError((e as Error).message); setHashes({});
    } finally {
      if (id === genId.current) setLoading(false);
    }
  }, []);

  const handleInput = (v: string) => {
    setInput(v); setFileName(null);
    if (!v) { setHashes({}); setLoading(false); lastData.current = null; return; }
    const data = new TextEncoder().encode(v);
    lastData.current = data;
    const id = ++genId.current;
    compute(data, id, fmt);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name); setInput("");
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      lastData.current = data;
      const id = ++genId.current;
      compute(data, id, fmt);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const changeFmt = (f: OutputFormat) => {
    setFmt(f);
    if (!lastData.current) return;
    const id = ++genId.current;
    compute(lastData.current, id, f);
  };

  const copy = async (hash: string, key: string) => {
    try { await navigator.clipboard.writeText(hash); } catch { return; }
    setCopied(key); setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = async () => {
    const text = ALGOS.filter(a => hashes[a]).map(a => `${a}: ${hashes[a]}`).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied("__all__"); setTimeout(() => setCopied(null), 1500);
  };

  const hasResults = !loading && Object.keys(hashes).length > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Hash Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files.</p>

        <div className="space-y-5">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 text-xs">{fileName ? `File: ${fileName}` : "Input text"}</label>
              <div className="flex items-center gap-3">
                <button onClick={() => fileRef.current?.click()}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Hash a file…</button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
                {(input || fileName) && (
                  <button onClick={() => { setInput(""); setFileName(null); setHashes({}); setError(""); lastData.current = null; }}
                    className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Clear</button>
                )}
              </div>
            </div>
            {fileName ? (
              <div className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-slate-300 text-sm truncate">{fileName}</span>
              </div>
            ) : (
              <textarea value={input} onChange={e => handleInput(e.target.value)}
                placeholder="Enter text to hash…"
                className="w-full h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
            )}
          </div>

          {/* Format */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs">Output:</span>
            {([
              { id: "hex"    as OutputFormat, label: "Hex (lowercase)" },
              { id: "HEX"    as OutputFormat, label: "Hex (uppercase)" },
              { id: "base64" as OutputFormat, label: "Base64" },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => changeFmt(id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${fmt === id ? "bg-blue-600/20 border-blue-500/50 text-blue-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>

          {loading && <p className="text-slate-500 text-sm">Computing hashes…</p>}
          {error   && <p className="text-red-400 text-sm">{error}</p>}

          {hasResults && (
            <>
              <div className="space-y-2">
                {ALGOS.map(algo => {
                  const hash = hashes[algo]; if (!hash) return null;
                  return (
                    <div key={algo} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 text-xs font-mono font-bold">{algo}</span>
                        <button onClick={() => copy(hash, algo)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                          {copied === algo ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <code className="text-slate-300 text-xs font-mono break-all leading-relaxed">{hash}</code>
                    </div>
                  );
                })}
              </div>
              <button onClick={copyAll}
                className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                {copied === "__all__" ? "Copied all!" : "Copy all hashes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
