"use client";

import { useState } from "react";
import Link from "next/link";

const SOURCE_CHIPS = [
  "google",
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "bing",
  "youtube",
  "pinterest",
  "reddit",
  "snapchat",
  "x.com",
  "taboola",
  "newsletter",
  "qr",
];

const MEDIUM_CHIPS = [
  "cpc",
  "paid_social",
  "cpm",
  "cpv",
  "display",
  "video",
  "email",
  "sms",
  "organic",
  "social",
  "referral",
  "affiliate",
  "print",
];

function encodeParam(value: string): string {
  return value.trim().replace(/\s+/g, "+").replace(/[^A-Za-z0-9_.~+\-]/g, (c) => encodeURIComponent(c));
}

interface Fields {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const EMPTY: Fields = { url: "", source: "", medium: "", campaign: "", term: "", content: "" };

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

interface ParamPill {
  key: string;
  value: string;
  required: boolean;
}

function getBreakdown(fields: Fields): ParamPill[] {
  return [
    { key: "utm_source", value: fields.source.trim(), required: true },
    { key: "utm_medium", value: fields.medium.trim(), required: true },
    { key: "utm_campaign", value: fields.campaign.trim(), required: true },
    { key: "utm_term", value: fields.term.trim(), required: false },
    { key: "utm_content", value: fields.content.trim(), required: false },
  ];
}

export default function UtmBuilderPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Fields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const generatedUrl = buildUrl(fields);
  const breakdown = getBreakdown(fields);

  const copy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => setFields(EMPTY);

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600";
  const labelClass = "text-slate-400 text-xs mb-1.5 block";
  const chipClass =
    "px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-colors";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">UTM Builder</h1>
            <p className="text-slate-500 text-sm">
              Build UTM-tagged URLs for campaign tracking.
            </p>
          </div>
          <button
            onClick={clearAll}
            className="mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-5">
          {/* Website URL */}
          <div>
            <label className={labelClass}>
              Website URL
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="url"
              value={fields.url}
              onChange={(e) => set("url")(e.target.value)}
              placeholder="https://example.com/page"
              className={inputClass}
            />
          </div>

          {/* Campaign Source */}
          <div>
            <label className={labelClass}>
              Campaign Source
              <span className="text-red-400 ml-0.5">*</span>
              <span className="text-slate-600 ml-1">utm_source</span>
            </label>
            <input
              type="text"
              value={fields.source}
              onChange={(e) => set("source")(e.target.value)}
              placeholder="google"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SOURCE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => set("source")(chip)}
                  className={chipClass}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Medium */}
          <div>
            <label className={labelClass}>
              Campaign Medium
              <span className="text-red-400 ml-0.5">*</span>
              <span className="text-slate-600 ml-1">utm_medium</span>
            </label>
            <input
              type="text"
              value={fields.medium}
              onChange={(e) => set("medium")(e.target.value)}
              placeholder="cpc"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {MEDIUM_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => set("medium")(chip)}
                  className={chipClass}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Name */}
          <div>
            <label className={labelClass}>
              Campaign Name
              <span className="text-red-400 ml-0.5">*</span>
              <span className="text-slate-600 ml-1">utm_campaign</span>
            </label>
            <input
              type="text"
              value={fields.campaign}
              onChange={(e) => set("campaign")(e.target.value)}
              placeholder="spring_sale_2025"
              className={inputClass}
            />
          </div>

          {/* Campaign Term */}
          <div>
            <label className={labelClass}>
              Campaign Term
              <span className="text-slate-600 ml-1">utm_term</span>
              <span className="text-slate-600 ml-1">(optional) Paid search keywords</span>
            </label>
            <input
              type="text"
              value={fields.term}
              onChange={(e) => set("term")(e.target.value)}
              placeholder="running+shoes"
              className={inputClass}
            />
          </div>

          {/* Campaign Content */}
          <div>
            <label className={labelClass}>
              Campaign Content
              <span className="text-slate-600 ml-1">utm_content</span>
              <span className="text-slate-600 ml-1">(optional) Differentiate ads or links</span>
            </label>
            <input
              type="text"
              value={fields.content}
              onChange={(e) => set("content")(e.target.value)}
              placeholder="logolink"
              className={inputClass}
            />
          </div>

          {/* Generated URL */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass + " mb-0"}>Generated URL</label>
              <button
                onClick={copy}
                disabled={!generatedUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  generatedUrl
                    ? copied
                      ? "bg-green-600/20 border border-green-500/40 text-green-400"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-slate-800 border border-slate-700/50 text-slate-600 cursor-not-allowed"
                }`}
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <textarea
              readOnly
              value={generatedUrl}
              placeholder="Fill in the required fields above"
              className={`${inputClass} font-mono text-xs h-24 resize-none`}
            />
          </div>

          {/* Breakdown */}
          {breakdown.some((p) => p.value) && (
            <div>
              <p className="text-slate-500 text-xs mb-2">Parameters</p>
              <div className="flex flex-wrap gap-2">
                {breakdown.map((pill) => (
                  <span
                    key={pill.key}
                    className={`bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      pill.value ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {pill.value
                      ? `${pill.key}=${encodeParam(pill.value)}`
                      : pill.key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
