"use client";

import { useState } from "react";
import Link from "next/link";

interface Fields {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  type: string;
  twitterCard: string;
  twitterHandle: string;
}

const EMPTY: Fields = {
  title: "",
  description: "",
  url: "",
  image: "",
  siteName: "",
  type: "website",
  twitterCard: "summary_large_image",
  twitterHandle: "",
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "example.com";
  }
}

function generateMetaTags(f: Fields): string {
  const lines: string[] = [];

  lines.push("<!-- Primary Meta Tags -->");
  if (f.title) lines.push(`<meta name="title" content="${f.title}" />`);
  if (f.description) lines.push(`<meta name="description" content="${f.description}" />`);

  lines.push("");
  lines.push("<!-- Open Graph / Facebook -->");
  lines.push(`<meta property="og:type" content="${f.type}" />`);
  if (f.url) lines.push(`<meta property="og:url" content="${f.url}" />`);
  if (f.title) lines.push(`<meta property="og:title" content="${f.title}" />`);
  if (f.description) lines.push(`<meta property="og:description" content="${f.description}" />`);
  if (f.image) lines.push(`<meta property="og:image" content="${f.image}" />`);
  if (f.siteName) lines.push(`<meta property="og:site_name" content="${f.siteName}" />`);

  lines.push("");
  lines.push("<!-- Twitter -->");
  lines.push(`<meta property="twitter:card" content="${f.twitterCard}" />`);
  if (f.url) lines.push(`<meta property="twitter:url" content="${f.url}" />`);
  if (f.title) lines.push(`<meta property="twitter:title" content="${f.title}" />`);
  if (f.description) lines.push(`<meta property="twitter:description" content="${f.description}" />`);
  if (f.image) lines.push(`<meta property="twitter:image" content="${f.image}" />`);
  const handle = f.twitterHandle.trim();
  if (handle) lines.push(`<meta name="twitter:site" content="${handle.startsWith("@") ? handle : "@" + handle}" />`);

  return lines.join("\n");
}

export default function OgMetaPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Fields) => (value: string) =>
    setFields(f => ({ ...f, [key]: value }));

  const metaOutput = generateMetaTags(fields);

  const copy = async () => {
    try { await navigator.clipboard.writeText(metaOutput); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600";
  const labelClass = "text-slate-400 text-xs mb-1.5 block";
  const selectClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60";

  const domain = extractDomain(fields.url);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">OG Meta Tag Generator</h1>
          <p className="text-slate-500 text-sm">Generate Open Graph and Twitter Card meta tags for any webpage.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass + " mb-0"}>Title</label>
                <span className={`text-xs ${fields.title.length > 60 ? "text-amber-400" : "text-slate-600"}`}>
                  {fields.title.length}/60
                </span>
              </div>
              <input
                type="text"
                value={fields.title}
                onChange={e => set("title")(e.target.value)}
                placeholder="My Awesome Page"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass + " mb-0"}>Description</label>
                <span className={`text-xs ${fields.description.length > 160 ? "text-amber-400" : "text-slate-600"}`}>
                  {fields.description.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={fields.description}
                onChange={e => set("description")(e.target.value)}
                placeholder="A short description of what this page is about."
                className={inputClass + " resize-none"}
              />
            </div>

            <div>
              <label className={labelClass}>URL</label>
              <input
                type="url"
                value={fields.url}
                onChange={e => set("url")(e.target.value)}
                placeholder="https://example.com/page"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="url"
                value={fields.image}
                onChange={e => set("image")(e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Site Name</label>
              <input
                type="text"
                value={fields.siteName}
                onChange={e => set("siteName")(e.target.value)}
                placeholder="My Site"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={fields.type}
                  onChange={e => set("type")(e.target.value)}
                  className={selectClass}
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Twitter Card</label>
                <select
                  value={fields.twitterCard}
                  onChange={e => set("twitterCard")(e.target.value)}
                  className={selectClass}
                >
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Twitter Handle <span className="text-slate-600">optional</span></label>
              <input
                type="text"
                value={fields.twitterHandle}
                onChange={e => set("twitterHandle")(e.target.value)}
                placeholder="@handle"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <p className="text-slate-400 text-xs mb-3">Preview</p>
              <div className="bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700/50">
                {fields.image ? (
                  <img
                    src={fields.image}
                    alt="OG preview"
                    className="w-full h-40 object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-700/40 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 20.25V3.75A.75.75 0 013.75 3z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{domain}</p>
                  <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
                    {fields.title || <span className="text-slate-600">Page title will appear here</span>}
                  </p>
                  {fields.description && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{fields.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs">Generated HTML</p>
                <button
                  onClick={copy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied
                      ? "bg-green-600/20 border border-green-500/40 text-green-400"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-950/80 rounded-xl border border-slate-800/60 p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">{metaOutput}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
