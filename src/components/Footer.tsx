import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 mt-24">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <span>© {new Date().getFullYear()} Filespark. Free to use, no account required.</span>
        <div className="flex items-center gap-4">
          <Link href="/tools" className="hover:text-slate-400 transition-colors">Tools</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
