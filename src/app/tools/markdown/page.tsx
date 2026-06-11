"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

const STORAGE_KEY = "filespark:markdown:input";

const SAMPLE_MARKDOWN = `# Project Notes

A quick example of **markdown** in action.

- Write in plain text
- See the [preview](https://example.com) update live
- Use \`inline code\` anywhere

\`\`\`js
const greet = (name) => "Hello, " + name + "!";
\`\`\`
`;

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
  const [view, setView] = useState<"split" | "preview" | "editor">("split");
  const [showExport, setShowExport] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the last edited document on return visits.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setMarkdown(saved);
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (markdown.length <= 100_000) window.localStorage.setItem(STORAGE_KEY, markdown);
      } catch { /* storage unavailable */ }
    }, 500);
    return () => clearTimeout(id);
  }, [markdown]);

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

  const exportHtml = () => {
    const styles = document.querySelector("style[data-md]")?.textContent ?? "";
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Document</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; background: #fff; color: #1e293b; line-height: 1.6; }
${styles
  .replace(/\.md-preview /g, "")
  .replace(/#fff/g, "#1e293b")
  .replace(/color: #cbd5e1/g, "color: #334155")
  .replace(/color: #e2e8f0/g, "color: #1e293b")
  .replace(/color: #fff/g, "color: #0f172a")
  .replace(/background: #0f172a/g, "background: #f8fafc")
  .replace(/background: #1e293b/g, "background: #f1f5f9")
  .replace(/border: 1px solid #334155/g, "border: 1px solid #cbd5e1")
  .replace(/color: #94a3b8/g, "color: #64748b")
  .replace(/border-left: 3px solid #475569/g, "border-left: 3px solid #94a3b8")}
</style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(a.href);
    setShowExport(false);
  };

  const exportPdf = () => {
    const styles = document.querySelector("style[data-md]")?.textContent ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Document</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; background: #fff; color: #1e293b; line-height: 1.6; }
${styles.replace(/\.md-preview /g, "")}
@media print { body { margin: 0; max-width: 100%; } }
</style>
</head>
<body>${renderedHtml}</body>
</html>`);
    win.document.close();
    win.onload = () => { win.print(); };
    setShowExport(false);
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
          <button onClick={() => setMarkdown(SAMPLE_MARKDOWN)}
            className="ml-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
            Try an example
          </button>
          <CopyButton text={() => renderedHtml} label="Copy HTML" className="ml-1" />
          <div className="relative ml-1">
            <button onClick={() => setShowExport(o => !o)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-1">
              Export
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-slate-900 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden w-40">
                  <button onClick={exportHtml}
                    className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-800 text-xs transition-colors">
                    Export as HTML
                  </button>
                  <button onClick={exportPdf}
                    className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-800 text-xs transition-colors border-t border-slate-800/60">
                    Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Panes */}
      <div className={`flex-1 grid ${view === "split" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-slate-800/60 min-h-0`}
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
            <style data-md>{`
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
