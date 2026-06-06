"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check } from "lucide-react";

function countMatches(text: string, find: string, caseSensitive: boolean, regexMode: boolean): number {
  if (!find || !text) return 0;
  try {
    const flags = caseSensitive ? "g" : "gi";
    const pattern = regexMode ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(pattern, flags);
    return (text.match(re) || []).length;
  } catch {
    return -1;
  }
}

function buildRegex(find: string, caseSensitive: boolean, regexMode: boolean): RegExp {
  const flags = caseSensitive ? "g" : "gi";
  const pattern = regexMode ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(pattern, flags);
}

export default function FindReplacePage() {
  const [inputText, setInputText] = useState("");
  const [findStr, setFindStr] = useState("");
  const [replaceStr, setReplaceStr] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isValidRegex = (pattern: string): boolean => {
    try { new RegExp(pattern); return true; } catch { return false; }
  };

  const refreshMatchCount = useCallback((text: string, find: string, cs: boolean, rx: boolean) => {
    if (!find) { setMatchCount(null); setError(""); return; }
    if (rx && !isValidRegex(find)) {
      setError("Invalid regular expression.");
      setMatchCount(null);
      return;
    }
    setError("");
    setMatchCount(countMatches(text, find, cs, rx));
  }, []);

  const handleInputText = (val: string) => {
    setInputText(val);
    refreshMatchCount(val, findStr, caseSensitive, regexMode);
  };

  const handleFindStr = (val: string) => {
    setFindStr(val);
    refreshMatchCount(inputText, val, caseSensitive, regexMode);
  };

  const handleCaseSensitive = (val: boolean) => {
    setCaseSensitive(val);
    refreshMatchCount(inputText, findStr, val, regexMode);
  };

  const handleRegexMode = (val: boolean) => {
    setRegexMode(val);
    refreshMatchCount(inputText, findStr, caseSensitive, val);
  };

  const replaceAll = () => {
    if (!findStr || error) return;
    try {
      const re = buildRegex(findStr, caseSensitive, regexMode);
      setOutputText(inputText.replace(re, replaceStr));
    } catch {
      setError("Invalid regular expression.");
    }
  };

  const replaceNext = () => {
    if (!findStr || error) return;
    try {
      const flags = caseSensitive ? "" : "i";
      const pattern = regexMode ? findStr : findStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(pattern, flags);
      setOutputText(inputText.replace(re, replaceStr));
    } catch {
      setError("Invalid regular expression.");
    }
  };

  const copy = async () => {
    if (!outputText) return;
    try { await navigator.clipboard.writeText(outputText); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const buttonsDisabled = !findStr || !!error;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Find & Replace</h1>
        <p className="text-slate-500 text-sm mb-8">Search and replace text with string or regex patterns.</p>

        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Input Text</p>
              <textarea
                value={inputText}
                onChange={e => handleInputText(e.target.value)}
                placeholder="Paste your text here…"
                rows={10}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Find</p>
                <input
                  type="text"
                  value={findStr}
                  onChange={e => handleFindStr(e.target.value)}
                  placeholder={regexMode ? "^hello.*" : "search term"}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Replace With</p>
                <input
                  type="text"
                  value={replaceStr}
                  onChange={e => setReplaceStr(e.target.value)}
                  placeholder="replacement"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={e => handleCaseSensitive(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-slate-400">Case sensitive</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={regexMode}
                  onChange={e => handleRegexMode(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-slate-400">Regex mode</span>
              </label>
            </div>

            {error && (
              <p className="text-amber-400 text-sm bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={replaceAll}
                disabled={buttonsDisabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Replace All
              </button>
              <button
                onClick={replaceNext}
                disabled={buttonsDisabled}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Replace Next
              </button>
              {matchCount !== null && !error && (
                <span className="text-sm text-slate-500">
                  {matchCount === 0 ? "No matches" : `${matchCount} match${matchCount === 1 ? "" : "es"} found`}
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Output</p>
              {outputText && (
                <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700/60">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Result will appear here after replacing…"
              rows={10}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
