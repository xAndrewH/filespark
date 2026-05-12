"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;
type ErrorLevel = typeof ERROR_LEVELS[number];

export default function QrPage() {
  const [text, setText]           = useState("https://");
  const [size, setSize]           = useState(256);
  const [fgColor, setFgColor]     = useState("#ffffff");
  const [bgColor, setBgColor]     = useState("#0f172a");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [dataUrl, setDataUrl]     = useState<string | null>(null);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!text.trim()) { setDataUrl(null); return; }
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      }).then((url) => {
        if (!cancelled) { setDataUrl(url); setError(""); }
      }).catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    });
    return () => { cancelled = true; };
  }, [text, size, fgColor, bgColor, errorLevel]);

  const download = (fmt: "png" | "svg") => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode.${fmt === "svg" ? "svg" : "png"}`;
    link.click();
  };

  const copyImage = async () => {
    if (!dataUrl) return;
    const res  = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">QR Code Generator</h1>
          <p className="text-slate-500 text-sm">Generate a QR code for any URL, text, or data. Download as PNG.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Enter a URL, text, email, or any data…"
                className="w-full bg-slate-900 border border-slate-700/60 text-white text-sm rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Foreground</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                  <span className="text-white text-xs font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Background</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                  <span className="text-white text-xs font-mono">{bgColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Size: {size}×{size}px
              </label>
              <input
                type="range" min={128} max={1024} step={64}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Error Correction</label>
              <div className="grid grid-cols-4 gap-1.5">
                {ERROR_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setErrorLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      errorLevel === lvl
                        ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-1.5">L=7% · M=15% · Q=25% · H=30% recovery</p>
            </div>
          </div>

          {/* Preview + Download */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 flex items-center justify-center min-h-[280px]">
              {error ? (
                <p className="text-red-400 text-sm text-center">{error}</p>
              ) : dataUrl ? (
                <img src={dataUrl} alt="QR Code" className="max-w-full rounded-lg shadow-xl" />
              ) : (
                <p className="text-slate-600 text-sm">Enter content to generate QR code</p>
              )}
            </div>

            {dataUrl && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => download("png")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={copyImage}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
