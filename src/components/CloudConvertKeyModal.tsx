"use client";

import { useState } from "react";
import { getCloudConvertKey, setCloudConvertKey } from "@/lib/cloudconvert-client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CloudConvertKeyModal({ open, onClose }: Props) {
  const [key, setKey] = useState(() => getCloudConvertKey() ?? "");
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const save = () => {
    setCloudConvertKey(key);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold text-base">CloudConvert API Key</h2>
            <p className="text-slate-400 text-sm mt-1">Required for document &amp; eBook conversions (DOCX, XLSX, EPUB, MOBI…)</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-2 text-sm">
          <p className="text-slate-300 font-medium">Free tier: 25 conversions / day</p>
          <ol className="text-slate-400 space-y-1 list-decimal list-inside">
            <li>Sign up at <span className="text-blue-400">cloudconvert.com</span></li>
            <li>Go to Dashboard → API Keys → Create API Key</li>
            <li>Paste the key below — it&apos;s stored only in your browser</li>
          </ol>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">API Key</label>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setSaved(false); }}
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9…"
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
            onKeyDown={e => { if (e.key === "Enter") save(); }}
          />
          {key && (
            <button
              onClick={() => { setKey(""); setCloudConvertKey(""); }}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Remove key
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!key.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {saved ? "Saved ✓" : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
