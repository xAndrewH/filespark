"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "between" | "add" | "duration";

function DurationRow({ label, h, m, s, setH, setM, setS }: {
  label: string; h: number; m: number; s: number;
  setH: (v: number) => void; setM: (v: number) => void; setS: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        {[["Hours", h, setH, 999], ["Mins", m, setM, 59], ["Secs", s, setS, 59]].map(([lbl, val, set, max]) => (
          <div key={lbl as string} className="flex-1">
            <label className="text-slate-500 text-xs block mb-1">{lbl as string}</label>
            <input type="number" min={0} max={max as number} value={val as number}
              onChange={e => (set as (v: number) => void)(Math.max(0, Math.min(max as number, +e.target.value)))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-blue-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function parseTime(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(am|pm))?$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const sec = m[3] ? parseInt(m[3]) : 0;
  const period = m[4]?.toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  if (h > 23 || min > 59 || sec > 59) return null;
  return h * 3600 + min * 60 + sec;
}

function fmtDuration(secs: number): string {
  const neg = secs < 0;
  const abs = Math.abs(secs);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const parts = [];
  if (h) parts.push(`${h} hr`);
  if (m) parts.push(`${m} min`);
  if (s || parts.length === 0) parts.push(`${s} sec`);
  return (neg ? "−" : "") + parts.join(" ");
}

function fmtTime(totalSecs: number): string {
  const norm = ((totalSecs % 86400) + 86400) % 86400;
  const h = Math.floor(norm / 3600);
  const m = Math.floor((norm % 3600) / 60);
  const s = norm % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${ampm}`;
}

function addDuration(base: number, h: number, m: number, s: number, op: "+" | "-"): number {
  const delta = h * 3600 + m * 60 + s;
  return op === "+" ? base + delta : base - delta;
}

export default function TimeCalculatorPage() {
  const [tab, setTab] = useState<Tab>("between");

  // Between
  const [t1, setT1] = useState("09:00");
  const [t2, setT2] = useState("17:30");

  // Add/subtract
  const [baseTime, setBaseTime] = useState("09:00");
  const [addH, setAddH] = useState(2);
  const [addM, setAddM] = useState(30);
  const [addS, setAddS] = useState(0);
  const [addOp, setAddOp] = useState<"+" | "-">("+");

  // Duration builder
  const [dH, setDH] = useState(1);
  const [dM, setDM] = useState(30);
  const [dS, setDS] = useState(0);
  const [dH2, setDH2] = useState(0);
  const [dM2, setDM2] = useState(45);
  const [dS2, setDS2] = useState(0);
  const [dOp, setDOp] = useState<"+" | "-">("+");

  const p1 = parseTime(t1);
  const p2 = parseTime(t2);
  const betweenResult = p1 !== null && p2 !== null ? Math.abs(p2 - p1) : null;
  const chronoResult = p1 !== null && p2 !== null
    ? (p2 >= p1 ? fmtDuration(p2 - p1) + " (forward)" : fmtDuration(p1 - p2) + " (backward)")
    : null;

  const baseSeconds = parseTime(baseTime);
  const addResult = baseSeconds !== null ? fmtTime(addDuration(baseSeconds, addH, addM, addS, addOp)) : null;

  const dur1Secs = dH * 3600 + dM * 60 + dS;
  const dur2Secs = dH2 * 3600 + dM2 * 60 + dS2;
  const durResult = dOp === "+" ? dur1Secs + dur2Secs : dur1Secs - dur2Secs;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Time Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">Calculate durations, add/subtract time, and combine durations.</p>

        <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 mb-5">
          {([["between", "Between times"], ["add", "Add / subtract"], ["duration", "Combine durations"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${tab === id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "between" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Start time</label>
                <input type="time" value={t1} onChange={e => setT1(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">End time</label>
                <input type="time" value={t2} onChange={e => setT2(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            {betweenResult !== null && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Duration</p>
                <p className="text-white text-2xl font-bold">{fmtDuration(betweenResult)}</p>
                <p className="text-slate-500 text-xs mt-2">{chronoResult}</p>
                <p className="text-slate-500 text-xs">{betweenResult.toLocaleString()} seconds total</p>
              </div>
            )}
          </div>
        )}

        {tab === "add" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Base time</label>
              <input type="time" value={baseTime} onChange={e => setBaseTime(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-lg p-1">
                {(["+", "-"] as const).map(op => (
                  <button key={op} onClick={() => setAddOp(op)}
                    className={`px-3 py-1 rounded text-sm font-mono transition-colors ${addOp === op ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    {op}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-1">
                {[["Hours", addH, setAddH, 23], ["Mins", addM, setAddM, 59], ["Secs", addS, setAddS, 59]].map(([label, val, set, max]) => (
                  <div key={label as string} className="flex-1">
                    <label className="text-slate-500 text-xs block mb-1">{label as string}</label>
                    <input type="number" min={0} max={max as number} value={val as number}
                      onChange={e => (set as (v: number) => void)(Math.max(0, Math.min(max as number, +e.target.value)))}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
            </div>
            {addResult && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Result time</p>
                <p className="text-white text-2xl font-bold font-mono">{addResult}</p>
              </div>
            )}
          </div>
        )}

        {tab === "duration" && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
            <DurationRow label="Duration 1" h={dH} m={dM} s={dS} setH={setDH} setM={setDM} setS={setDS} />
            <div className="flex justify-center">
              <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-lg p-1">
                {(["+", "-"] as const).map(op => (
                  <button key={op} onClick={() => setDOp(op)}
                    className={`px-4 py-1 rounded text-sm font-mono transition-colors ${dOp === op ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    {op}
                  </button>
                ))}
              </div>
            </div>
            <DurationRow label="Duration 2" h={dH2} m={dM2} s={dS2} setH={setDH2} setM={setDM2} setS={setDS2} />
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Result</p>
              <p className={`text-2xl font-bold ${durResult < 0 ? "text-red-400" : "text-white"}`}>{fmtDuration(durResult)}</p>
              <p className="text-slate-500 text-xs mt-2">{Math.abs(durResult).toLocaleString()} seconds total</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
