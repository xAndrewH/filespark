"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Globe,
  AlertTriangle,
  Check,
  Copy,
  ChevronDown,
  Image as ImageIcon,
  Link2,
} from "lucide-react";
import type { OgPreviewResult } from "@/app/api/og-preview/route";

function SmartImage({
  src,
  alt,
  className,
  rounded,
}: {
  src: string;
  alt: string;
  className: string;
  rounded: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`${className} ${rounded} bg-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1`}
      >
        <ImageIcon className="w-6 h-6" />
        <span className="text-xs font-medium">No image</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`${className} ${rounded} object-cover bg-slate-800`}
      onError={() => setFailed(true)}
    />
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      title="Copy value"
      type="button"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function OgPreviewPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OgPreviewResult | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const run = async () => {
    const u = url.trim();
    if (!u) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/og-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Something went wrong");
      } else {
        setData(json as OgPreviewResult);
      }
    } catch {
      setError("Network error | could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const domain = data?.resolved.domain || "";
  const rTitle = data?.resolved.title || "";
  const rDesc = data?.resolved.description || "";
  const rImage = data?.resolved.image || "";

  const rawTags: { property: string; value: string }[] = data
    ? [
        ["og:title", data.og.title],
        ["og:description", data.og.description],
        ["og:image", data.og.image],
        ["og:url", data.og.url],
        ["og:site_name", data.og.siteName],
        ["og:type", data.og.type],
        ["twitter:card", data.twitter.card],
        ["twitter:title", data.twitter.title],
        ["twitter:description", data.twitter.description],
        ["twitter:image", data.twitter.image],
        ["twitter:site", data.twitter.site],
        ["twitter:creator", data.twitter.creator],
      ]
        .filter(([, v]) => v)
        .map(([property, value]) => ({ property, value }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-blue-400" />
            Social Card Preview
          </h1>
          <p className="text-slate-500 text-sm">
            See exactly how your link will look when shared on Facebook, X, and LinkedIn.
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run();
            }}
            placeholder="example.com or https://example.com/page"
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600"
          />
          <button
            onClick={run}
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            type="button"
          >
            {loading ? "Loading…" : "Preview"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                <div className="h-3 w-24 bg-slate-800 rounded mb-4" />
                <div className="aspect-[1.91/1] w-full bg-slate-800 rounded-xl mb-3" />
                <div className="h-4 w-2/3 bg-slate-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-8">
            {/* MOCKUPS */}
            <div className="space-y-6">
              {/* Facebook / Open Graph */}
              <div>
                <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">
                  Facebook / Open Graph
                </p>
                <div className="rounded-lg overflow-hidden border border-slate-300 bg-white max-w-[500px]">
                  <SmartImage
                    src={rImage}
                    alt="og preview"
                    className="w-full aspect-[1.91/1]"
                    rounded=""
                  />
                  <div className="bg-[#f2f3f5] px-3 py-2.5">
                    <p className="text-[#606770] text-[11px] uppercase tracking-wide truncate">
                      {domain}
                    </p>
                    <p className="text-[#1d2129] font-semibold text-[15px] leading-snug line-clamp-2 mt-0.5">
                      {rTitle || "No title"}
                    </p>
                    {rDesc && (
                      <p className="text-[#606770] text-[13px] leading-snug line-clamp-2 mt-0.5">
                        {rDesc}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* X / Twitter */}
              <div>
                <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">
                  X / Twitter
                  <span className="ml-2 normal-case text-slate-600">
                    card: {data.twitter.card || "summary_large_image (default)"}
                  </span>
                </p>
                <div className="max-w-[500px]">
                  <div className="relative">
                    <SmartImage
                      src={rImage}
                      alt="twitter preview"
                      className="w-full aspect-[1.91/1] border border-slate-700"
                      rounded="rounded-2xl"
                    />
                    {domain && rImage && (
                      <span className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[12px] px-1.5 py-0.5 rounded">
                        {domain}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">
                  LinkedIn
                </p>
                <div className="rounded-md overflow-hidden border border-slate-300 bg-white max-w-[500px]">
                  <SmartImage
                    src={rImage}
                    alt="linkedin preview"
                    className="w-full aspect-[1.91/1]"
                    rounded=""
                  />
                  <div className="px-3 py-2.5">
                    <p className="text-[#000000e6] font-semibold text-[14px] leading-snug line-clamp-2">
                      {rTitle || "No title"}
                    </p>
                    <p className="text-[#00000099] text-[12px] mt-1">
                      {domain} • FileSpark
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WARNINGS */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-white text-sm font-semibold">Checks</h2>
              </div>
              {data.warnings.length === 0 ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  All key Open Graph tags present ✓
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.warnings.map((w, i) => {
                    const critical = w.toLowerCase().includes("no og:image");
                    return (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                            critical ? "bg-red-400" : "bg-amber-400"
                          }`}
                        />
                        <span className={critical ? "text-red-300" : "text-slate-300"}>{w}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* RESOLVED VALUES */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-blue-400" />
                <h2 className="text-white text-sm font-semibold">What platforms will actually use</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500 text-xs mb-0.5">Title</dt>
                  <dd className="text-slate-200">{rTitle || <span className="text-slate-600">|</span>}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs mb-0.5">Description</dt>
                  <dd className="text-slate-200">{rDesc || <span className="text-slate-600">|</span>}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs mb-0.5">Image</dt>
                  <dd className="text-slate-200 break-all flex items-start gap-1.5">
                    <Link2 className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" />
                    {rImage || <span className="text-slate-600">none</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs mb-0.5">Domain</dt>
                  <dd className="text-slate-200">{domain || <span className="text-slate-600">|</span>}</dd>
                </div>
              </dl>
            </div>

            {/* RAW TAGS */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
              <button
                onClick={() => setRawOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                type="button"
              >
                <span className="text-white text-sm font-semibold">
                  Raw tags{" "}
                  <span className="text-slate-500 font-normal">({rawTags.length})</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${rawOpen ? "rotate-180" : ""}`}
                />
              </button>
              {rawOpen && (
                <div className="px-5 pb-5">
                  {rawTags.length === 0 ? (
                    <p className="text-slate-500 text-sm">No og:* or twitter:* tags found.</p>
                  ) : (
                    <div className="divide-y divide-slate-800/60">
                      {rawTags.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 text-xs font-mono">
                          <span className="text-blue-400 w-40 shrink-0">{t.property}</span>
                          <span className="text-slate-300 flex-1 break-all">{t.value}</span>
                          <CopyButton value={t.value} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
