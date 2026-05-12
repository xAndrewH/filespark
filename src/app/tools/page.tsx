import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tools — FileFlow" };

const TOOLS = [
  {
    href: "/tools/qr",
    icon: "⬛",
    title: "QR Code Generator",
    description: "Generate a QR code from any URL, text, or data. Customize colors and download as PNG.",
    badge: "Free",
    color: "from-slate-500/20",
  },
  {
    href: "/tools/pdf-merge",
    icon: "📄",
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document. Reorder pages before merging.",
    badge: "Browser",
    color: "from-red-500/20",
  },
  {
    href: "/tools/image-editor",
    icon: "🖼️",
    title: "Image Editor",
    description: "Resize, rotate, flip, and adjust quality. Supports JPG, PNG, WEBP and more.",
    badge: "Browser",
    color: "from-blue-500/20",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-10 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to FileFlow
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Tools</h1>
          <p className="text-slate-400 text-lg">Standalone utilities — no account, no upload limits.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(({ href, icon, title, description, badge, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} to-slate-900/80 border border-slate-700/60 flex items-center justify-center text-2xl`}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-white font-semibold text-base group-hover:text-blue-300 transition-colors">{title}</h2>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{badge}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-slate-600 group-hover:text-blue-400 text-xs font-medium transition-colors">
                Open tool
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
