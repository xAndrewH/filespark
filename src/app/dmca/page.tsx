import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DMCA Policy | FileSpark",
  description:
    "FileSpark's DMCA policy. We respect intellectual property rights and respond promptly to valid copyright takedown notices.",
  alternates: { canonical: "/dmca" },
  openGraph: {
    title: "DMCA Policy | FileSpark",
    description:
      "FileSpark's DMCA policy. We respect intellectual property rights and respond promptly to valid copyright takedown notices.",
    url: "/dmca",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DMCA Policy | FileSpark",
    description:
      "FileSpark's DMCA policy. We respect intellectual property rights and respond promptly to valid copyright takedown notices.",
  },
};

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileSpark
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">DMCA Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose-slate space-y-8 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Overview</h2>
            <p>
              FileSpark respects the intellectual property rights of others and expects users of the service to do the same.
              In accordance with the Digital Millennium Copyright Act of 1998 (the &quot;DMCA&quot;), FileSpark will respond
              expeditiously to claims of copyright infringement that are reported to our designated copyright agent.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">How FileSpark Works</h2>
            <p>
              FileSpark is a client-side file conversion tool. The vast majority of conversions happen entirely within
              your browser — files are never uploaded to or stored on our servers. For conversions that do pass through
              our servers (such as document conversions), files are processed in memory and immediately discarded.
              We do not host, store, or distribute user-uploaded content.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Reporting Copyright Infringement</h2>
            <p>
              If you believe that content available through FileSpark infringes your copyright, you may submit a DMCA
              takedown notice to our designated agent. Your notice must include all of the following:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside marker:text-slate-600">
              <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing, with enough detail for us to locate it.</li>
              <li>Your contact information: name, address, telephone number, and email address.</li>
              <li>
                A statement that you have a good faith belief that use of the material is not authorized by the copyright
                owner, its agent, or the law.
              </li>
              <li>
                A statement that the information in the notice is accurate, and, under penalty of perjury, that you are
                authorized to act on behalf of the copyright owner.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Designated Copyright Agent</h2>
            <p>Send DMCA notices to:</p>
            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 text-sm">
              <p className="font-medium text-white">FileSpark DMCA Agent</p>
              <p className="mt-1">Email: <a href="mailto:dmca@filespark.app" className="text-blue-400 hover:underline">dmca@filespark.app</a></p>
            </div>
            <p className="mt-3 text-slate-500 text-xs">
              We will review and respond to valid DMCA notices within a reasonable time. Incomplete notices may be
              rejected without response.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Counter-Notification</h2>
            <p>
              If you believe material was removed as a result of a mistake or misidentification, you may submit a
              counter-notification to our designated agent with the following information:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside marker:text-slate-600">
              <li>Your physical or electronic signature.</li>
              <li>Identification of the material that was removed and where it appeared before removal.</li>
              <li>
                A statement under penalty of perjury that you have a good faith belief the material was removed
                by mistake or misidentification.
              </li>
              <li>Your name, address, telephone number, and a statement that you consent to the jurisdiction of the federal district court in your area.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Repeat Infringers</h2>
            <p>
              FileSpark reserves the right to terminate access to the service for users who are repeat infringers of
              intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Misrepresentation</h2>
            <p>
              Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is
              infringing may be liable for damages, including costs and attorneys&apos; fees.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
