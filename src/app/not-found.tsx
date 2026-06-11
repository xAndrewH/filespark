import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">This page doesn&apos;t exist.</h1>
        <p className="text-slate-400 text-sm mb-8">
          The link may be broken, or the page may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-sm shadow-blue-500/20 transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/tools"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
          >
            Browse all tools
          </Link>
        </div>
      </div>
    </div>
  );
}
