"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

type Lang = "html" | "javascript" | "css" | "python";

const EXAMPLES: Record<Lang, string> = {
  html: `<!DOCTYPE html><html><head><title>Hello</title><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head><body><div class="container"><header><h1>Hello World</h1></header><main><p>This is a paragraph with <strong>bold</strong> text.</p><ul><li>Item one</li><li>Item two</li><li>Item three</li></ul></main></div><script src="app.js"></script></body></html>`,
  javascript: `const express=require('express');const app=express();app.use(express.json());app.get('/api/users',async(req,res)=>{try{const users=await User.find({active:true}).sort({createdAt:-1}).limit(50);res.json({success:true,data:users,count:users.length});}catch(err){res.status(500).json({success:false,message:err.message});}});app.listen(3000,()=>console.log('Server running'));`,
  css: `.container{max-width:1200px;margin:0 auto;padding:0 1rem}.hero{display:flex;align-items:center;justify-content:space-between;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}.hero h1{font-size:3rem;font-weight:700;color:#fff;line-height:1.2}.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#6366f1;color:#fff;border:none;border-radius:.5rem;cursor:pointer;transition:background .2s}.btn:hover{background:#4f46e5}@media(max-width:768px){.hero{flex-direction:column;padding:2rem 1rem}.hero h1{font-size:2rem}}`,
  python: `import os,json\nfrom datetime import datetime\nclass UserManager:\ndef __init__(self,db_path):\nself.db_path=db_path\nself.users=[]\ndef load_users(self):\nif os.path.exists(self.db_path):\nwith open(self.db_path,'r') as f:\nself.users=json.load(f)\nreturn self.users\ndef add_user(self,name,email):\nuser={'id':len(self.users)+1,'name':name,'email':email,'created':datetime.now().isoformat()}\nself.users.append(user)\nself._save()\nreturn user\ndef _save(self):\nwith open(self.db_path,'w') as f:\njson.dump(self.users,f,indent=2)\ndef get_active_users(self):\nreturn[u for u in self.users if u.get('active',True)]`,
};

async function beautifyCode(code: string, lang: Lang): Promise<string> {
  if (lang === "python") {
    return beautifyPython(code);
  }
  const jsBeautify = await import("js-beautify");
  const baseOpts = {
    indent_size: 2,
    end_with_newline: true,
    preserve_newlines: true,
    max_preserve_newlines: 2,
  };
  if (lang === "html") {
    return jsBeautify.html(code, {
      ...baseOpts,
      indent_inner_html: true,
      wrap_line_length: 100,
      unformatted: ["code", "pre", "em", "strong", "span"],
      content_unformatted: ["pre", "textarea"],
      extra_liners: ["head", "body", "/html"],
    });
  }
  if (lang === "css") {
    return jsBeautify.css(code, {
      ...baseOpts,
      selector_separator_newline: true,
      newline_between_rules: true,
    });
  }
  // javascript
  return jsBeautify.js(code, {
    ...baseOpts,
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

  // Ensure two blank lines between top-level definitions
  const final: string[] = [];
  for (let i = 0; i < result.length; i++) {
    final.push(result[i]);
    if (/^(def |class )/.test(result[i + 1] ?? "") && result[i].trim() !== "") {
      final.push("", "");
    }
  }
  return final.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

const LANG_LABELS: Record<Lang, string> = { html: "HTML", javascript: "JavaScript", css: "CSS", python: "Python" };

export default function CodeBeautifierPage() {
  const [lang, setLang] = useState<Lang>("html");
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
      const result = await beautifyCode(code, lang);
      setOutput(result);
    } catch {
      setOutput("Error beautifying code.");
    } finally {
      setLoading(false);
    }
  }, [input, lang]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const ext = lang === "javascript" ? "js" : lang;
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `formatted.${ext}`;
    a.click();
  }, [output, lang]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setInput(text);
      setOutput("");
      // Auto-detect language from extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "html" || ext === "htm") setLang("html");
      else if (ext === "js" || ext === "ts" || ext === "jsx" || ext === "tsx") setLang("javascript");
      else if (ext === "css" || ext === "scss") setLang("css");
      else if (ext === "py") setLang("python");
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Code Beautifier</h1>
        <p className="text-slate-500 text-sm mb-8">Format HTML, JavaScript, CSS, and Python following language best practices.</p>

        <div className="space-y-4">
          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Language tabs */}
            <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
              {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
                <button key={l} onClick={() => { setLang(l); setInput(""); setOutput(""); }}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${lang === l ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {/* Upload file */}
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" />
                </svg>
                Upload file
              </button>
              <input ref={fileRef} type="file"
                accept=".html,.htm,.js,.ts,.jsx,.tsx,.css,.scss,.py"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (f) handleFile(f); }} />
              <button onClick={() => { setInput(EXAMPLES[lang]); setOutput(""); }}
                className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 transition-colors">
                Load example
              </button>
            </div>
          </div>

          {/* Input / Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs">Input</label>
                {input && <button onClick={() => { setInput(""); setOutput(""); }} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">Clear</button>}
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
                <textarea
                  value={input}
                  onChange={e => { setInput(e.target.value); setOutput(""); }}
                  placeholder={`Paste your ${LANG_LABELS[lang]} code here, or upload a file…`}
                  rows={20}
                  className="w-full bg-transparent px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs">Output</label>
                <div className="flex gap-2">
                  {output && (
                    <>
                      <button onClick={copy}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button onClick={downloadOutput}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div
                className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                <pre className="w-full h-[calc(20*1.5rem+2rem)] px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed overflow-auto whitespace-pre">
                  {output || <span className="text-slate-600">Formatted code will appear here…</span>}
                </pre>
              </div>
            </div>
          </div>

          <button onClick={() => beautify()} disabled={loading || !input.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
            {loading ? "Formatting…" : `Beautify ${LANG_LABELS[lang]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
