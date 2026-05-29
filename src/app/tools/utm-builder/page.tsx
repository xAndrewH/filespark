"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RelatedTools } from "@/components/RelatedTools";

const SOURCE_CHIPS = [
  "google", "facebook", "instagram", "linkedin", "tiktok", "bing",
  "youtube", "pinterest", "reddit", "snapchat", "x.com", "taboola",
  "newsletter", "qr",
];

const MEDIUM_CHIPS = [
  "cpc", "paid_social", "cpm", "cpv", "display", "video",
  "email", "sms", "organic", "social", "referral", "affiliate", "print",
];

const TEMPLATES_KEY = "ff-utm-templates";

interface Fields {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface Template {
  id: string;
  name: string;
  source: string;
  medium: string;
  term: string;
  content: string;
}

const EMPTY: Fields = { url: "", source: "", medium: "", campaign: "", term: "", content: "" };

function encodeParam(value: string): string {
  return value.trim().replace(/\s+/g, "+").replace(/[^A-Za-z0-9_.~+\-]/g, (c) => encodeURIComponent(c));
}

function buildUrl(fields: Fields): string {
  const { url, source, medium, campaign, term, content } = fields;
  if (!url.trim() || !source.trim() || !medium.trim() || !campaign.trim()) return "";
  const params: string[] = [];
  params.push(`utm_source=${encodeParam(source)}`);
  params.push(`utm_medium=${encodeParam(medium)}`);
  params.push(`utm_campaign=${encodeParam(campaign)}`);
  if (term.trim()) params.push(`utm_term=${encodeParam(term)}`);
  if (content.trim()) params.push(`utm_content=${encodeParam(content)}`);
  const base = url.trim();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${params.join("&")}`;
}

function getBreakdown(fields: Fields) {
  return [
    { key: "utm_source",   value: fields.source.trim(),   required: true  },
    { key: "utm_medium",   value: fields.medium.trim(),   required: true  },
    { key: "utm_campaign", value: fields.campaign.trim(), required: true  },
    { key: "utm_term",     value: fields.term.trim(),     required: false },
    { key: "utm_content",  value: fields.content.trim(),  required: false },
  ];
}

export default function UtmBuilderPage() {
  return (
    <Suspense>
      <UtmBuilderInner />
    </Suspense>
  );
}

function UtmBuilderInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [fields, setFields] = useState<Fields>(() => ({
    url:      searchParams.get("url")      ?? "",
    source:   searchParams.get("source")   ?? "",
    medium:   searchParams.get("medium")   ?? "",
    campaign: searchParams.get("campaign") ?? "",
    term:     searchParams.get("term")     ?? "",
    content:  searchParams.get("content")  ?? "",
  }));

  const [copied, setCopied] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [savingName, setSavingName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      if (raw) setTemplates(JSON.parse(raw));
    } catch {}
  }, []);

  // Sync fields → URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (fields.url)      params.set("url",      fields.url);
    if (fields.source)   params.set("source",   fields.source);
    if (fields.medium)   params.set("medium",   fields.medium);
    if (fields.campaign) params.set("campaign", fields.campaign);
    if (fields.term)     params.set("term",     fields.term);
    if (fields.content)  params.set("content",  fields.content);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [fields, router, pathname]);

  const set = (key: keyof Fields) => (value: string) =>
    setFields(f => ({ ...f, [key]: value }));

  const generatedUrl = buildUrl(fields);
  const breakdown = getBreakdown(fields);

  const copy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setSharedCopied(true);
    setTimeout(() => setSharedCopied(false), 1500);
  };

  const clearAll = () => setFields(EMPTY);

  const saveTemplate = useCallback(() => {
    if (!savingName.trim()) return;
    const tpl: Template = {
      id: Date.now().toString(),
      name: savingName.trim(),
      source: fields.source,
      medium: fields.medium,
      term: fields.term,
      content: fields.content,
    };
    const next = [...templates, tpl];
    setTemplates(next);
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next)); } catch {}
    setSavingName("");
    setShowSaveInput(false);
  }, [savingName, fields, templates]);

  const loadTemplate = (tpl: Template) => {
    setFields(f => ({ ...f, source: tpl.source, medium: tpl.medium, term: tpl.term, content: tpl.content }));
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter(t => t.id !== id);
    setTemplates(next);
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next)); } catch {}
  };

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600";
  const labelClass = "text-slate-400 text-xs mb-1.5 block";
  const chipClass =
    "px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-colors";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">UTM Builder</h1>
            <p className="text-slate-500 text-sm">Build UTM-tagged URLs for campaign tracking.</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={copyShareLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${sharedCopied ? "bg-green-600/20 border-green-500/40 text-green-400" : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-white"}`}>
              {sharedCopied ? "Link copied!" : "Share link"}
            </button>
            <button onClick={clearAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white text-xs transition-colors">
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Saved Templates */}
          {templates.length > 0 && (
            <div>
              <label className={labelClass}>Saved Templates</label>
              <div className="flex flex-wrap gap-1.5">
                {templates.map(tpl => (
                  <div key={tpl.id} className="flex items-center gap-0 bg-slate-800 border border-slate-700/50 rounded-md overflow-hidden">
                    <button onClick={() => loadTemplate(tpl)}
                      className="px-2.5 py-1 text-slate-300 hover:text-white text-xs transition-colors">
                      {tpl.name}
                    </button>
                    <button onClick={() => deleteTemplate(tpl.id)}
                      className="px-1.5 py-1 text-slate-600 hover:text-red-400 text-xs transition-colors border-l border-slate-700/50">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website URL */}
          <div>
            <label className={labelClass}>Website URL <span className="text-red-400">*</span></label>
            <input type="url" value={fields.url} onChange={e => set("url")(e.target.value)}
              placeholder="https://example.com/page" className={inputClass} />
          </div>

          {/* Campaign Source */}
          <div>
            <label className={labelClass}>
              Campaign Source <span className="text-red-400">*</span>
              <span className="text-slate-600 ml-1">utm_source</span>
            </label>
            <input type="text" value={fields.source} onChange={e => set("source")(e.target.value)}
              placeholder="google" className={inputClass} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SOURCE_CHIPS.map(chip => (
                <button key={chip} onClick={() => set("source")(chip)} className={chipClass}>{chip}</button>
              ))}
            </div>
          </div>

          {/* Campaign Medium */}
          <div>
            <label className={labelClass}>
              Campaign Medium <span className="text-red-400">*</span>
              <span className="text-slate-600 ml-1">utm_medium</span>
            </label>
            <input type="text" value={fields.medium} onChange={e => set("medium")(e.target.value)}
              placeholder="cpc" className={inputClass} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {MEDIUM_CHIPS.map(chip => (
                <button key={chip} onClick={() => set("medium")(chip)} className={chipClass}>{chip}</button>
              ))}
            </div>
          </div>

          {/* Campaign Name */}
          <div>
            <label className={labelClass}>
              Campaign Name <span className="text-red-400">*</span>
              <span className="text-slate-600 ml-1">utm_campaign</span>
            </label>
            <input type="text" value={fields.campaign} onChange={e => set("campaign")(e.target.value)}
              placeholder="spring_sale_2025" className={inputClass} />
          </div>

          {/* Campaign Term */}
          <div>
            <label className={labelClass}>
              Campaign Term
              <span className="text-slate-600 ml-1">utm_term · optional · paid search keywords</span>
            </label>
            <input type="text" value={fields.term} onChange={e => set("term")(e.target.value)}
              placeholder="running+shoes" className={inputClass} />
          </div>

          {/* Campaign Content */}
          <div>
            <label className={labelClass}>
              Campaign Content
              <span className="text-slate-600 ml-1">utm_content · optional · differentiate ads</span>
            </label>
            <input type="text" value={fields.content} onChange={e => set("content")(e.target.value)}
              placeholder="hero-banner" className={inputClass} />
          </div>

          {/* Save as template */}
          {(fields.source || fields.medium) && (
            <div>
              {showSaveInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={savingName}
                    onChange={e => setSavingName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveTemplate(); if (e.key === "Escape") setShowSaveInput(false); }}
                    placeholder="Template name (e.g. Google Paid Search)"
                    autoFocus
                    className={inputClass + " flex-1"}
                  />
                  <button onClick={saveTemplate} disabled={!savingName.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors">
                    Save
                  </button>
                  <button onClick={() => setShowSaveInput(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white text-sm rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowSaveInput(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors underline underline-offset-2">
                  + Save source/medium as template
                </button>
              )}
            </div>
          )}

          {/* Generated URL */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass + " mb-0"}>Generated URL</label>
              <button onClick={copy} disabled={!generatedUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  generatedUrl
                    ? copied
                      ? "bg-green-600/20 border border-green-500/40 text-green-400"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-slate-800 border border-slate-700/50 text-slate-600 cursor-not-allowed"
                }`}>
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <textarea readOnly value={generatedUrl} placeholder="Fill in the required fields above"
              className={`${inputClass} font-mono text-xs h-24 resize-none`} />
          </div>

          {/* Breakdown */}
          {breakdown.some(p => p.value) && (
            <div>
              <p className="text-slate-500 text-xs mb-2">Parameters</p>
              <div className="flex flex-wrap gap-2">
                {breakdown.map(pill => (
                  <span key={pill.key}
                    className={`bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono ${pill.value ? "text-slate-300" : "text-slate-600"}`}>
                    {pill.value ? `${pill.key}=${encodeParam(pill.value)}` : pill.key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <RelatedTools current="/tools/utm-builder" />
      </div>
    </div>
  );
}
