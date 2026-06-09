"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check, AlertCircle } from "lucide-react";
import type { MetaTagResult, MetaTag } from "@/app/api/meta-tags/route";

function scoreColor(s: number) {
  if (s >= 80) return "#0cce6b";
  if (s >= 50) return "#ffa400";
  return "#ff4e42";
}

function scoreLabel(s: number) {
  if (s >= 80) return "Good";
  if (s >= 50) return "Needs work";
  return "Poor";
}

function scoreLabelCls(s: number) {
  if (s >= 80) return "text-green-400";
  if (s >= 50) return "text-orange-400";
  return "text-red-400";
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const dash = circ * pct;
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs text-center">Meta Tag Score</p>
        <p className={`text-xs font-medium text-center ${scoreLabelCls(score)}`}>{scoreLabel(score)}</p>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function BasicRow({ label, value, lengthBadge }: { label: string; value: string; lengthBadge?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isTrunc = value.length > 100;
  const display = isTrunc && !expanded ? value.slice(0, 100) + "…" : value;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-500 text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">
        {value ? (
          <div className="flex items-start gap-2">
            <span className="text-slate-200 text-sm font-mono break-all">{display}</span>
            {isTrunc && (
              <button onClick={() => setExpanded(e => !e)} className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 mt-0.5">
                {expanded ? "less" : "more"}
              </button>
            )}
          </div>
        ) : (
          <span className="text-slate-600 text-sm italic">|</span>
        )}
        {lengthBadge && value && (
          <span className={`mt-1 inline-block text-xs px-1.5 py-0.5 rounded font-mono ${value.length > 160 || (label === "Title" && value.length > 60) ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-400"}`}>
            {value.length} chars
          </span>
        )}
      </div>
      {value && <CopyBtn text={value} />}
    </div>
  );
}

function TagRow({ name, content }: { name: string; content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isTrunc = content.length > 100;
  const display = isTrunc && !expanded ? content.slice(0, 100) + "…" : content;
  const isUrl = content.startsWith("http");
  return (
    <tr className="border-b border-slate-800/40 last:border-0">
      <td className="py-2 pr-4 font-mono text-xs text-blue-400 whitespace-nowrap align-top">{name}</td>
      <td className="py-2 text-sm text-slate-300 break-all">
        <div className="flex items-start gap-2">
          <span>{display}</span>
          {isTrunc && (
            <button onClick={() => setExpanded(e => !e)} className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">
              {expanded ? "less" : "more"}
            </button>
          )}
        </div>
        {isUrl && name.toLowerCase().includes("image") && (
          <img src={content} alt="" className="mt-1.5 h-16 w-auto rounded border border-slate-700/60 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        )}
      </td>
      <td className="py-2 pl-2 align-top"><CopyBtn text={content} /></td>
    </tr>
  );
}

function OtherTagRow({ tag }: { tag: MetaTag }) {
  const name = tag.name ?? tag.property ?? tag.httpEquiv ?? tag.rel ?? "";
  const value = tag.content ?? tag.href ?? "";
  return <TagRow name={name} content={value} />;
}

function Skeleton() {
  return (
    <div className="space-y-4 mt-8 animate-pulse">
      <div className="h-32 animate-pulse bg-slate-800 rounded-xl" />
      <div className="h-48 animate-pulse bg-slate-800 rounded-xl" />
      <div className="h-48 animate-pulse bg-slate-800 rounded-xl" />
    </div>
  );
}

export default function MetaTagAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetaTagResult | null>(null);
  const [error, setError] = useState("");
  const [otherOpen, setOtherOpen] = useState(false);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/meta-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Unknown error"); return; }
      setResult(data);
    } catch {
      setError("Failed to analyze URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Meta Tag Analyzer</h1>
          <p className="text-slate-500 text-sm">Audit any URL's meta tags, Open Graph, and Twitter Card data.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="https://example.com"
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            Analyze
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && <Skeleton />}

        {result && !loading && (
          <div className="mt-6 space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <ScoreRing score={result.score} />
              {result.issues.length > 0 && (
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    Issues found ({result.issues.length})
                  </p>
                  <ul className="space-y-1.5">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.issues.length === 0 && (
                <div className="flex-1 flex items-center">
                  <p className="text-green-400 text-sm">No issues found. All essential meta tags are present.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <h2 className="text-white text-sm font-semibold mb-3">Basic SEO</h2>
              <BasicRow label="Title" value={result.title} lengthBadge />
              <BasicRow label="Description" value={result.description} lengthBadge />
              <BasicRow label="Canonical" value={result.canonical} />
              <BasicRow label="Robots" value={result.robots} />
              <BasicRow label="Viewport" value={result.viewport} />
              <BasicRow label="Charset" value={result.charset} />
            </div>

            {result.og.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h2 className="text-white text-sm font-semibold mb-3">Open Graph</h2>
                <table className="w-full">
                  <tbody>
                    {result.og.map((o, i) => (
                      <TagRow key={i} name={o.property} content={o.content} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.twitter.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h2 className="text-white text-sm font-semibold mb-3">Twitter Card</h2>
                <table className="w-full">
                  <tbody>
                    {result.twitter.map((t, i) => (
                      <TagRow key={i} name={t.name} content={t.content} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.other.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <button
                  onClick={() => setOtherOpen(o => !o)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h2 className="text-white text-sm font-semibold">Other Tags</h2>
                  <span className="text-slate-500 text-xs">({result.other.length})</span>
                  <ChevronLeft className={`w-3.5 h-3.5 text-slate-500 ml-auto transition-transform ${otherOpen ? "-rotate-90" : "rotate-180"}`} />
                </button>
                {otherOpen && (
                  <table className="w-full mt-3">
                    <tbody>
                      {result.other.map((tag, i) => (
                        <OtherTagRow key={i} tag={tag} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
