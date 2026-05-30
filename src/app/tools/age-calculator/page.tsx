"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  nextBirthday: { daysAway: number; date: string; isToday: boolean };
}

function calcAge(dobStr: string, asOfStr: string): AgeResult {
  const dob = parseLocalDate(dobStr);
  const asOf = parseLocalDate(asOfStr);

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prev = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);

  const nextBDYear = (() => {
    const candidate = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
    if (candidate.getTime() >= asOf.getTime()) return candidate;
    return new Date(asOf.getFullYear() + 1, dob.getMonth(), dob.getDate());
  })();

  const daysAway = Math.round((nextBDYear.getTime() - asOf.getTime()) / 86400000);
  const isToday = daysAway === 0;

  const bdYyyy = nextBDYear.getFullYear();
  const bdMm = String(nextBDYear.getMonth() + 1).padStart(2, "0");
  const bdDd = String(nextBDYear.getDate()).padStart(2, "0");
  const bdDate = `${bdYyyy}-${bdMm}-${bdDd}`;

  return { years, months, days, totalDays, totalWeeks, nextBirthday: { daysAway, date: bdDate, isToday } };
}

function formatStatDate(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AgeCalculatorPage() {
  const today = todayString();
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(today);

  const result = useMemo<AgeResult | null>(() => {
    if (!dob || !asOf) return null;
    const dobDate = parseLocalDate(dob);
    const asOfDate = parseLocalDate(asOf);
    if (asOfDate < dobDate) return null;
    return calcAge(dob, asOf);
  }, [dob, asOf]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Age Calculator</h1>
        <p className="text-slate-500 text-sm mb-8">Enter a birthdate and see your exact age.</p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date of birth</label>
              <input
                type="date"
                value={dob}
                max={today}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">As of date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={asOf}
                  onChange={e => setAsOf(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
                />
                <button
                  onClick={() => setAsOf(today)}
                  className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 px-5 py-6">
            {!dob ? (
              <p className="text-slate-500 text-sm text-center py-4">Enter a date of birth to calculate age.</p>
            ) : !result ? (
              <p className="text-slate-500 text-sm text-center py-4">The "as of" date must be on or after the date of birth.</p>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {result.years} <span className="text-slate-400 font-normal text-xl">yr</span>{" "}
                    {result.months} <span className="text-slate-400 font-normal text-xl">mo</span>{" "}
                    {result.days} <span className="text-slate-400 font-normal text-xl">day{result.days !== 1 ? "s" : ""}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 text-center">
                    <p className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">Total days</p>
                    <p className="text-white text-lg font-semibold">{result.totalDays.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 text-center">
                    <p className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">Total weeks</p>
                    <p className="text-white text-lg font-semibold">{result.totalWeeks.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 text-center">
                    <p className="text-blue-400 text-xs font-medium uppercase tracking-wide mb-1">Next birthday</p>
                    {result.nextBirthday.isToday ? (
                      <p className="text-white text-sm font-semibold">🎂 Happy Birthday!</p>
                    ) : (
                      <>
                        <p className="text-white text-lg font-semibold">
                          {result.nextBirthday.daysAway} <span className="text-slate-400 text-sm font-normal">day{result.nextBirthday.daysAway !== 1 ? "s" : ""}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{formatStatDate(result.nextBirthday.date)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
