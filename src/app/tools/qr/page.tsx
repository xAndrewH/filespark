"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";

/* ── Types ─────────────────────────────────────────────────────────────── */
const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;
type ErrorLevel = typeof ERROR_LEVELS[number];
type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "whatsapp";
type DotStyle    = "square" | "rounded" | "dots" | "extra-rounded";
type EyeOuter   = "square" | "rounded" | "circle";
type EyeInner   = "square" | "rounded" | "circle";
type FrameStyle  = "none" | "square" | "rounded" | "scan-bottom" | "scan-rounded-bottom" | "scan-top";
type LogoEmoji   = "none" | "🔗" | "📍" | "✉️" | "📞" | "📶" | "👤" | "💬" | "⭐" | "❤️";
type DesignTab   = "frame" | "shape" | "logo";

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: "url", label: "URL" }, { id: "text", label: "Text" },
  { id: "email", label: "Email" }, { id: "phone", label: "Phone" },
  { id: "sms", label: "SMS" }, { id: "wifi", label: "Wi-Fi" },
  { id: "vcard", label: "Contact" }, { id: "whatsapp", label: "WhatsApp" },
];

type FormState = {
  url: { url: string };
  text: { text: string };
  email: { to: string; subject: string; body: string };
  phone: { number: string };
  sms: { number: string; message: string };
  wifi: { ssid: string; password: string; security: "WPA" | "WEP" | "nopass"; hidden: boolean };
  vcard: { firstName: string; lastName: string; phone: string; email: string; org: string; url: string };
  whatsapp: { number: string; message: string };
};

const DEFAULT_FORM: FormState = {
  url: { url: "https://" }, text: { text: "" },
  email: { to: "", subject: "", body: "" }, phone: { number: "" },
  sms: { number: "", message: "" },
  wifi: { ssid: "", password: "", security: "WPA", hidden: false },
  vcard: { firstName: "", lastName: "", phone: "", email: "", org: "", url: "" },
  whatsapp: { number: "", message: "" },
};

function buildQrString(type: ContentType, form: FormState): string {
  switch (type) {
    case "url":      return form.url.url || "https://";
    case "text":     return form.text.text;
    case "email": {
      const p = new URLSearchParams();
      if (form.email.subject) p.set("subject", form.email.subject);
      if (form.email.body)    p.set("body",    form.email.body);
      const qs = p.toString();
      return `mailto:${form.email.to}${qs ? "?" + qs : ""}`;
    }
    case "phone":    return `tel:${form.phone.number}`;
    case "sms":      return form.sms.message ? `smsto:${form.sms.number}:${form.sms.message}` : `smsto:${form.sms.number}`;
    case "wifi":     return `WIFI:T:${form.wifi.security};S:${form.wifi.ssid};P:${form.wifi.password};H:${form.wifi.hidden};;`;
    case "vcard": {
      const v = form.vcard;
      const lines = ["BEGIN:VCARD","VERSION:3.0",`FN:${v.firstName} ${v.lastName}`.trim(),`N:${v.lastName};${v.firstName};;;`];
      if (v.phone) lines.push(`TEL:${v.phone}`);
      if (v.email) lines.push(`EMAIL:${v.email}`);
      if (v.org)   lines.push(`ORG:${v.org}`);
      if (v.url)   lines.push(`URL:${v.url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "whatsapp": {
      const clean = form.whatsapp.number.replace(/\D/g, "");
      return form.whatsapp.message ? `https://wa.me/${clean}?text=${encodeURIComponent(form.whatsapp.message)}` : `https://wa.me/${clean}`;
    }
  }
}

/* ── Canvas helpers ─────────────────────────────────────────────────────── */
function fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill();
}

function strokeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.stroke();
}

function isFinderArea(row: number, col: number, size: number) {
  return (row < 8 && col < 8) || (row < 8 && col >= size - 8) || (row >= size - 8 && col < 8);
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, style: DotStyle) {
  switch (style) {
    case "square":        ctx.fillRect(x, y, s, s); break;
    case "rounded":       fillRoundRect(ctx, x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8, s * 0.25); break;
    case "dots":          ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * 0.42, 0, Math.PI * 2); ctx.fill(); break;
    case "extra-rounded": fillRoundRect(ctx, x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84, s * 0.45); break;
  }
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, m: number, outer: EyeOuter, inner: EyeInner, fg: string, bg: string) {
  const o = m * 7;
  ctx.fillStyle = fg;
  if (outer === "circle") { ctx.beginPath(); ctx.arc(x + o/2, y + o/2, o/2, 0, Math.PI * 2); ctx.fill(); }
  else fillRoundRect(ctx, x, y, o, o, outer === "rounded" ? m * 1.5 : 0);

  ctx.fillStyle = bg;
  fillRoundRect(ctx, x + m, y + m, m * 5, m * 5, outer !== "square" ? m * 0.6 : 0);

  ctx.fillStyle = fg;
  const cs = m * 3, cx = x + m * 2, cy = y + m * 2;
  if (inner === "circle") { ctx.beginPath(); ctx.arc(cx + cs/2, cy + cs/2, cs/2, 0, Math.PI * 2); ctx.fill(); }
  else fillRoundRect(ctx, cx, cy, cs, cs, inner === "rounded" ? m * 0.8 : 0);
}

async function renderQR(p: {
  text: string; outputSize: number; fgColor: string; bgColor: string; errorLevel: ErrorLevel;
  dotStyle: DotStyle; eyeOuter: EyeOuter; eyeInner: EyeInner;
  frameStyle: FrameStyle; frameColor: string; frameText: string;
  logoDataUrl: string | null; logoEmoji: LogoEmoji;
}): Promise<string | null> {
  if (!p.text.trim()) return null;
  const QRCode = await import("qrcode");
  let qr: { modules: { size: number; data: Uint8Array } };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qr = (QRCode as any).create(p.text, { errorCorrectionLevel: p.errorLevel });
  } catch { return null; }

  const mc = qr.modules.size;
  const margin = 2;
  const m = Math.max(4, Math.floor(p.outputSize / (mc + margin * 2)));
  const qrPx = m * (mc + margin * 2);

  const hasFrame = p.frameStyle !== "none";
  const hasScanText = ["scan-bottom","scan-rounded-bottom","scan-top"].includes(p.frameStyle);
  const framePad  = hasFrame ? m * 3 : 0;
  const frameTxtH = hasScanText ? Math.round(m * 6) : 0;

  const canvasW = qrPx + framePad * 2;
  const canvasH = qrPx + framePad * 2 + frameTxtH;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW; canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = p.bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  if (hasFrame) {
    const lw = Math.max(3, m * 0.8);
    ctx.strokeStyle = p.frameColor;
    ctx.lineWidth = lw;
    const isRounded = p.frameStyle === "rounded" || p.frameStyle === "scan-rounded-bottom";
    strokeRoundRect(ctx, lw / 2, lw / 2, canvasW - lw, canvasH - lw, isRounded ? m * 4 : m * 0.5);
  }

  const qrX = framePad;
  const qrY = p.frameStyle === "scan-top" ? framePad + frameTxtH : framePad;

  ctx.fillStyle = p.bgColor;
  ctx.fillRect(qrX, qrY, qrPx, qrPx);

  ctx.fillStyle = p.fgColor;
  for (let row = 0; row < mc; row++) {
    for (let col = 0; col < mc; col++) {
      if (!qr.modules.data[row * mc + col] || isFinderArea(row, col, mc)) continue;
      drawDot(ctx, qrX + (col + margin) * m, qrY + (row + margin) * m, m, p.dotStyle);
    }
  }

  for (const { r, c } of [{ r: margin, c: margin }, { r: margin, c: mc + margin - 7 }, { r: mc + margin - 7, c: margin }]) {
    drawEye(ctx, qrX + c * m, qrY + r * m, m, p.eyeOuter, p.eyeInner, p.fgColor, p.bgColor);
  }

  // Logo
  if (p.logoEmoji !== "none" || p.logoDataUrl) {
    const cx = qrX + qrPx / 2, cy = qrY + qrPx / 2;
    const logoR = m * 3.5;
    ctx.fillStyle = p.bgColor;
    ctx.beginPath(); ctx.arc(cx, cy, logoR * 1.15, 0, Math.PI * 2); ctx.fill();

    if (p.logoDataUrl) {
      await new Promise<void>(res => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, cx - logoR, cy - logoR, logoR * 2, logoR * 2); res(); };
        img.onerror = () => res();
        img.src = p.logoDataUrl!;
      });
    } else if (p.logoEmoji !== "none") {
      ctx.font = `${Math.round(m * 5.5)}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.logoEmoji, cx, cy);
    }
  }

  // Frame text
  if (hasScanText) {
    const textX = canvasW / 2;
    const textY = p.frameStyle === "scan-top" ? framePad / 2 + frameTxtH / 2 : qrY + qrPx + framePad / 2 + frameTxtH / 2;
    ctx.fillStyle = p.frameColor;
    ctx.font = `bold ${Math.round(frameTxtH * 0.52)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.letterSpacing = "0.1em";
    ctx.fillText(p.frameText || "SCAN ME", textX, textY);
  }

  return canvas.toDataURL("image/png");
}

/* ── Tiny UI helpers ───────────────────────────────────────────────────── */
const ic = "w-full bg-slate-800 border border-slate-700/60 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-600 focus:outline-none focus:border-blue-500/60";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-slate-400 text-xs block">{label}</label>{children}</div>;
}

/* ── Frame style thumbnails ─────────────────────────────────────────────── */
const FRAME_OPTIONS: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "None" }, { id: "square", label: "Square" }, { id: "rounded", label: "Rounded" },
  { id: "scan-bottom", label: "Scan ↓" }, { id: "scan-rounded-bottom", label: "Scan ↓ Round" }, { id: "scan-top", label: "Scan ↑" },
];

function FrameThumb({ style, active }: { style: FrameStyle; active: boolean }) {
  const base = `w-14 h-14 border-2 rounded-lg transition-all ${active ? "border-blue-400 bg-blue-500/10" : "border-slate-700 hover:border-slate-500"}`;
  if (style === "none") return (
    <div className={`${base} flex items-center justify-center`}>
      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" /><line x1="4.22" y1="4.22" x2="19.78" y2="19.78" />
      </svg>
    </div>
  );
  const isRounded = style === "rounded" || style === "scan-rounded-bottom";
  const hasScan = style.startsWith("scan");
  const scanTop = style === "scan-top";
  return (
    <div className={`${base} flex flex-col overflow-hidden p-0.5`}>
      {scanTop && <div className="bg-slate-500 text-[5px] font-bold text-center text-white" style={{ borderRadius: isRounded ? "3px 3px 0 0" : 0 }}>SCAN</div>}
      <div className="flex-1 m-0.5 bg-slate-700/30 rounded-sm flex items-center justify-center">
        <div className="grid grid-cols-3 gap-px">
          {Array.from({length:9}).map((_,i) => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-[1px]" />)}
        </div>
      </div>
      {!scanTop && hasScan && <div className="bg-slate-500 text-[5px] font-bold text-center text-white" style={{ borderRadius: isRounded ? "0 0 3px 3px" : 0 }}>SCAN</div>}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function QrPage() {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // QR settings
  const [outputSize, setOutputSize] = useState(512);
  const [fgColor,    setFgColor]    = useState("#000000");
  const [bgColor,    setBgColor]    = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");

  // Design
  const [designTab,  setDesignTab]  = useState<DesignTab>("frame");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [frameColor, setFrameColor] = useState("#000000");
  const [frameText,  setFrameText]  = useState("SCAN ME");
  const [dotStyle,   setDotStyle]   = useState<DotStyle>("square");
  const [eyeOuter,   setEyeOuter]   = useState<EyeOuter>("square");
  const [eyeInner,   setEyeInner]   = useState<EyeInner>("square");
  const [logoEmoji,  setLogoEmoji]  = useState<LogoEmoji>("none");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bulk mode
  const [bulkMode, setBulkMode]     = useState(false);
  const [bulkUrls, setBulkUrls]     = useState("");
  const [bulkResults, setBulkResults] = useState<{ url: string; dataUrl: string }[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const setField = <T extends ContentType>(type: T, patch: Partial<FormState[T]>) =>
    setForm(f => ({ ...f, [type]: { ...f[type], ...patch } }));

  const qrString = buildQrString(contentType, form);

  const regenerate = useCallback(async () => {
    const url = await renderQR({ text: qrString, outputSize, fgColor, bgColor, errorLevel, dotStyle, eyeOuter, eyeInner, frameStyle, frameColor, frameText, logoDataUrl, logoEmoji });
    if (url) { setDataUrl(url); setError(""); }
    else setError(qrString ? "Could not generate QR code — input may be too large." : "");
  }, [qrString, outputSize, fgColor, bgColor, errorLevel, dotStyle, eyeOuter, eyeInner, frameStyle, frameColor, frameText, logoDataUrl, logoEmoji]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(regenerate, 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [regenerate]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl; a.download = "qrcode.png"; a.click();
  };

  const copyImage = async () => {
    if (!dataUrl) return;
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* may not be available in all browsers */ }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setLogoDataUrl(reader.result as string); setLogoEmoji("none"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const generateBulk = useCallback(async () => {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(Boolean).slice(0, 20);
    if (urls.length === 0) return;
    setBulkLoading(true);
    setBulkResults([]);
    const results: { url: string; dataUrl: string }[] = [];
    for (const url of urls) {
      const du = await renderQR({ text: url, outputSize, fgColor, bgColor, errorLevel, dotStyle, eyeOuter, eyeInner, frameStyle, frameColor, frameText, logoDataUrl, logoEmoji });
      if (du) results.push({ url, dataUrl: du });
    }
    setBulkResults(results);
    setBulkLoading(false);
  }, [bulkUrls, outputSize, fgColor, bgColor, errorLevel, dotStyle, eyeOuter, eyeInner, frameStyle, frameColor, frameText, logoDataUrl, logoEmoji]);

  const downloadBulkZip = useCallback(async () => {
    if (bulkResults.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    bulkResults.forEach(({ url, dataUrl: du }, i) => {
      const base64 = du.split(",")[1];
      const slug = url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 40) || `qr_${i + 1}`;
      zip.file(`${String(i + 1).padStart(2, "0")}_${slug}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcodes.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [bulkResults]);

  const hasScanText = ["scan-bottom","scan-rounded-bottom","scan-top"].includes(frameStyle);

  const DOT_OPTIONS: { id: DotStyle; label: string }[] = [
    { id: "square", label: "Square" }, { id: "rounded", label: "Rounded" },
    { id: "dots", label: "Dots" }, { id: "extra-rounded", label: "Extra Round" },
  ];
  const EYE_OUTER_OPTS: { id: EyeOuter; label: string }[] = [
    { id: "square", label: "Square" }, { id: "rounded", label: "Rounded" }, { id: "circle", label: "Circle" },
  ];
  const EYE_INNER_OPTS: { id: EyeInner; label: string }[] = [
    { id: "square", label: "Square" }, { id: "rounded", label: "Rounded" }, { id: "circle", label: "Circle" },
  ];
  const LOGO_EMOJIS: LogoEmoji[] = ["none","🔗","📍","✉️","📞","📶","👤","💬","⭐","❤️"];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">QR Code Generator</h1>
            <p className="text-slate-500 text-sm">Generate QR codes for URLs, contacts, Wi-Fi, and more. Customize shape, frame, and logo.</p>
          </div>
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 mt-1">
            {(["Single", "Bulk"] as const).map(m => (
              <button key={m} onClick={() => setBulkMode(m === "Bulk")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${(m === "Bulk") === bulkMode ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk mode */}
        {bulkMode && (
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <label className="text-slate-400 text-xs mb-2 block">URLs — one per line (max 20). Uses your current design settings.</label>
              <textarea
                value={bulkUrls}
                onChange={e => setBulkUrls(e.target.value)}
                rows={8}
                placeholder={"https://example.com\nhttps://example.com/page2\nhttps://example.com/page3"}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-slate-600 text-xs">{bulkUrls.split("\n").map(u => u.trim()).filter(Boolean).length} / 20 URLs</span>
                <button onClick={generateBulk} disabled={bulkLoading || !bulkUrls.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                  {bulkLoading ? "Generating…" : "Generate all"}
                </button>
              </div>
            </div>

            {bulkResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-sm font-medium">{bulkResults.length} QR codes generated</p>
                  <button onClick={downloadBulkZip}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download ZIP
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bulkResults.map(({ url, dataUrl: du }, i) => (
                    <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex flex-col items-center gap-2">
                      <img src={du} alt={`QR ${i + 1}`} className="w-full rounded-lg" />
                      <p className="text-slate-500 text-[10px] truncate w-full text-center">{url}</p>
                      <a href={du} download={`qr_${i + 1}.png`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">↓ PNG</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single mode */}
        {!bulkMode && <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: content + design */}
          <div className="space-y-5">
            {/* Step 1: Content */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">1 — Content type</p>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setContentType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contentType === t.id ? "bg-blue-600 text-white" : "bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
              {contentType === "url" && (
                <Field label="Website URL">
                  <input value={form.url.url} onChange={e => setField("url", { url: e.target.value })} placeholder="https://example.com" className={ic} />
                </Field>
              )}
              {contentType === "text" && (
                <Field label="Text">
                  <textarea value={form.text.text} onChange={e => setField("text", { text: e.target.value })} rows={4} placeholder="Enter any text…" className={ic + " resize-none"} />
                </Field>
              )}
              {contentType === "email" && <>
                <Field label="To"><input value={form.email.to} onChange={e => setField("email", { to: e.target.value })} placeholder="name@example.com" type="email" className={ic} /></Field>
                <Field label="Subject (optional)"><input value={form.email.subject} onChange={e => setField("email", { subject: e.target.value })} placeholder="Hello!" className={ic} /></Field>
                <Field label="Body (optional)"><textarea value={form.email.body} onChange={e => setField("email", { body: e.target.value })} rows={3} className={ic + " resize-none"} /></Field>
              </>}
              {contentType === "phone" && (
                <Field label="Phone number"><input value={form.phone.number} onChange={e => setField("phone", { number: e.target.value })} placeholder="+1 234 567 8900" type="tel" className={ic} /></Field>
              )}
              {contentType === "sms" && <>
                <Field label="Phone number"><input value={form.sms.number} onChange={e => setField("sms", { number: e.target.value })} placeholder="+1 234 567 8900" type="tel" className={ic} /></Field>
                <Field label="Message (optional)"><textarea value={form.sms.message} onChange={e => setField("sms", { message: e.target.value })} rows={3} className={ic + " resize-none"} /></Field>
              </>}
              {contentType === "wifi" && <>
                <Field label="Network name (SSID)"><input value={form.wifi.ssid} onChange={e => setField("wifi", { ssid: e.target.value })} placeholder="My Network" className={ic} /></Field>
                <Field label="Password"><input value={form.wifi.password} onChange={e => setField("wifi", { password: e.target.value })} placeholder="••••••••" type="password" className={ic} /></Field>
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Security</p>
                    <div className="flex gap-1">
                      {(["WPA","WEP","nopass"] as const).map(s => (
                        <button key={s} onClick={() => setField("wifi", { security: s })}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${form.wifi.security === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                          {s === "nopass" ? "None" : s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" checked={form.wifi.hidden} onChange={e => setField("wifi", { hidden: e.target.checked })} className="accent-blue-500" />
                    <span className="text-slate-400 text-xs">Hidden network</span>
                  </label>
                </div>
              </>}
              {contentType === "vcard" && <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name"><input value={form.vcard.firstName} onChange={e => setField("vcard", { firstName: e.target.value })} placeholder="Jane" className={ic} /></Field>
                  <Field label="Last name"><input value={form.vcard.lastName} onChange={e => setField("vcard", { lastName: e.target.value })} placeholder="Doe" className={ic} /></Field>
                </div>
                <Field label="Phone"><input value={form.vcard.phone} onChange={e => setField("vcard", { phone: e.target.value })} placeholder="+1 234 567 8900" type="tel" className={ic} /></Field>
                <Field label="Email"><input value={form.vcard.email} onChange={e => setField("vcard", { email: e.target.value })} placeholder="jane@example.com" type="email" className={ic} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Organization"><input value={form.vcard.org} onChange={e => setField("vcard", { org: e.target.value })} placeholder="Acme Inc." className={ic} /></Field>
                  <Field label="Website"><input value={form.vcard.url} onChange={e => setField("vcard", { url: e.target.value })} placeholder="https://" className={ic} /></Field>
                </div>
              </>}
              {contentType === "whatsapp" && <>
                <Field label="Phone (with country code)"><input value={form.whatsapp.number} onChange={e => setField("whatsapp", { number: e.target.value })} placeholder="+1 234 567 8900" type="tel" className={ic} /></Field>
                <Field label="Pre-filled message (optional)"><textarea value={form.whatsapp.message} onChange={e => setField("whatsapp", { message: e.target.value })} rows={3} className={ic + " resize-none"} /></Field>
              </>}
            </div>

            {/* Step 2: Design */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">2 — Design</p>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
                {/* Design tabs */}
                <div className="flex border-b border-slate-800/60">
                  {(["frame","shape","logo"] as DesignTab[]).map(tab => (
                    <button key={tab} onClick={() => setDesignTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${designTab === tab ? "bg-blue-600/20 text-blue-300 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  {/* Frame tab */}
                  {designTab === "frame" && <>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Frame style</p>
                      <div className="flex flex-wrap gap-2">
                        {FRAME_OPTIONS.map(f => (
                          <button key={f.id} onClick={() => setFrameStyle(f.id)} title={f.label}>
                            <FrameThumb style={f.id} active={frameStyle === f.id} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Frame color">
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2">
                          <div className="relative w-6 h-6 rounded shrink-0">
                            <div className="w-full h-full rounded border border-white/10" style={{ background: frameColor }} />
                            <input type="color" value={frameColor} onChange={e => setFrameColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded" />
                          </div>
                          <span className="text-white text-xs font-mono">{frameColor}</span>
                        </div>
                      </Field>
                      {hasScanText && (
                        <Field label="Frame text">
                          <input value={frameText} onChange={e => setFrameText(e.target.value)} maxLength={16} className={ic} />
                        </Field>
                      )}
                    </div>
                  </>}

                  {/* Shape tab */}
                  {designTab === "shape" && <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Module color">
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2">
                          <div className="relative w-6 h-6 rounded shrink-0">
                            <div className="w-full h-full rounded border border-white/10" style={{ background: fgColor }} />
                            <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded" />
                          </div>
                          <span className="text-white text-xs font-mono">{fgColor}</span>
                        </div>
                      </Field>
                      <Field label="Background color">
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2">
                          <div className="relative w-6 h-6 rounded shrink-0">
                            <div className="w-full h-full rounded border border-white/10" style={{ background: bgColor }} />
                            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded" />
                          </div>
                          <span className="text-white text-xs font-mono">{bgColor}</span>
                        </div>
                      </Field>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Dot style</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {DOT_OPTIONS.map(d => (
                          <button key={d.id} onClick={() => setDotStyle(d.id)}
                            className={`py-2 rounded-lg text-xs border transition-colors ${dotStyle === d.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}>
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-xs mb-2">Finder outer</p>
                        <div className="flex flex-col gap-1">
                          {EYE_OUTER_OPTS.map(e => (
                            <button key={e.id} onClick={() => setEyeOuter(e.id)}
                              className={`py-1.5 rounded-lg text-xs border transition-colors ${eyeOuter === e.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}>
                              {e.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-2">Finder center</p>
                        <div className="flex flex-col gap-1">
                          {EYE_INNER_OPTS.map(e => (
                            <button key={e.id} onClick={() => setEyeInner(e.id)}
                              className={`py-1.5 rounded-lg text-xs border transition-colors ${eyeInner === e.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}>
                              {e.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Error correction (higher = logo-friendly)</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {ERROR_LEVELS.map(lvl => (
                          <button key={lvl} onClick={() => setErrorLevel(lvl)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${errorLevel === lvl ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <p className="text-slate-600 text-xs mt-1">L=7% · M=15% · Q=25% · H=30% recovery</p>
                    </div>
                    <Field label={`Output size: ${outputSize}×${outputSize}px`}>
                      <input type="range" min={256} max={1024} step={64} value={outputSize} onChange={e => setOutputSize(Number(e.target.value))} className="w-full accent-blue-500" />
                    </Field>
                  </>}

                  {/* Logo tab */}
                  {designTab === "logo" && <>
                    <p className="text-slate-500 text-xs">Use H or Q error correction when adding a logo.</p>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Upload logo</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => logoFileRef.current?.click()}
                          className="flex-1 py-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                          {logoDataUrl ? "Change image" : "Choose file…"}
                        </button>
                        {logoDataUrl && (
                          <button onClick={() => setLogoDataUrl(null)}
                            className="px-3 py-2 text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 rounded-lg transition-colors">
                            Remove
                          </button>
                        )}
                        <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Or choose an icon</p>
                      <div className="flex flex-wrap gap-2">
                        {LOGO_EMOJIS.map(e => (
                          <button key={e} onClick={() => { setLogoEmoji(e); if (e !== "none") setLogoDataUrl(null); }}
                            className={`w-10 h-10 rounded-lg border text-lg transition-colors flex items-center justify-center ${(logoDataUrl ? e === "none" && false : logoEmoji === e) ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}>
                            {e === "none" ? (
                              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><line x1="4.22" y1="4.22" x2="19.78" y2="19.78" /></svg>
                            ) : e}
                          </button>
                        ))}
                      </div>
                    </div>
                    {logoDataUrl && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg">
                        <img src={logoDataUrl} className="w-10 h-10 rounded object-contain bg-white" alt="logo" />
                        <span className="text-slate-400 text-xs">Custom logo uploaded</span>
                      </div>
                    )}
                  </>}
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview + download */}
          <div className="flex flex-col gap-4">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 flex items-center justify-center min-h-[300px]">
                {error ? (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                ) : dataUrl ? (
                  <img src={dataUrl} alt="QR Code" className="max-w-full rounded-xl shadow-xl" />
                ) : (
                  <p className="text-slate-600 text-sm text-center">Fill in the content above to generate your QR code</p>
                )}
              </div>
              {dataUrl && (
                <div className="space-y-2">
                  <button onClick={download}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PNG
                  </button>
                  <button onClick={copyImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {copied ? "Copied!" : "Copy image"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>}

        <RelatedTools current="/tools/qr" />
      </div>
    </div>
  );
}
