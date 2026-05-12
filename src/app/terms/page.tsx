import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — FileFlow",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileFlow
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Use</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose-slate space-y-8 text-slate-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Acceptance</h2>
            <p>
              By using FileFlow you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Use of the Service</h2>
            <p>FileFlow is provided free of charge for personal and commercial use. You agree not to:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside marker:text-slate-600">
              <li>Upload files you do not have the right to convert or distribute</li>
              <li>Use the service to convert, distribute, or process illegal content</li>
              <li>Attempt to abuse, overload, or reverse-engineer the service</li>
              <li>Use automated tools to send large volumes of conversion requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Intellectual Property</h2>
            <p>
              You retain full ownership of the files you upload and the converted outputs. FileFlow does not
              claim any rights over your content.
            </p>
            <p className="mt-3">
              You are responsible for ensuring you have the necessary rights and licenses to convert any
              copyrighted material.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Disclaimer of Warranties</h2>
            <p>
              FileFlow is provided <strong className="text-slate-200">"as is"</strong> without warranties of
              any kind. We do not guarantee that conversions will be error-free, lossless, or always available.
              Use the service at your own risk and always keep backups of important files.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, FileFlow and its operators shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of the service, including
              loss of data or files.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Service Availability</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue FileFlow at any time without notice.
              We are not liable to you or any third party for any such change or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Changes to These Terms</h2>
            <p>
              We may update these terms at any time. Continued use of FileFlow after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
