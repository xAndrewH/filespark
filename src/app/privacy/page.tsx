import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FileSpark",
  description:
    "FileSpark never stores your files. All conversions happen in your browser or in-memory on our servers. No cookies, no tracking, no personal data collected.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | FileSpark",
    description:
      "FileSpark never stores your files. All conversions happen in your browser or in-memory on our servers. No cookies, no tracking, no personal data collected.",
    url: "/privacy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | FileSpark",
    description:
      "FileSpark never stores your files. All conversions happen in your browser or in-memory on our servers. No cookies, no tracking, no personal data collected.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileSpark
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose-slate space-y-8 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Overview</h2>
            <p>
              FileSpark is a file conversion and browser tools platform. We are committed to protecting your privacy.
              This policy explains what data (if any) we collect and how we handle your files.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Files You Upload</h2>
            <p>
              Files you upload for conversion are processed solely for the purpose of converting them.
              They are <strong className="text-slate-200">never stored, logged, shared, or sold</strong>.
              Server-side conversions process files in memory and discard them immediately after the converted
              result is returned to you.
            </p>
            <p className="mt-3">
              Video, audio, GIF, and image conversions (JPEG, PNG, WEBP, HEIC, and more) happen entirely
              in your browser. Your files are never sent to our servers at all.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Conversion History</h2>
            <p>
              FileSpark stores a history of your past conversions (file names, sizes, formats) locally in your
              browser&apos;s <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded text-xs">localStorage</code>.
              This data never leaves your device. You can clear it at any time from the History panel.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Cookies &amp; Tracking</h2>
            <p>
              FileSpark does not use cookies of any kind | no tracking cookies, advertising cookies, session cookies,
              or third-party analytics cookies. We do not use Google Analytics, Meta Pixel, or any other tracking
              service. No personal data is collected, processed, or transmitted to any advertising or analytics
              third party.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Third-Party API (CloudConvert)</h2>
            <p>
              Document and eBook conversions optionally use{" "}
              <a href="https://cloudconvert.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">CloudConvert</a>.
              If you choose to use this feature, you provide your own CloudConvert API key and your files are sent
              directly to CloudConvert&apos;s servers under their{" "}
              <a href="https://cloudconvert.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>.
              FileSpark never sees or stores your CloudConvert API key on our servers | it is saved only in your
              browser&apos;s <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded text-xs">localStorage</code>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Hosting</h2>
            <p>
              FileSpark is hosted on <a href="https://vercel.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Vercel</a>.
              Vercel may log standard server request metadata (IP address, timestamp, HTTP method, user agent) for
              security and reliability purposes. This data is handled under{" "}
              <a href="https://vercel.com/legal/privacy-policy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Vercel&apos;s Privacy Policy
              </a>.
              FileSpark does not access or store these server logs.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">GDPR (European Users)</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have certain rights under the General
              Data Protection Regulation (GDPR). Because FileSpark does not collect, store, or process any personal
              data, there is no personal data to access, correct, or delete. The only data that exists is stored
              locally in your browser and is fully under your control.
            </p>
            <p className="mt-3">
              If you have questions about your rights or our data practices, contact us at{" "}
              <a href="mailto:privacy@filespark.app" className="text-blue-400 hover:underline">privacy@filespark.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">CCPA (California Users)</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) gives you the right
              to know what personal information is collected about you and to request its deletion. FileSpark does
              not collect, sell, or share any personal information. We do not sell personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Children&apos;s Privacy</h2>
            <p>
              FileSpark is not directed at children under 13. We do not knowingly collect any information
              from children under 13. If you believe a child has provided personal information, contact us
              and we will take steps to remove it.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Continued use of FileSpark after changes
              constitutes acceptance of the updated policy. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@filespark.app" className="text-blue-400 hover:underline">privacy@filespark.app</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
