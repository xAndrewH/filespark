import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | FileSpark",
  description:
    "Read FileSpark's terms of use. Free to use for personal and commercial purposes. You retain full ownership of all files you convert.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use | FileSpark",
    description:
      "Read FileSpark's terms of use. Free to use for personal and commercial purposes. You retain full ownership of all files you convert.",
    url: "/terms",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Use | FileSpark",
    description:
      "Read FileSpark's terms of use. Free to use for personal and commercial purposes. You retain full ownership of all files you convert.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileSpark
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Use</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose-slate space-y-8 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Acceptance</h2>
            <p>
              By using FileSpark you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Use of the Service</h2>
            <p>FileSpark is provided for personal and commercial use. You agree not to:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside marker:text-slate-600">
              <li>Upload files you do not have the right to convert or distribute</li>
              <li>Use the service to convert, distribute, or process illegal content</li>
              <li>Attempt to abuse, overload, or reverse-engineer the service</li>
              <li>Use automated tools to send large volumes of conversion requests</li>
              <li>Circumvent any technical measures that limit use of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Intellectual Property &amp; Copyright</h2>
            <p>
              You retain full ownership of the files you upload and the converted outputs. FileSpark does not
              claim any rights over your content.
            </p>
            <p className="mt-3">
              You are responsible for ensuring you have the necessary rights and licenses to convert any
              copyrighted material. FileSpark is a format conversion tool only | it does not grant you any
              rights to content you do not already own or have permission to use.
            </p>
            <p className="mt-3">
              FileSpark respects intellectual property rights and complies with the Digital Millennium Copyright
              Act (DMCA). If you believe your copyright has been infringed, please review our{" "}
              <Link href="/dmca" className="text-blue-400 hover:underline">DMCA Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Third-Party Services</h2>
            <p>
              Document and eBook conversions optionally use the CloudConvert API. If you choose to use this
              feature, you are providing your own CloudConvert API key and your files are sent to CloudConvert
              under their{" "}
              <a href="https://cloudconvert.com/terms" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>.
              FileSpark is not responsible for the availability, accuracy, or actions of CloudConvert or any
              other third-party service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Disclaimer of Warranties</h2>
            <p>
              FileSpark is provided <strong className="text-slate-200">"as is"</strong> without warranties of
              any kind, express or implied. We do not guarantee that conversions will be error-free, lossless,
              or always available. Use the service at your own risk and always keep backups of important files.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, FileSpark and its operators shall not be liable for any
              indirect, incidental, special, exemplary, or consequential damages arising from your use of the
              service, including but not limited to loss of data, loss of files, or loss of profits, even if
              advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FileSpark and its operators from any claims, damages,
              losses, liabilities, and expenses (including legal fees) arising out of your use of the service
              or your violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of the United States.
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the
              courts located in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Service Availability</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue FileSpark at any time without notice.
              We are not liable to you or any third party for any such change or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Changes to These Terms</h2>
            <p>
              We may update these terms at any time. Continued use of FileSpark after changes constitutes
              acceptance of the updated terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@filespark.app" className="text-blue-400 hover:underline">legal@filespark.app</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
