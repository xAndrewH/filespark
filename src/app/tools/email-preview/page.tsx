"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const SPAM_WORDS = ["FREE", "URGENT", "WINNER", "GUARANTEED", "CLICK HERE", "BUY NOW", "LIMITED TIME"];

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

function countEmoji(str: string): number {
  const matches = str.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu);
  return matches ? matches.length : 0;
}

function findSpamWords(subject: string): string[] {
  const upper = subject.toUpperCase();
  return SPAM_WORDS.filter((w) => upper.includes(w));
}

function GmailMockup({
  sender,
  subject,
  preheader,
}: {
  sender: string;
  subject: string;
  preheader: string;
}) {
  const truncSubject = truncate(subject || "No subject", 60);
  const remaining = Math.max(0, 60 - (subject || "").length);
  const truncPre = truncate(preheader, remaining > 0 ? remaining : 30);
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Gmail Desktop</p>
      <div className="bg-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3 hover:bg-white/5 transition-colors cursor-default">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{(sender || "Y").charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-white truncate">{sender || "Your Company"}</span>
              <span className="text-xs text-slate-400 shrink-0">{now}</span>
            </div>
            <div className="text-sm text-slate-300 truncate">
              <span className="font-semibold">{truncSubject}</span>
              {preheader && (
                <span className="text-slate-500"> – {truncPre}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMockup({
  sender,
  subject,
  preheader,
}: {
  sender: string;
  subject: string;
  preheader: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Mobile</p>
      <div className="mx-auto w-64 bg-[#1c1c1e] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        <div className="px-1 py-1">
          <div className="flex items-center px-3 py-3 gap-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{(sender || "Y").charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{sender || "Your Company"}</p>
              <p className="text-xs text-slate-300 truncate font-medium">{truncate(subject || "No subject", 40)}</p>
              {preheader && (
                <p className="text-xs text-slate-500 truncate">{truncate(preheader, 90)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppleMailMockup({
  sender,
  subject,
  preheader,
}: {
  sender: string;
  subject: string;
  preheader: string;
}) {
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Apple Mail</p>
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-default">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{(sender || "Y").charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-gray-900 truncate">{sender || "Your Company"}</span>
              <span className="text-xs text-gray-400 shrink-0">{now}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate">{truncate(subject || "No subject", 60)}</p>
            {preheader && (
              <p className="text-xs text-gray-400 truncate">{truncate(preheader, 80)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailPreviewPage() {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [senderName, setSenderName] = useState("Your Company");

  const subjectLen = subject.length;
  const preheaderLen = preheader.length;
  const emojiCount = countEmoji(subject);
  const spamWords = findSpamWords(subject);
  const hasQuestion = subject.includes("?");
  const hasExclamation = subject.includes("!");

  const subjectColor =
    subjectLen === 0
      ? "text-slate-500"
      : subjectLen < 50
      ? "text-emerald-400"
      : subjectLen <= 70
      ? "text-amber-400"
      : "text-red-400";

  const subjectBg =
    subjectLen === 0
      ? ""
      : subjectLen < 50
      ? "bg-emerald-500/10 border-emerald-500/20"
      : subjectLen <= 70
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-red-500/10 border-red-500/20";

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

        <h1 className="text-3xl font-bold text-white mb-1">Email Subject Line Previewer</h1>
        <p className="text-slate-500 text-sm mb-8">
          See how your email looks across Gmail, mobile, and Apple Mail.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-400">Subject Line</label>
                <span className={`text-xs ${subjectColor}`}>{subjectLen}/120</span>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value.slice(0, 120))}
                placeholder="Your email subject line..."
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-slate-400">Preheader Text <span className="text-slate-600">(optional)</span></label>
                <span className="text-xs text-slate-600">{preheaderLen}/150</span>
              </div>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value.slice(0, 150))}
                placeholder="Preview text shown after the subject..."
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Company"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <GmailMockup sender={senderName} subject={subject} preheader={preheader} />
          <MobileMockup sender={senderName} subject={subject} preheader={preheader} />
          <AppleMailMockup sender={senderName} subject={subject} preheader={preheader} />
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <p className="text-white text-sm font-semibold mb-4">Analysis</p>
          <div className="flex flex-col gap-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${subjectLen > 0 ? subjectBg : "border-slate-800/40"}`}>
              <span className="text-sm text-slate-300">Subject length</span>
              <span className={`text-sm font-medium ${subjectColor}`}>
                {subjectLen} chars
                {subjectLen > 0 && (subjectLen < 50 ? " · Good" : subjectLen <= 70 ? " · Okay" : " · Too long")}
              </span>
            </div>

            {spamWords.length > 0 && (
              <div className="flex items-start justify-between p-3 rounded-lg border bg-red-500/10 border-red-500/20">
                <span className="text-sm text-slate-300">Spam trigger words</span>
                <span className="text-sm font-medium text-red-400 text-right">{spamWords.join(", ")}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/40">
              <span className="text-sm text-slate-300">Emoji count</span>
              <span className="text-sm font-medium text-slate-300">{emojiCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/40">
              <span className="text-sm text-slate-300">Contains question mark</span>
              <span className={`text-sm font-medium ${hasQuestion ? "text-blue-400" : "text-slate-600"}`}>
                {hasQuestion ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/40">
              <span className="text-sm text-slate-300">Contains exclamation</span>
              <span className={`text-sm font-medium ${hasExclamation ? "text-amber-400" : "text-slate-600"}`}>
                {hasExclamation ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
