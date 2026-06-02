"use client";

import { useState } from "react";
import Link from "next/link";

interface Feature {
  emoji: string;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: Feature[] = [
  { emoji: "⚡", title: "Lightning Fast", description: "Optimized for performance from the ground up." },
  { emoji: "🔒", title: "Secure by Default", description: "Enterprise-grade security built in at every layer." },
  { emoji: "🎯", title: "Easy to Use", description: "Intuitive interface that gets out of your way." },
];

function generateHTML(opts: {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  features: Feature[];
  footerText: string;
  darkTheme: boolean;
}) {
  const { headline, subheadline, ctaText, ctaUrl, features, footerText, darkTheme } = opts;

  const bg = darkTheme ? "#0f172a" : "#ffffff";
  const cardBg = darkTheme ? "#1e293b" : "#f8fafc";
  const cardBorder = darkTheme ? "#334155" : "#e2e8f0";
  const text = darkTheme ? "#f1f5f9" : "#0f172a";
  const subtext = darkTheme ? "#94a3b8" : "#64748b";
  const heroBg = darkTheme
    ? "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)"
    : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)";
  const accent = "#3b82f6";
  const footerBg = darkTheme ? "#0a1628" : "#f1f5f9";
  const footerText2 = darkTheme ? "#64748b" : "#94a3b8";

  const featureCards = features
    .filter(f => f.title.trim())
    .map(
      f => `      <div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:16px;padding:28px 24px;">
        <div style="font-size:36px;margin-bottom:12px;">${f.emoji || "✨"}</div>
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:${text};">${f.title}</h3>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${subtext};">${f.description}</p>
      </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline || "Landing Page"}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: ${bg}; color: ${text}; min-height: 100vh; }
    a { color: inherit; text-decoration: none; }
    .hero { background: ${heroBg}; padding: 100px 24px 80px; text-align: center; }
    .hero h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 20px; }
    .hero p { font-size: clamp(16px, 2vw, 20px); color: ${subtext}; max-width: 600px; margin: 0 auto 36px; line-height: 1.6; }
    .cta-btn { display: inline-block; background: ${accent}; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 10px; transition: opacity .15s; }
    .cta-btn:hover { opacity: .85; }
    .features { max-width: 1080px; margin: 0 auto; padding: 80px 24px; }
    .features h2 { text-align: center; font-size: clamp(24px, 3vw, 36px); font-weight: 700; margin-bottom: 48px; color: ${text}; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    footer { background: ${footerBg}; border-top: 1px solid ${cardBorder}; text-align: center; padding: 32px 24px; font-size: 14px; color: ${footerText2}; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>${headline || "Your Headline Here"}</h1>
    <p>${subheadline || "A compelling subheadline that explains your value proposition."}</p>
    <a href="${ctaUrl || "#"}" class="cta-btn">${ctaText || "Get Started"}</a>
  </section>

  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="features-grid">
${featureCards}
    </div>
  </section>

  <footer>
    <p>${footerText || "© 2024 Your Company. All rights reserved."}</p>
  </footer>
</body>
</html>`;
}

export default function LandingPageTemplatePage() {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [headline, setHeadline] = useState("Build Something Amazing");
  const [subheadline, setSubheadline] = useState("The all-in-one platform that helps teams ship faster, smarter, and with confidence.");
  const [ctaText, setCtaText] = useState("Get Started Free");
  const [ctaUrl, setCtaUrl] = useState("https://example.com");
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [footerText, setFooterText] = useState("© 2024 YourCompany, Inc. All rights reserved.");
  const [darkTheme, setDarkTheme] = useState(true);
  const [copied, setCopied] = useState(false);

  const html = generateHTML({ headline, subheadline, ctaText, ctaUrl, features, footerText, darkTheme });

  const updateFeature = (i: number, field: keyof Feature, value: string) => {
    setFeatures(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f));
  };

  const copyHTML = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Landing Page Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Fill in your content and get a complete, styled HTML landing page.</p>

        {/* Tabs + controls */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {(["edit", "preview"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white bg-slate-800/60"}`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1" />
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <span>Dark theme</span>
            <button
              role="switch"
              aria-checked={darkTheme}
              onClick={() => setDarkTheme(d => !d)}
              className={`w-9 h-5 rounded-full transition-colors relative ${darkTheme ? "bg-blue-600" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkTheme ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>
          <button
            onClick={copyHTML}
            className="ml-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {copied ? "Copied!" : "Copy HTML"}
          </button>
        </div>

        {tab === "edit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hero section */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h2 className="text-white text-sm font-semibold">Hero Section</h2>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Headline</label>
                <input
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="Your main headline"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Subheadline</label>
                <textarea
                  value={subheadline}
                  onChange={e => setSubheadline(e.target.value)}
                  rows={2}
                  placeholder="Supporting text below the headline"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">CTA Text</label>
                  <input
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="Get Started"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">CTA URL</label>
                  <input
                    value={ctaUrl}
                    onChange={e => setCtaUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h2 className="text-white text-sm font-semibold">Features (up to 3)</h2>
              {features.map((f, i) => (
                <div key={i} className="space-y-2 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="flex gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-400">Icon</label>
                      <input
                        value={f.emoji}
                        onChange={e => updateFeature(i, "emoji", e.target.value)}
                        placeholder="⚡"
                        className="w-14 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 text-center"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="block text-xs font-medium text-slate-400">Title</label>
                      <input
                        value={f.title}
                        onChange={e => updateFeature(i, "title", e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-400">Description</label>
                    <input
                      value={f.description}
                      onChange={e => updateFeature(i, "description", e.target.value)}
                      placeholder="Brief description of this feature"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3 lg:col-span-2">
              <h2 className="text-white text-sm font-semibold">Footer</h2>
              <input
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                placeholder="© 2024 Your Company. All rights reserved."
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
            <iframe
              srcDoc={html}
              title="Landing page preview"
              className="w-full"
              style={{ height: "600px", border: "none" }}
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
