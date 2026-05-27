"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

const EXAMPLE = `import os,json\nfrom datetime import datetime\nclass UserManager:\ndef __init__(self,db_path):\nself.db_path=db_path\nself.users=[]\ndef load_users(self):\nif os.path.exists(self.db_path):\nwith open(self.db_path,'r') as f:\nself.users=json.load(f)\nreturn self.users\ndef add_user(self,name,email):\nuser={'id':len(self.users)+1,'name':name,'email':email,'created':datetime.now().isoformat()}\nself.users.append(user)\nself._save()\nreturn user\ndef _save(self):\nwith open(self.db_path,'w') as f:\njson.dump(self.users,f,indent=2)\ndef get_active_users(self):\nreturn[u for u in self.users if u.get('active',True)]`;

function beautifyPython(code: string): string {
  const lines = code.split("\n").map(l => l.trimEnd());
  const result: string[] = [];
  let indentLevel = 0;
  const indentSize = 4;
  const DEDENT_RE = /^(else|elif |except|except:|finally)[\s:]/;
  const INDENT_RE = /:\s*(#.*)?$/;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { result.push(""); continue; }
    if (DEDENT_RE.test(line) && indentLevel > 0) indentLevel--;
    result.push(" ".repeat(indentLevel * indentSize) + line);
    if (INDENT_RE.test(line) && !line.startsWith("#")) indentLevel++;
  }

  const final: string[] = [];
  for (let i = 0; i < result.length; i++) {
    final.push(result[i]);
    if (/^(def |class )/.test(result[i + 1] ?? "") && result[i].trim() !== "") {
      final.push("", "");
    }
  }
  return final.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export default function PythonBeautifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const beautify = useCallback((src?: string) => {
    const code = src ?? input;
    if (!code.trim()) return;
    try {
      setOutput(beautifyPython(code));
    } catch {
      setOutput("Error formatting Python.");
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
    a.download = "formatted.py";
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
        <h1 className="text-3xl font-bold text-white mb-1">Python Beautifier</h1>
        <p className="text-slate-500 text-sm mb-8">Format Python code with PEP 8 compliant 4-space indentation.</p>

        <div className="flex justify-end gap-2 mb-3">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" /></svg>
            Upload .py
          </button>
          <input ref={fileRef} type="file" accept=".py,.pyw" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (f) handleFile(f); }} />
          <button onClick={() => { setInput(EXAMPLE.replace(/\\n/g, "\n")); setOutput(""); }} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 transition-colors">
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
              placeholder="Paste your Python code here, or upload a file…"
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
              {output || <span className="text-slate-600">Formatted Python will appear here…</span>}
            </pre>
          </div>
        </div>

        <button onClick={() => beautify()} disabled={!input.trim()}
          className="w-full mt-4 py-3 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20">
          Beautify Python
        </button>
      </div>
    </div>
  );
}
