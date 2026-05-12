"use client";

interface Props {
  historyCount: number;
  onHistoryClick: () => void;
}

export default function Navbar({ historyCount, onHistoryClick }: Props) {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            F
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">FileFlow</span>
          <span className="hidden sm:block text-slate-500 text-sm">— Free Online File Converter</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            50+ formats
          </span>

          {/* History button */}
          <button
            onClick={onHistoryClick}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-colors"
            aria-label="Conversion history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:block">History</span>
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount > 99 ? "99+" : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
