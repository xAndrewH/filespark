"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Lang = "html" | "javascript" | "python";

const EXAMPLES: Record<Lang, string> = {
  html: `<!DOCTYPE html><html><head><title>Hello</title></head><body><div class="container"><h1>Hello World</h1><p>This is a paragraph.</p></div></body></html>`,
  javascript: `function greet(name){if(!name){return 'Hello stranger'}const msg='Hello '+name;console.log(msg);return msg;}const arr=[1,2,3,4,5];const doubled=arr.map(x=>x*2);`,
  python: `def greet(name):\n  if not name:\n   return 'Hello stranger'\n  msg='Hello '+name\n  print(msg)\n  return msg\n\nresult=greet('world')\nprint(result)`,
};

async function beautifyHtmlJs(code: string, lang: "html" | "javascript"): Promise<string> {
  const jsBeautify = await import("js-beautify");
  const opts = { indent_size: 2, end_with_newline: true, preserve_newlines: true };
  return lang === "html" ? jsBeautify.html(code, opts) : jsBeautify.js(code, opts);
}

function beautifyPython(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let indentLevel = 0;
  const indentSize = 4;

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) { result.push(""); continue; }

    const dedentKeywords = /^(else:|elif |except:|except |finally:|)/.test(line);
    if (dedentKeywords && indentLevel > 0) indentLevel--;

    result.push(" ".repeat(indentLevel * indentSize) + line);

    if (/:\s*$/.test(line) && !/^#/.test(line)) {
      indentLevel++;
    }
  }
  return result.join("\n");
}

export default function CodeBeautifierPage() {
  const [lang, setLang] = useState<Lang>("html");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const beautify = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      let result: string;
      if (lang === "python") {
        result = beautifyPython(input);
      } else {
        result = await beautifyHtmlJs(input, lang);
      }
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

  const loadExample = () => {
    setInput(EXAMPLES[lang]);
    setOutput("");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Code Beautifier</h1>
        <p className="text-slate-500 text-sm mb-8">Format and prettify HTML, JavaScript, and Python code.</p>

        <div className="space-y-4">
          {/* Language tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
              {(["html", "javascript", "python"] as Lang[]).map(l => (
                <button key={l} onClick={() => { setLang(l); setInput(""); setOutput(""); }}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${lang === l ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={loadExample} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Load example
            </button>
          </div>

          {/* Input / Output side by side on wider screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-slate-400 text-xs block">Input</label>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
                <textarea
                  value={input}
                  onChange={e => { setInput(e.target.value); setOutput(""); }}
                  placeholder={`Paste your ${lang.toUpperCase()} code here…`}
                  rows={16}
                  className="w-full bg-transparent px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs block">Output</label>
                {output && (
                  <button onClick={copy}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden h-[calc(16*1.5rem+2rem)]">
                <pre className="w-full h-full px-4 py-4 text-slate-200 text-xs font-mono leading-relaxed overflow-auto whitespace-pre">
                  {output || <span className="text-slate-600">Formatted code will appear here…</span>}
                </pre>
              </div>
            </div>
          </div>

          <button onClick={beautify} disabled={loading || !input.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
            {loading ? "Formatting…" : `Beautify ${lang.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
