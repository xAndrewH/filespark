"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Check,
  Clock,
  KeyRound,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Fingerprint,
  User,
  Building2,
  Users,
} from "lucide-react";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNzU0NDAwMCwiZXhwIjoxNzE3NTQ3NjAwfQ.dQw4w9WgXcQ_signature_not_verified_example";

function base64UrlDecode(segment: string): string {
  let b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad === 1) throw new Error("Invalid base64url length");
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function prettyJson(segment: string): string {
  const decoded = base64UrlDecode(segment);
  const parsed = JSON.parse(decoded);
  return JSON.stringify(parsed, null, 2);
}

type DecodeResult =
  | {
      ok: true;
      headerJson: string;
      payloadJson: string;
      signature: string;
      payloadObj: Record<string, unknown>;
    }
  | { ok: false; error: string };

function decodeJwt(token: string): DecodeResult {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error: "A JWT must have exactly 3 segments separated by dots (header.payload.signature).",
    };
  }
  let headerJson: string;
  let payloadJson: string;
  let payloadObj: Record<string, unknown>;
  try {
    headerJson = prettyJson(parts[0]);
  } catch {
    return { ok: false, error: "Header segment is not valid base64url-encoded JSON." };
  }
  try {
    payloadJson = prettyJson(parts[1]);
    payloadObj = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Payload segment is not valid base64url-encoded JSON." };
  }
  return {
    ok: true,
    headerJson,
    payloadJson,
    signature: parts[2],
    payloadObj,
  };
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function relativeTime(unix: number): string {
  const diffMs = unix * 1000 - Date.now();
  const abs = Math.abs(diffMs);
  const units: [number, string][] = [
    [1000 * 60 * 60 * 24 * 365, "year"],
    [1000 * 60 * 60 * 24 * 30, "month"],
    [1000 * 60 * 60 * 24, "day"],
    [1000 * 60 * 60, "hour"],
    [1000 * 60, "minute"],
    [1000, "second"],
  ];
  let value = 0;
  let unit = "second";
  for (const [ms, name] of units) {
    if (abs >= ms || name === "second") {
      value = Math.round(abs / ms);
      unit = name;
      break;
    }
  }
  const plural = value === 1 ? unit : `${unit}s`;
  return diffMs >= 0 ? `in ${value} ${plural}` : `${value} ${plural} ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const TIMESTAMP_CLAIMS: { key: string; name: string }[] = [
  { key: "iat", name: "Issued At" },
  { key: "nbf", name: "Not Before" },
  { key: "exp", name: "Expiration" },
];

const STRING_CLAIMS: { key: string; name: string; icon: typeof User }[] = [
  { key: "iss", name: "Issuer", icon: Building2 },
  { key: "sub", name: "Subject", icon: User },
  { key: "aud", name: "Audience", icon: Users },
  { key: "jti", name: "JWT ID", icon: Fingerprint },
];

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");

  const result = useMemo(() => (token.trim() ? decodeJwt(token) : null), [token]);
  const segments = token.includes(".") ? token.trim().split(".") : [];

  const payload = result && result.ok ? result.payloadObj : null;

  const hasTimestamp = payload
    ? TIMESTAMP_CLAIMS.some(({ key }) => typeof payload[key] === "number")
    : false;
  const hasString = payload
    ? STRING_CLAIMS.some(({ key }) => payload[key] != null)
    : false;
  const showClaims = hasTimestamp || hasString;

  const expClaim = payload && typeof payload.exp === "number" ? (payload.exp as number) : null;
  const expired = expClaim != null ? expClaim * 1000 < Date.now() : null;

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

        <div className="flex items-center gap-2.5 mb-1">
          <KeyRound className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">JWT Decoder</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Decode a JSON Web Token into its header, payload, and signature. Runs entirely in your
          browser — nothing is sent anywhere.
        </p>

        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                JWT
              </span>
              <button
                onClick={() => setToken(SAMPLE_TOKEN)}
                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
              >
                Paste sample token
              </button>
            </div>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder={`Paste your token here, e.g.\n${SAMPLE_TOKEN}`}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono text-xs resize-none break-all"
            />

            {segments.length > 0 && (
              <div className="mt-3 font-mono text-xs break-all leading-relaxed">
                <span className="text-red-400">{segments[0]}</span>
                {segments.length > 1 && (
                  <>
                    <span className="text-slate-600">.</span>
                    <span className="text-fuchsia-400">{segments[1]}</span>
                  </>
                )}
                {segments.length > 2 && (
                  <>
                    <span className="text-slate-600">.</span>
                    <span className="text-cyan-400">{segments.slice(2).join(".")}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {result && !result.ok && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-400 text-sm flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {result && result.ok && (
            <>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                    Header
                  </span>
                  <CopyButton text={result.headerJson} />
                </div>
                <pre className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                  {result.headerJson}
                </pre>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-fuchsia-400 uppercase tracking-wider">
                    Payload
                  </span>
                  <CopyButton text={result.payloadJson} />
                </div>
                <pre className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                  {result.payloadJson}
                </pre>
              </div>

              {showClaims && payload && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">
                    Registered Claims
                  </span>
                  <div className="space-y-3">
                    {TIMESTAMP_CLAIMS.map(({ key, name }) => {
                      const v = payload[key];
                      if (typeof v !== "number") return null;
                      const isExp = key === "exp";
                      return (
                        <div
                          key={key}
                          className="flex items-start justify-between gap-3 border-b border-slate-800/40 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-200">{name}</span>
                                <code className="text-xs text-slate-500 font-mono">{key}</code>
                                {isExp &&
                                  (expired ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">
                                      <XCircle className="w-3 h-3" />
                                      Expired
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded px-1.5 py-0.5">
                                      <CheckCircle className="w-3 h-3" />
                                      Valid
                                    </span>
                                  ))}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">{formatDate(v)}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{relativeTime(v)}</div>
                            </div>
                          </div>
                          <code className="text-xs text-slate-600 font-mono shrink-0">{v}</code>
                        </div>
                      );
                    })}
                    {STRING_CLAIMS.map(({ key, name, icon: Icon }) => {
                      const v = payload[key];
                      if (v == null) return null;
                      return (
                        <div
                          key={key}
                          className="flex items-start justify-between gap-3 border-b border-slate-800/40 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-200">{name}</span>
                                <code className="text-xs text-slate-500 font-mono">{key}</code>
                              </div>
                            </div>
                          </div>
                          <code className="text-xs text-slate-400 font-mono break-all text-right">
                            {typeof v === "string" ? v : JSON.stringify(v)}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2 block">
                  Signature
                </span>
                <pre className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 text-xs font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap break-all">
                  {result.signature || "(empty)"}
                </pre>
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  Signature is not verified — this tool only decodes.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
