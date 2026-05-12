import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — FileFlow",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileFlow
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose-slate space-y-8 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Overview</h2>
            <p>
              FileFlow is a free file conversion tool. We are committed to protecting your privacy.
              This policy explains what data (if any) we collect and how we handle your files.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Files You Upload</h2>
            <p>
              Files you upload for conversion are processed solely for the purpose of converting them.
              They are <strong className="text-slate-200">never stored, logged, shared, or sold</strong>.
              Server-side conversions delete the file immediately after the converted result is returned to you.
            </p>
            <p className="mt-3">
              Video, audio, and GIF conversions happen entirely in your browser using WebAssembly — your files
              are never sent to our servers at all.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Conversion History</h2>
            <p>
              FileFlow stores a history of your past conversions (file names, sizes, formats) locally in your
              browser&apos;s <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded text-xs">localStorage</code>.
              This data never leaves your device. You can clear it at any time from the History panel.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Cookies &amp; Tracking</h2>
            <p>
              We do not use tracking cookies, advertising cookies, or third-party analytics. No personal
              data is collected, processed, or transmitted to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Hosting</h2>
            <p>
              FileFlow is hosted on <a href="https://vercel.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Vercel</a>.
              Vercel may log standard server request metadata (IP address, timestamp, HTTP method) for
              security and reliability purposes. Refer to{" "}
              <a href="https://vercel.com/legal/privacy-policy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Vercel&apos;s Privacy Policy
              </a>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Children&apos;s Privacy</h2>
            <p>
              FileFlow is not directed at children under 13. We do not knowingly collect any information
              from children.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Continued use of FileFlow after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
