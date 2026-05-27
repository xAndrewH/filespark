"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

const EXAMPLE = `const express=require('express');const app=express();app.use(express.json());app.get('/api/users',async(req,res)=>{try{const users=await User.find({active:true}).sort({createdAt:-1}).limit(50);res.json({success:true,data:users,count:users.length});}catch(err){res.status(500).json({success:false,message:err.message});}});app.listen(3000,()=>console.log('Server running'));`;

async function beautifyJS(code: string): Promise<string> {
  const jsBeautify = await import("js-beautify");
  return jsBeautify.js(code, {
    indent_size: 2,
    end_with_newline: true,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    space_before_conditional: true,
    jslint_happy: false,
    keep_array_indentation: false,
    brace_style: "collapse",
    space_in_paren: false,
    space_in_empty_paren: false,
    unescape_strings: false,
    wrap_line_length: 0,
    e4x: false,
    comma_first: false,
  });
}

export default function JSBeautifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const beautify = useCallback(async (src?: string) => {
    const code = src ?? input;
    if (!code.trim()) return;
    setLoading(true);
    try {
      setOutput(await beautifyJS(code));
    } catch {
      setOutput("Error formatting JavaScript.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "formatted.js";
    a.click();
  }, [output]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => { setInput(e.target?.result as string); setOutput(""); };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">JavaScript Beautifier</h1>
        <p className="text-slate-500 text-sm mb-8">Format and indent JavaScript following Airbnb / ESLint standards.</p>

        <div className="flex justify-end gap-2 mb-3">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" /></svg>
            Upload .js / .ts
          </button>
          <input ref={fileRef} type="file" accept=".js,.ts,.jsx,.tsx,.mjs,.cjs" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (f) handleFile(f); }} />
          <button onClick={() => { setInput(EXAMPLE); setOutput(""); }} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 transition-colors">
            Load example
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 text-xs">Input</label>
              {input && <button onClick={() => { setInput(""); setOutput(""); }} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Clear</button>}
            </div>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setOutput(""); }}
              placeholder="Paste your JavaScript or TypeScript here, or upload a file…"
              spellCheck={false}
              className="w-full h-[520px] bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 text-xs">Output</label>
              <div className="flex gap-2">
                {output && (
                  <>
                    <button onClick={copy} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">{copied ? "Copied!" : "Copy"}</button>
                    <button onClick={download} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">Download</button>
                  </>
                )}
              </div>
            </div>
            <pre className="w-full h-[520px] bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed overflow-auto whitespace-pre">
              {output || <span className="text-slate-600">Formatted JavaScript will appear here…</span>}
            </pre>
          </div>
        </div>

        <button onClick={() => beautify()} disabled={loading || !input.trim()}
          className="w-full mt-4 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-yellow-500/20">
          {loading ? "Formatting…" : "Beautify JavaScript"}
        </button>
      </div>
    </div>
  );
}
