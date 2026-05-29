"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;
type ErrorLevel = typeof ERROR_LEVELS[number];

type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "whatsapp";

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: "url",      label: "URL / Link" },
  { id: "text",     label: "Text" },
  { id: "email",    label: "Email" },
  { id: "phone",    label: "Phone" },
  { id: "sms",      label: "SMS" },
  { id: "wifi",     label: "Wi-Fi" },
  { id: "vcard",    label: "Contact" },
  { id: "whatsapp", label: "WhatsApp" },
];

// Form state per content type
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

function buildQrString(type: ContentType, form: FormState): string {
  switch (type) {
    case "url":
      return form.url.url || "https://";
    case "text":
      return form.text.text;
    case "email": {
      const { to, subject, body } = form.email;
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body)    params.set("body", body);
      const qs = params.toString();
      return `mailto:${to}${qs ? "?" + qs : ""}`;
    }
    case "phone":
      return `tel:${form.phone.number}`;
    case "sms": {
      const { number, message } = form.sms;
      return message ? `smsto:${number}:${message}` : `smsto:${number}`;
    }
    case "wifi": {
      const { ssid, password, security, hidden } = form.wifi;
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`;
    }
    case "vcard": {
      const { firstName, lastName, phone, email, org, url } = form.vcard;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${firstName} ${lastName}`.trim(),
        `N:${lastName};${firstName};;;`,
      ];
      if (phone) lines.push(`TEL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (org)   lines.push(`ORG:${org}`);
      if (url)   lines.push(`URL:${url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "whatsapp": {
      const { number, message } = form.whatsapp;
      const clean = number.replace(/\D/g, "");
      return message
        ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${clean}`;
    }
  }
}

const DEFAULT_FORM: FormState = {
  url:      { url: "https://" },
  text:     { text: "" },
  email:    { to: "", subject: "", body: "" },
  phone:    { number: "" },
  sms:      { number: "", message: "" },
  wifi:     { ssid: "", password: "", security: "WPA", hidden: false },
  vcard:    { firstName: "", lastName: "", phone: "", email: "", org: "", url: "" },
  whatsapp: { number: "", message: "" },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-slate-400 text-xs block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-slate-800 border border-slate-700/60 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-600 focus:outline-none focus:border-blue-500/60";

export default function QrPage() {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [size, setSize]           = useState(256);
  const [fgColor, setFgColor]     = useState("#ffffff");
  const [bgColor, setBgColor]     = useState("#0f172a");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [dataUrl, setDataUrl]     = useState<string | null>(null);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  const setField = <T extends ContentType>(type: T, patch: Partial<FormState[T]>) => {
    setForm(f => ({ ...f, [type]: { ...f[type], ...patch } }));
  };

  const qrString = buildQrString(contentType, form);

  useEffect(() => {
    if (!qrString.trim()) { setDataUrl(null); return; }
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(qrString, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      }).then((url) => {
        if (!cancelled) { setDataUrl(url); setError(""); }
      }).catch((e: Error) => {
        if (!cancelled) { setError(e.message); setDataUrl(null); }
      });
    });
    return () => { cancelled = true; };
  }, [qrString, size, fgColor, bgColor, errorLevel]);

  const download = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  };

  const copyImage = async () => {
    if (!dataUrl) return;
    try {
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard API may not be available */ }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">QR Code Generator</h1>
          <p className="text-slate-500 text-sm">Generate QR codes for URLs, contacts, Wi-Fi, and more.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left: content + design */}
          <div className="space-y-5">
            {/* Content type tabs */}
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Content type</p>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setContentType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contentType === t.id ? "bg-blue-600 text-white" : "bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content form */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
              {contentType === "url" && (
                <Field label="URL">
                  <input value={form.url.url} onChange={e => setField("url", { url: e.target.value })}
                    placeholder="https://example.com" className={inputCls} />
                </Field>
              )}

              {contentType === "text" && (
                <Field label="Text content">
                  <textarea value={form.text.text} onChange={e => setField("text", { text: e.target.value })}
                    placeholder="Enter any text…" rows={4}
                    className={inputCls + " resize-none"} />
                </Field>
              )}

              {contentType === "email" && (
                <>
                  <Field label="To">
                    <input value={form.email.to} onChange={e => setField("email", { to: e.target.value })}
                      placeholder="name@example.com" type="email" className={inputCls} />
                  </Field>
                  <Field label="Subject (optional)">
                    <input value={form.email.subject} onChange={e => setField("email", { subject: e.target.value })}
                      placeholder="Hello!" className={inputCls} />
                  </Field>
                  <Field label="Body (optional)">
                    <textarea value={form.email.body} onChange={e => setField("email", { body: e.target.value })}
                      placeholder="Message body…" rows={3} className={inputCls + " resize-none"} />
                  </Field>
                </>
              )}

              {contentType === "phone" && (
                <Field label="Phone number">
                  <input value={form.phone.number} onChange={e => setField("phone", { number: e.target.value })}
                    placeholder="+1 234 567 8900" type="tel" className={inputCls} />
                </Field>
              )}

              {contentType === "sms" && (
                <>
                  <Field label="Phone number">
                    <input value={form.sms.number} onChange={e => setField("sms", { number: e.target.value })}
                      placeholder="+1 234 567 8900" type="tel" className={inputCls} />
                  </Field>
                  <Field label="Message (optional)">
                    <textarea value={form.sms.message} onChange={e => setField("sms", { message: e.target.value })}
                      placeholder="Pre-filled message…" rows={3} className={inputCls + " resize-none"} />
                  </Field>
                </>
              )}

              {contentType === "wifi" && (
                <>
                  <Field label="Network name (SSID)">
                    <input value={form.wifi.ssid} onChange={e => setField("wifi", { ssid: e.target.value })}
                      placeholder="My Network" className={inputCls} />
                  </Field>
                  <Field label="Password">
                    <input value={form.wifi.password} onChange={e => setField("wifi", { password: e.target.value })}
                      placeholder="••••••••" type="password" className={inputCls} />
                  </Field>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Security</p>
                      <div className="flex gap-1">
                        {(["WPA", "WEP", "nopass"] as const).map(s => (
                          <button key={s} onClick={() => setField("wifi", { security: s })}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${form.wifi.security === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                            {s === "nopass" ? "None" : s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                      <input type="checkbox" checked={form.wifi.hidden}
                        onChange={e => setField("wifi", { hidden: e.target.checked })}
                        className="accent-blue-500" />
                      <span className="text-slate-400 text-xs">Hidden network</span>
                    </label>
                  </div>
                </>
              )}

              {contentType === "vcard" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name">
                      <input value={form.vcard.firstName} onChange={e => setField("vcard", { firstName: e.target.value })}
                        placeholder="Jane" className={inputCls} />
                    </Field>
                    <Field label="Last name">
                      <input value={form.vcard.lastName} onChange={e => setField("vcard", { lastName: e.target.value })}
                        placeholder="Doe" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Phone">
                    <input value={form.vcard.phone} onChange={e => setField("vcard", { phone: e.target.value })}
                      placeholder="+1 234 567 8900" type="tel" className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <input value={form.vcard.email} onChange={e => setField("vcard", { email: e.target.value })}
                      placeholder="jane@example.com" type="email" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Organization (optional)">
                      <input value={form.vcard.org} onChange={e => setField("vcard", { org: e.target.value })}
                        placeholder="Acme Inc." className={inputCls} />
                    </Field>
                    <Field label="Website (optional)">
                      <input value={form.vcard.url} onChange={e => setField("vcard", { url: e.target.value })}
                        placeholder="https://" className={inputCls} />
                    </Field>
                  </div>
                </>
              )}

              {contentType === "whatsapp" && (
                <>
                  <Field label="Phone number (with country code)">
                    <input value={form.whatsapp.number} onChange={e => setField("whatsapp", { number: e.target.value })}
                      placeholder="+1 234 567 8900" type="tel" className={inputCls} />
                  </Field>
                  <Field label="Pre-filled message (optional)">
                    <textarea value={form.whatsapp.message} onChange={e => setField("whatsapp", { message: e.target.value })}
                      placeholder="Hi! I found your contact via QR code…" rows={3} className={inputCls + " resize-none"} />
                  </Field>
                </>
              )}

              {/* QR data preview */}
              {qrString && qrString !== "https://" && (
                <div className="mt-1 pt-3 border-t border-slate-800/60">
                  <p className="text-slate-600 text-[11px] font-mono break-all leading-relaxed">{qrString.slice(0, 200)}{qrString.length > 200 ? "…" : ""}</p>
                </div>
              )}
            </div>

            {/* Design */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <p className="text-white text-sm font-semibold">Design</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Module color">
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2">
                    <div className="relative w-6 h-6 rounded shrink-0">
                      <div className="w-full h-full rounded" style={{ background: fgColor }} />
                      <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded" />
                    </div>
                    <span className="text-white text-xs font-mono">{fgColor}</span>
                  </div>
                </Field>
                <Field label="Background color">
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2">
                    <div className="relative w-6 h-6 rounded shrink-0">
                      <div className="w-full h-full rounded" style={{ background: bgColor }} />
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded" />
                    </div>
                    <span className="text-white text-xs font-mono">{bgColor}</span>
                  </div>
                </Field>
              </div>

              <Field label={`Size: ${size}×${size}px`}>
                <input type="range" min={128} max={1024} step={64} value={size}
                  onChange={e => setSize(Number(e.target.value))}
                  className="w-full accent-blue-500" />
              </Field>

              <div>
                <p className="text-slate-400 text-xs mb-2">Error correction</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ERROR_LEVELS.map(lvl => (
                    <button key={lvl} onClick={() => setErrorLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${errorLevel === lvl ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-1.5">L=7% · M=15% · Q=25% · H=30% recovery</p>
              </div>
            </div>
          </div>

          {/* Right: preview + download */}
          <div className="flex flex-col gap-4">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 flex items-center justify-center min-h-[280px]">
                {error ? (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                ) : dataUrl ? (
                  <img src={dataUrl} alt="QR Code" className="max-w-full rounded-lg shadow-xl" />
                ) : (
                  <p className="text-slate-600 text-sm text-center">Fill in the content to generate your QR code</p>
                )}
              </div>

              {dataUrl && (
                <div className="space-y-2">
                  <button onClick={download}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PNG
                  </button>
                  <button onClick={copyImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? "Copied!" : "Copy image"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
