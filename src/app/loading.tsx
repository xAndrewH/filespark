export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" aria-busy={true}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
