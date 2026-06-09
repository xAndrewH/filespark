"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Channel = {
  name: string;
  color: string;
  bgClass: string;
};

const CHANNELS: Channel[] = [
  { name: "Organic Search", color: "#10b981", bgClass: "bg-emerald-500" },
  { name: "Paid Search", color: "#3b82f6", bgClass: "bg-blue-500" },
  { name: "Social Media", color: "#8b5cf6", bgClass: "bg-violet-500" },
  { name: "Email", color: "#f59e0b", bgClass: "bg-amber-500" },
  { name: "Direct", color: "#94a3b8", bgClass: "bg-slate-400" },
  { name: "Referral", color: "#06b6d4", bgClass: "bg-cyan-500" },
  { name: "Display Ads", color: "#f43f5e", bgClass: "bg-rose-500" },
];

type ChannelData = {
  visits: string;
  conversions: string;
};

function parseNum(s: string): number {
  const v = parseFloat(s);
  return isNaN(v) || v < 0 ? 0 : v;
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

export default function TrafficAttributionPage() {
  const [data, setData] = useState<ChannelData[]>(
    CHANNELS.map(() => ({ visits: "", conversions: "" }))
  );

  function update(idx: number, field: keyof ChannelData, val: string) {
    setData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  }

  const visits = data.map((d) => parseNum(d.visits));
  const conversions = data.map((d) => parseNum(d.conversions));

  const totalVisits = visits.reduce((a, b) => a + b, 0);
  const totalConversions = conversions.reduce((a, b) => a + b, 0);
  const overallCVR = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;

  const channelCVRs = visits.map((v, i) => (v > 0 ? (conversions[i] / v) * 100 : 0));
  const bestIdx = channelCVRs.reduce(
    (bestI, cvr, i) => (cvr > channelCVRs[bestI] ? i : bestI),
    0
  );
  const bestChannel = totalConversions > 0 ? CHANNELS[bestIdx].name : "|";

  const totalConvForAttr = totalConversions;

  const lastTouchPct = conversions.map((c) =>
    totalConvForAttr > 0 ? (c / totalConvForAttr) * 100 : 0
  );

  const firstTouchPct = [...lastTouchPct];

  const channelsWithConv = conversions.filter((c) => c > 0).length;
  const linearPct = conversions.map((c) =>
    totalConvForAttr > 0 && c > 0 && channelsWithConv > 0
      ? (totalConvForAttr / channelsWithConv / totalConvForAttr) * 100
      : 0
  );

  const hasData = totalVisits > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Traffic Source Attribution</h1>
        <p className="text-slate-500 text-sm mb-8">
          Enter traffic and conversion data per channel to compare attribution models.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-[1fr_120px_120px] gap-3 mb-3">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Channel</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider text-center">Visits</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider text-center">Conversions</span>
          </div>
          <div className="flex flex-col gap-2">
            {CHANNELS.map((ch, i) => (
              <div key={ch.name} className="grid grid-cols-[1fr_120px_120px] gap-3 items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ch.bgClass}`} />
                  <span className="text-sm text-slate-300">{ch.name}</span>
                </div>
                <input
                  type="number"
                  value={data[i].visits}
                  onChange={(e) => update(i, "visits", e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="number"
                  value={data[i].conversions}
                  onChange={(e) => update(i, "conversions", e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        {hasData && (
          <>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mb-6">
              <p className="text-white text-sm font-semibold mb-4">Traffic Mix</p>
              <div className="flex h-8 rounded-lg overflow-hidden mb-3">
                {CHANNELS.map((ch, i) => {
                  const pct = totalVisits > 0 ? (visits[i] / totalVisits) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={ch.name}
                      className={`${ch.bgClass} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${ch.name}: ${pct.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {CHANNELS.map((ch, i) => {
                  const pct = totalVisits > 0 ? (visits[i] / totalVisits) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div key={ch.name} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${ch.bgClass}`} />
                      <span className="text-xs text-slate-400">{ch.name}</span>
                      <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mb-6 overflow-x-auto">
              <p className="text-white text-sm font-semibold mb-4">Attribution Models</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    <th className="text-left text-slate-400 font-medium pb-2 pr-4">Channel</th>
                    <th className="text-right text-slate-400 font-medium pb-2 px-3">Last-Touch %</th>
                    <th className="text-right text-slate-400 font-medium pb-2 px-3">First-Touch %</th>
                    <th className="text-right text-slate-400 font-medium pb-2 pl-3">Linear %</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNELS.map((ch, i) => {
                    const lt = lastTouchPct[i];
                    const ft = firstTouchPct[i];
                    const lin = linearPct[i];
                    if (visits[i] === 0 && conversions[i] === 0) return null;
                    return (
                      <tr key={ch.name} className="border-b border-slate-800/30 last:border-0">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${ch.bgClass}`} />
                            <span className="text-slate-300">{ch.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">{fmt2(lt)}%</td>
                        <td className="py-2 px-3 text-right text-slate-300">{fmt2(ft)}%</td>
                        <td className="py-2 pl-3 text-right text-slate-300">{fmt2(lin)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-slate-600 mt-3">
                Last-Touch & First-Touch give 100% credit to one channel. Linear distributes equally across all channels with conversions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-white">{totalVisits.toLocaleString()}</div>
                <div className="text-sm text-slate-400 mt-1">Total Visits</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-white">{totalConversions.toLocaleString()}</div>
                <div className="text-sm text-slate-400 mt-1">Total Conversions</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-white">{overallCVR.toFixed(2)}%</div>
                <div className="text-sm text-slate-400 mt-1">Overall CVR</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-white leading-tight">{bestChannel}</div>
                <div className="text-sm text-slate-400 mt-1">Best CVR Channel</div>
              </div>
            </div>
          </>
        )}

        {!hasData && (
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">Enter visit data above to see attribution analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
