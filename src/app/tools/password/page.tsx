"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { RelatedTools } from "@/components/RelatedTools";

const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const SIMILAR_CHARS = "il1IoO0";

const WORDLIST = [
  "able","acid","aged","army","away","baby","back","ball","band","bank","base","bath","bear","beat",
  "bell","belt","best","bird","bite","blue","boat","body","bomb","bond","bone","book","born","bowl",
  "burn","busy","call","calm","card","care","case","cash","cave","cell","chip","city","clay","clip",
  "club","code","coin","cold","cook","cool","core","corn","cost","crew","crop","cure","dark","dart",
  "data","date","dawn","dead","deal","debt","deep","desk","dial","dirt","disk","dock","door","draw",
  "drop","drum","dusk","dust","each","edge","epic","even","ever","fact","fail","fair","fall","fame",
  "farm","fast","fate","feel","feet","fern","file","fill","film","find","fire","firm","fish","flag",
  "flat","flip","flow","foam","fold","font","food","fool","fork","form","fort","free","fuel","full",
  "fund","game","gate","gear","gene","gift","girl","glad","glow","glue","goal","gold","golf","gone",
  "grab","gray","grid","grin","grip","grow","gulf","hack","half","hall","hand","hang","hard","harm",
  "hawk","head","heal","heap","heat","heel","held","help","hero","high","hill","hint","hold","hole",
  "home","hook","hope","horn","host","hour","huge","hull","hunt","hurt","icon","inch","iron","jade",
  "jest","join","jump","just","keen","keep","kite","knew","knob","know","lace","lack","lamb","lamp",
  "land","lane","last","late","lean","leap","left","lend","lens","life","lift","like","lime","limp",
  "line","link","list","live","load","loan","lock","loft","lone","long","look","loop","lord","lore",
  "lost","loud","love","luck","lung","lure","made","main","make","malt","mane","many","mark","mask",
  "mast","mate","math","maze","melt","mesh","mild","mile","milk","mill","mind","mine","mint","miss",
  "mist","mode","moon","more","most","move","much","mule","mute","myth","nail","name","navy","near",
  "neat","neck","need","nest","next","nice","nick","node","none","noon","norm","nose","note","oath",
  "odds","once","only","open","oval","oven","over","pace","pack","page","pale","palm","park","part",
  "pass","past","path","pave","peak","peel","peer","pick","pile","pine","pipe","plan","play","plea",
  "plot","plow","plum","poem","poet","pole","poll","pond","pool","poor","port","post","pour","pray",
  "prep","prey","prod","pull","pump","pure","push","rack","rain","rake","rank","rare","read","real",
  "rely","rent","rest","rich","ride","ring","rise","risk","road","roam","roar","rock","role","roll",
  "roof","root","rope","rose","rule","rune","rush","rust","safe","sail","sake","salt","sand","save",
  "scan","seal","seam","send","shed","ship","shoe","shop","show","sick","side","sign","silk","silt",
  "sing","sink","skip","slam","slim","slip","slow","snap","snow","soak","soar","soft","soil","sole",
  "song","soon","sort","soul","span","spin","spot","spur","star","stay","stem","step","stir","stop",
  "such","suit","swam","swap","swim","tail","tale","talk","tall","tame","tank","tape","task","team",
  "tell","tent","term","test","thin","tick","tide","tilt","time","tint","tire","told","toll","tone",
  "took","tool","toss","tour","trek","trim","trip","true","tube","tune","twin","type","unit","vane",
  "veil","vein","very","vest","view","vine","void","volt","wade","wait","wake","walk","wall","want",
  "ward","warm","wave","weak","weld","west","wide","will","wind","wine","wing","wire","wise","wish",
  "wolf","worm","worn","wrap","yard","yarn","yell","zeal","zero","zone","zoom","amber","beach","candy",
  "delta","flame","globe","house","jewel","knife","lemon","music","night","ocean","piano","queen",
  "river","storm","tiger","uncle","vivid","water","brave","cloud","dance","eagle","frost","grape",
  "honey","index","jolly","karma","laser","maple","novel","opera","pearl","quest","radio","solar",
  "trend","ultra","vapor","waltz","pixel","coral","crane","creek","crest","crisp","cubic","cycle",
  "daisy","draft","dream","drift","drill","ember","epoch","ether","fable","facet","fairy","fiber",
  "field","flair","flare","flask","fleet","float","flock","flood","floor","flute","focus","forge",
  "frame","frown","garnet","gavel","gaze","geyser","giant","glare","glass","glyph","gnome",
  "gorge","gourd","grace","grade","grain","grand","grant","grasp","grass","gravel","graze","green",
  "grove","growl","guild","gusto","hazel","heart","hedge","heron","hinge","horse","hound","hover",
];

type Mode = "password" | "passphrase";

function generatePassword(length: number, opts: Record<string, boolean>): string {
  let pool = "";
  if (opts.upper)   pool += CHARS.upper;
  if (opts.lower)   pool += CHARS.lower;
  if (opts.numbers) pool += CHARS.numbers;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;
  if (opts.excludeSimilar) {
    const filtered = [...pool].filter(c => !SIMILAR_CHARS.includes(c)).join("");
    if (filtered) pool = filtered;
  }
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => pool[n % pool.length]).join("");
}

function generatePassphrase(wordCount: number, separator: string, capitalize: boolean): string {
  const arr = new Uint32Array(wordCount);
  crypto.getRandomValues(arr);
  const words = Array.from(arr).map(n => {
    const w = WORDLIST[n % WORDLIST.length];
    return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  return words.join(separator);
}

function strength(pw: string) {
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const types = checks.filter(r => r.test(pw)).length;
  const score = (pw.length >= 16 ? 2 : pw.length >= 10 ? 1 : 0) + (types >= 3 ? 2 : types >= 2 ? 1 : 0);
  return [
    { label: "Very Weak",   color: "bg-red-500",    w: "w-1/5"  },
    { label: "Weak",        color: "bg-orange-500", w: "w-2/5"  },
    { label: "Fair",        color: "bg-yellow-500", w: "w-3/5"  },
    { label: "Strong",      color: "bg-blue-500",   w: "w-4/5"  },
    { label: "Very Strong", color: "bg-green-500",  w: "w-full" },
  ][Math.min(score, 4)];
}

function passphraseStrength(wordCount: number) {
  if (wordCount >= 6) return { label: "Very Strong", color: "bg-green-500", w: "w-full" };
  if (wordCount >= 5) return { label: "Strong",      color: "bg-blue-500",  w: "w-4/5"  };
  if (wordCount >= 4) return { label: "Fair",        color: "bg-yellow-500",w: "w-3/5"  };
  return                     { label: "Weak",        color: "bg-orange-500",w: "w-2/5"  };
}

const SEPARATORS = [
  { value: "-",  label: "Hyphen  (word-word)" },
  { value: "_",  label: "Underscore  (word_word)" },
  { value: " ",  label: "Space  (word word)" },
  { value: ".",  label: "Dot  (word.word)" },
  { value: "",   label: "None  (wordword)" },
];

export default function PasswordPage() {
  const [mode, setMode] = useState<Mode>("password");

  const [length, setLength]   = useState(16);
  const [opts, setOpts]       = useState({ upper: true, lower: true, numbers: true, symbols: false, excludeSimilar: false });
  const [count, setCount]     = useState(5);

  const [wordCount, setWordCount]   = useState(4);
  const [separator, setSeparator]   = useState("-");
  const [capitalize, setCapitalize] = useState(false);

  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied]       = useState<string | null>(null);

  const generateAll = useCallback(() => {
    if (mode === "password") {
      setPasswords(Array.from({ length: count }, () => generatePassword(length, opts)));
    } else {
      setPasswords(Array.from({ length: count }, () => generatePassphrase(wordCount, separator, capitalize)));
    }
  }, [mode, length, opts, count, wordCount, separator, capitalize]);

  useEffect(() => { generateAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = (pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopied(pw);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggle = (key: string) => setOpts(o => ({ ...o, [key]: !o[key as keyof typeof o] }));

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Password Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Cryptographically secure passwords generated in your browser.</p>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 w-fit">
            {(["password", "passphrase"] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>

          {mode === "password" ? (
            <>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white text-sm font-medium">Length</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLength(l => Math.max(4, l - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors">−</button>
                    <span className="text-blue-400 font-mono text-sm font-bold w-8 text-center">{length}</span>
                    <button onClick={() => setLength(l => Math.min(128, l + 1))} className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors">+</button>
                  </div>
                </div>
                <input type="range" min={4} max={128} value={length} onChange={e => setLength(+e.target.value)} className="w-full accent-blue-500" />
                <div className="flex justify-between text-slate-500 text-xs mt-1">
                  <span>4</span>
                  <div className="flex gap-3">
                    {[8,12,16,24,32].map(n => (
                      <button key={n} onClick={() => setLength(n)}
                        className={`text-[10px] transition-colors ${length === n ? "text-blue-400" : "hover:text-slate-300"}`}>{n}</button>
                    ))}
                  </div>
                  <span>128</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-3">Character types</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "upper",   label: "Uppercase",  ex: "A–Z"   },
                    { key: "lower",   label: "Lowercase",  ex: "a–z"   },
                    { key: "numbers", label: "Numbers",    ex: "0–9"   },
                    { key: "symbols", label: "Symbols",    ex: "!@#$%" },
                  ].map(({ key, label, ex }) => (
                    <button key={key} onClick={() => toggle(key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        opts[key as keyof typeof opts]
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white"
                      }`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${opts[key as keyof typeof opts] ? "bg-blue-500" : "bg-slate-700"}`}>
                        {opts[key as keyof typeof opts] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                      <span>{label}</span>
                      <span className="text-xs opacity-50 ml-auto font-mono">{ex}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 cursor-pointer mt-3 pt-3 border-t border-slate-800/60" onClick={() => toggle("excludeSimilar")}>
                  <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${opts.excludeSimilar ? "bg-blue-500" : "bg-slate-700"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${opts.excludeSimilar ? "left-4" : "left-0.5"}`} />
                  </div>
                  <span className="text-slate-300 text-sm select-none">Exclude similar characters</span>
                  <span className="text-xs text-slate-500 font-mono ml-auto">i, l, 1, I, o, O, 0</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white text-sm font-medium">Word count</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setWordCount(w => Math.max(2, w - 1))} className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors">−</button>
                    <span className="text-blue-400 font-mono text-sm font-bold w-6 text-center">{wordCount}</span>
                    <button onClick={() => setWordCount(w => Math.min(8, w + 1))} className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors">+</button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[2,3,4,5,6,8].map(n => (
                    <button key={n} onClick={() => setWordCount(n)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-colors ${wordCount === n ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium mb-2">Separator</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {SEPARATORS.map(s => (
                    <button key={s.value} onClick={() => setSeparator(s.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-colors ${
                        separator === s.value
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white"
                      }`}>
                      <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center ${separator === s.value ? "border-blue-400 bg-blue-500" : "border-slate-600"}`}>
                        {separator === s.value && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCapitalize(c => !c)}>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${capitalize ? "bg-blue-500" : "bg-slate-700"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${capitalize ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-slate-300 text-sm select-none">Capitalize each word</span>
              </div>
            </div>
          )}

          {/* Count + Generate */}
          <div className="flex gap-3 items-stretch">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2">
              <span className="text-slate-400 text-sm">Generate</span>
              <select value={count} onChange={e => setCount(+e.target.value)} className="bg-transparent text-white text-sm focus:outline-none">
                {[1,3,5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={generateAll}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>

          {/* Results */}
          {passwords.length > 0 && (
            <>
              <div className="space-y-2">
                {passwords.map((pw, i) => {
                  const s = mode === "password" ? strength(pw) : passphraseStrength(wordCount);
                  const isCopied = copied === pw;
                  return (
                    <div key={i}
                      className={`group bg-slate-900/60 border rounded-xl p-3 transition-colors cursor-pointer ${isCopied ? "border-green-500/40 bg-green-500/5" : "border-slate-800/60 hover:border-slate-700"}`}
                      onClick={() => copy(pw)} title="Click to copy">
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-white text-sm font-mono break-all leading-relaxed">{pw}</code>
                        <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${isCopied ? "bg-green-600 border-green-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 group-hover:text-white"}`}>
                          {isCopied ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${s.color} ${s.w}`} />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {passwords.length > 1 && (
                <CopyButton text={() => passwords.join("\n")} label={`Copy all ${passwords.length}`}
                  className="w-full justify-center py-2 text-sm rounded-xl" />
              )}
            </>
          )}
        </div>

        <RelatedTools current="/tools/password" />
      </div>
    </div>
  );
}
