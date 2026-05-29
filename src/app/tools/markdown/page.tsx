"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState(`# Hello, Markdown!

Write your **markdown** here and see the live preview on the right.

## Features

- *Italic* and **bold** text
- [Links](https://example.com)
- \`inline code\`
- > Blockquotes

### Code blocks

\`\`\`javascript
function hello() {
  return "world";
}
\`\`\`

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "preview" | "editor">("split");
  const [renderedHtml, setRenderedHtml] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      import("marked").then(({ marked }) => {
        marked.use({ gfm: true, breaks: false });
        const result = marked.parse(markdown);
        if (typeof result === "string") setRenderedHtml(result);
        else result.then(setRenderedHtml);
      });
    }, 80);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(renderedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800/60 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <span className="text-white font-semibold">Markdown Editor</span>
        <span className="text-slate-600 text-xs ml-1">{wordCount} words · {charCount} chars</span>
        <div className="flex gap-1 ml-auto flex-wrap">
          {([["split", "Split"], ["editor", "Editor"], ["preview", "Preview"]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${view === v ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
          <button onClick={copyHtml}
            className="ml-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
            {copied ? "Copied HTML!" : "Copy HTML"}
          </button>
        </div>
      </div>

      {/* Panes */}
      <div className={`flex-1 grid ${view === "split" ? "grid-cols-2" : "grid-cols-1"} divide-x divide-slate-800/60 min-h-0`}
        style={{ height: "calc(100vh - 57px)" }}>
        {(view === "split" || view === "editor") && (
          <div className="flex flex-col">
            <div className="px-4 py-2 border-b border-slate-800/40 flex items-center gap-2">
              <span className="text-slate-500 text-xs">Markdown</span>
            </div>
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent p-4 text-white text-sm font-mono resize-none focus:outline-none leading-relaxed"
            />
          </div>
        )}
        {(view === "split" || view === "preview") && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800/40">
              <span className="text-slate-500 text-xs">Preview</span>
            </div>
            <style>{`
              .md-preview h1 { font-size: 1.875rem; font-weight: 700; color: #fff; margin: 1.25rem 0 0.75rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
              .md-preview h2 { font-size: 1.5rem; font-weight: 600; color: #fff; margin: 1.25rem 0 0.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.35rem; }
              .md-preview h3 { font-size: 1.25rem; font-weight: 600; color: #e2e8f0; margin: 1rem 0 0.4rem; }
              .md-preview h4 { font-size: 1rem; font-weight: 600; color: #cbd5e1; margin: 0.75rem 0 0.3rem; }
              .md-preview p { color: #cbd5e1; margin: 0.6rem 0; line-height: 1.75; }
              .md-preview ul, .md-preview ol { color: #cbd5e1; margin: 0.5rem 0; padding-left: 1.5rem; }
              .md-preview li { margin: 0.25rem 0; line-height: 1.7; }
              .md-preview ul > li { list-style-type: disc; }
              .md-preview ol > li { list-style-type: decimal; }
              .md-preview a { color: #60a5fa; text-decoration: underline; }
              .md-preview a:hover { color: #93c5fd; }
              .md-preview strong { color: #fff; font-weight: 600; }
              .md-preview em { color: #e2e8f0; font-style: italic; }
              .md-preview code { color: #93c5fd; background: #1e293b; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; font-family: 'Fira Code', 'Cascadia Code', monospace; }
              .md-preview pre { background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; margin: 0.75rem 0; }
              .md-preview pre code { background: transparent; padding: 0; color: #e2e8f0; font-size: 0.875rem; line-height: 1.6; }
              .md-preview blockquote { border-left: 3px solid #475569; padding-left: 1rem; margin: 0.75rem 0; color: #94a3b8; font-style: italic; }
              .md-preview blockquote p { color: inherit; margin: 0; }
              .md-preview hr { border: none; border-top: 1px solid #334155; margin: 1.25rem 0; }
              .md-preview table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.875rem; }
              .md-preview th { background: #1e293b; color: #e2e8f0; font-weight: 600; text-align: left; padding: 0.5rem 0.75rem; border: 1px solid #334155; }
              .md-preview td { color: #cbd5e1; padding: 0.45rem 0.75rem; border: 1px solid #1e293b; }
              .md-preview tr:nth-child(even) td { background: #0f172a55; }
              .md-preview img { max-width: 100%; border-radius: 0.375rem; margin: 0.5rem 0; }
              .md-preview del { color: #94a3b8; text-decoration: line-through; }
              .md-preview input[type="checkbox"] { margin-right: 0.4em; accent-color: #3b82f6; }
            `}</style>
            <div
              className="md-preview flex-1 overflow-y-auto px-6 py-5 text-sm"
              dangerouslySetInnerHTML={{ __html: renderedHtml || "<p style='color:#475569'>Nothing to preview yet…</p>" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
