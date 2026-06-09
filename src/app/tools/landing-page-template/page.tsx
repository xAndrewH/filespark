"use client";

import { useState } from "react";
import Link from "next/link";

const CHECKLIST = [
  {
    category: "Hero / Above the Fold",
    color: "blue",
    items: [
      { id: "hero-headline",       text: "Clear, benefit-driven headline (what you do in one line)" },
      { id: "hero-subhead",        text: "Supporting subheadline that adds context or removes doubt" },
      { id: "hero-cta",            text: "Primary CTA button | one action, action-oriented text (e.g. 'Get Started Free')" },
      { id: "hero-visual",         text: "Hero image, screenshot, or short demo video" },
      { id: "hero-above-fold",     text: "CTA visible without scrolling on mobile" },
      { id: "hero-no-nav-clutter", text: "Minimal navigation | don't distract from the CTA" },
    ],
  },
  {
    category: "Value Proposition",
    color: "violet",
    items: [
      { id: "vp-problem",        text: "Clearly state the problem you solve" },
      { id: "vp-solution",       text: "Explain your solution in plain language (no jargon)" },
      { id: "vp-differentiator", text: "Call out what makes you different from competitors" },
      { id: "vp-audience",       text: "Make it obvious who this is for" },
      { id: "vp-outcome",        text: "Focus on outcome/benefit, not just features" },
    ],
  },
  {
    category: "Social Proof",
    color: "green",
    items: [
      { id: "sp-testimonials", text: "At least 3 customer testimonials with name, photo, and role" },
      { id: "sp-logos",        text: "Recognizable customer or partner logos" },
      { id: "sp-numbers",      text: "Key stats (e.g. '10,000+ customers', '4.9 stars')" },
      { id: "sp-reviews",      text: "Star ratings or review count from G2 / Capterra / Trustpilot" },
      { id: "sp-case-studies", text: "Link to at least one case study or success story" },
      { id: "sp-press",        text: "'As seen in' press logos if applicable" },
    ],
  },
  {
    category: "Features & Benefits",
    color: "amber",
    items: [
      { id: "feat-benefits",   text: "Lead with benefits, back them up with features" },
      { id: "feat-3-5",        text: "3–5 key features | more than 5 causes decision fatigue" },
      { id: "feat-icons",      text: "Icons or visuals for each feature to aid scannability" },
      { id: "feat-proof",      text: "Each feature tied to a concrete outcome or proof point" },
      { id: "feat-comparison", text: "Comparison table vs. competitors or old way (if relevant)" },
    ],
  },
  {
    category: "Calls to Action",
    color: "pink",
    items: [
      { id: "cta-repeat",   text: "CTA repeated at least 3× | hero, mid-page, and bottom" },
      { id: "cta-single",   text: "One primary CTA per section (avoid multiple competing actions)" },
      { id: "cta-friction", text: "Reduce friction | 'No credit card required', 'Free forever', etc." },
      { id: "cta-contrast", text: "CTA button color contrasts with background (stands out)" },
      { id: "cta-urgency",  text: "Optional: urgency or scarcity element near CTA" },
    ],
  },
  {
    category: "Trust & Objection Handling",
    color: "cyan",
    items: [
      { id: "trust-money-back", text: "Money-back guarantee or free trial offer" },
      { id: "trust-security",   text: "Security badges, SSL indicator, encryption mention" },
      { id: "trust-privacy",    text: "Privacy reassurance near email/form fields" },
      { id: "trust-faq",        text: "FAQ section addressing top 5 objections" },
      { id: "trust-contact",    text: "Visible contact info or live chat (shows you're real)" },
      { id: "trust-refund",     text: "Clear refund / cancellation policy" },
    ],
  },
  {
    category: "SEO & Technical",
    color: "slate",
    items: [
      { id: "seo-title",     text: "Page title tag includes primary keyword (under 60 chars)" },
      { id: "seo-meta",      text: "Meta description written for click-through (under 160 chars)" },
      { id: "seo-og",        text: "Open Graph tags (og:title, og:description, og:image) for social sharing" },
      { id: "seo-h1",        text: "Single H1 tag matching your headline" },
      { id: "seo-speed",     text: "Page loads in under 3 seconds on mobile (test with PageSpeed Insights)" },
      { id: "seo-mobile",    text: "Fully responsive | tested on iOS and Android" },
      { id: "seo-analytics", text: "Analytics installed (GA4, Plausible, etc.)" },
      { id: "seo-canonical", text: "Canonical URL set to avoid duplicate content" },
    ],
  },
  {
    category: "Conversion Optimization",
    color: "orange",
    items: [
      { id: "cro-heatmap",    text: "Heatmap tool installed (Hotjar, Microsoft Clarity)" },
      { id: "cro-ab",         text: "A/B test your headline and primary CTA" },
      { id: "cro-exit",       text: "Exit-intent popup or last-chance offer" },
      { id: "cro-form",       text: "Forms ask for minimal info (email only if possible)" },
      { id: "cro-thank-you",  text: "Thank-you page with next step after conversion" },
      { id: "cro-retargeting",text: "Retargeting pixel installed for ad campaigns" },
    ],
  },
];

const COLOR_MAP: Record<string, { badge: string; bar: string }> = {
  blue:   { badge: "bg-blue-500/15 text-blue-400",    bar: "bg-blue-500" },
  violet: { badge: "bg-violet-500/15 text-violet-400", bar: "bg-violet-500" },
  green:  { badge: "bg-green-500/15 text-green-400",   bar: "bg-green-500" },
  amber:  { badge: "bg-amber-500/15 text-amber-400",   bar: "bg-amber-500" },
  pink:   { badge: "bg-pink-500/15 text-pink-400",     bar: "bg-pink-500" },
  cyan:   { badge: "bg-cyan-500/15 text-cyan-400",     bar: "bg-cyan-500" },
  slate:  { badge: "bg-slate-700/60 text-slate-300",   bar: "bg-slate-400" },
  orange: { badge: "bg-orange-500/15 text-orange-400", bar: "bg-orange-500" },
};

export default function LandingPageChecklistPage() {
  const allIds = CHECKLIST.flatMap(c => c.items.map(i => i.id));
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const totalItems   = allIds.length;
  const totalChecked = checked.size;
  const overallPct   = Math.round((totalChecked / totalItems) * 100);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Landing Page Checklist</h1>
        <p className="text-slate-400 text-sm mb-8">Everything your landing page needs to convert visitors into customers.</p>

        {/* Overall progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">{totalChecked} / {totalItems} completed</span>
            <span className="text-2xl font-bold text-white">{overallPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setChecked(new Set(allIds))} className="text-xs text-slate-400 hover:text-white transition-colors">Check all</button>
            <span className="text-slate-700">·</span>
            <button onClick={() => setChecked(new Set())} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Reset</button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-5">
          {CHECKLIST.map(({ category, color, items }) => {
            const colors    = COLOR_MAP[color];
            const catChecked = items.filter(i => checked.has(i.id)).length;
            const catPct    = Math.round((catChecked / items.length) * 100);

            return (
              <div key={category} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>{category}</span>
                  <span className="text-xs text-slate-500">{catChecked}/{items.length}</span>
                </div>
                <div className="h-0.5 bg-slate-800">
                  <div className={`h-full ${colors.bar} transition-all duration-300`} style={{ width: `${catPct}%` }} />
                </div>
                <div className="divide-y divide-slate-800/60">
                  {items.map(item => {
                    const isDone = checked.has(item.id);
                    return (
                      <label key={item.id} className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors ${
                          isDone ? `${colors.bar} border-transparent` : "border-slate-600 bg-slate-800"
                        }`}>
                          {isDone && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm leading-snug transition-colors ${isDone ? "text-slate-500 line-through" : "text-slate-300"}`}>
                          {item.text}
                        </span>
                        <input type="checkbox" className="sr-only" checked={isDone} onChange={() => toggle(item.id)} />
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-slate-600 text-xs text-center mt-8">Progress resets on page refresh.</p>
      </div>
    </div>
  );
}
