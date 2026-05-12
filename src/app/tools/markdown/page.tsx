"use client";

import { useState, useMemo } from "react";
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

  const html = useMemo(async () => "", []);
  void html;

  const [renderedHtml, setRenderedHtml] = useState("");

  useMemo(() => {
    import("marked").then(({ marked }) => {
      const result = marked(markdown);
      if (typeof result === "string") setRenderedHtml(result);
      else result.then(setRenderedHtml);
    });
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(renderedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800/60 px-4 py-3 flex items-center gap-4">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <span className="text-white font-semibold">Markdown Editor</span>
        <div className="flex gap-1 ml-auto">
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
            <div className="px-4 py-2 border-b border-slate-800/40">
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
            <div
              className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white
                prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700
                prose-blockquote:border-slate-600 prose-blockquote:text-slate-400
                prose-a:text-blue-400 prose-th:text-white prose-td:text-slate-300
                prose-hr:border-slate-700 prose-li:text-slate-300"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
