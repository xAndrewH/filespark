"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check, X } from "lucide-react";

function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes);

    const inner = () => children.map(processNode).join("");

    if (tag === "pre") {
      const codeEl = el.querySelector("code");
      const lang = codeEl?.className.replace(/.*language-(\w+).*/, "$1") ?? "";
      const content = (codeEl ? codeEl.textContent : el.textContent) ?? "";
      return `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }

    switch (tag) {
      case "h1": return `# ${inner().trim()}\n\n`;
      case "h2": return `## ${inner().trim()}\n\n`;
      case "h3": return `### ${inner().trim()}\n\n`;
      case "h4": return `#### ${inner().trim()}\n\n`;
      case "h5": return `##### ${inner().trim()}\n\n`;
      case "h6": return `###### ${inner().trim()}\n\n`;
      case "p": return `${inner().trim()}\n\n`;
      case "strong":
      case "b": return `**${inner()}**`;
      case "em":
      case "i": return `*${inner()}*`;
      case "code": return `\`${inner()}\``;
      case "a": {
        const href = el.getAttribute("href") ?? "";
        return `[${inner()}](${href})`;
      }
      case "img": {
        const src = el.getAttribute("src") ?? "";
        const alt = el.getAttribute("alt") ?? "";
        return `![${alt}](${src})`;
      }
      case "ul": {
        const items = Array.from(el.children)
          .filter(c => c.tagName.toLowerCase() === "li")
          .map(li => `- ${li.textContent?.trim() ?? ""}`)
          .join("\n");
        return `${items}\n\n`;
      }
      case "ol": {
        const items = Array.from(el.children)
          .filter(c => c.tagName.toLowerCase() === "li")
          .map((li, i) => `${i + 1}. ${li.textContent?.trim() ?? ""}`)
          .join("\n");
        return `${items}\n\n`;
      }
      case "li": return "";
      case "blockquote": {
        const lines = inner().trim().split("\n").map(l => `> ${l}`).join("\n");
        return `${lines}\n\n`;
      }
      case "hr": return `---\n\n`;
      case "br": return "\n";
      case "html":
      case "head":
      case "body":
      case "div":
      case "span":
      case "section":
      case "article":
      case "main":
      case "header":
      case "footer":
      case "nav":
      case "aside":
        return inner();
      default:
        return inner();
    }
  }

  let result = processNode(doc.body);

  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.trim();

  return result;
}

export default function HtmlToMarkdownPage() {
  const [inputHtml, setInputHtml] = useState("");
  const [outputMd, setOutputMd] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOutputMd(htmlToMarkdown(inputHtml));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputHtml]);

  const convert = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setOutputMd(htmlToMarkdown(inputHtml));
  };

  const copy = async () => {
    if (!outputMd) return;
    try { await navigator.clipboard.writeText(outputMd); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setInputHtml("");
    setOutputMd("");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">HTML to Markdown</h1>
        <p className="text-slate-500 text-sm mb-8">Convert HTML markup to clean Markdown syntax.</p>

        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">HTML Input</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={convert}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Convert
                </button>
                {inputHtml && (
                  <button
                    onClick={clear}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={inputHtml}
              onChange={e => setInputHtml(e.target.value)}
              placeholder="<h1>Hello World</h1><p>Paste your <strong>HTML</strong> here…</p>"
              rows={12}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Markdown Output</p>
              {outputMd && (
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700/60"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={outputMd}
              placeholder="Markdown will appear here…"
              rows={12}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
