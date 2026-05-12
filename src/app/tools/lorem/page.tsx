"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio tempor orci dapibus ultrices in iaculis nunc sed augue lacinia at egestas eget nullam elementum tempus feugiat sed lobortis aliquam elementum lorem".split(" ");

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function randomWord(exclude?: string) {
  let w: string;
  do { w = WORDS[Math.floor(Math.random() * WORDS.length)]; } while (w === exclude);
  return w;
}

function generateSentence(minWords = 6, maxWords = 18): string {
  const len = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words = Array.from({ length: len }, (_, i) => i === 0 ? capitalize(randomWord()) : randomWord());
  return words.join(" ") + ".";
}

function generateParagraph(sentences = 4): string {
  return Array.from({ length: sentences }, () => generateSentence()).join(" ");
}

export default function LoremPage() {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let result = "";
    if (type === "paragraphs") {
      const paras = Array.from({ length: count }, (_, i) => {
        const p = generateParagraph(3 + Math.floor(Math.random() * 3));
        if (i === 0 && startWithLorem) return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + p;
        return p;
      });
      result = paras.join("\n\n");
    } else if (type === "sentences") {
      const sentences = Array.from({ length: count }, (_, i) => generateSentence());
      if (startWithLorem && sentences[0]) sentences[0] = "Lorem ipsum dolor sit amet.";
      result = sentences.join(" ");
    } else {
      const words = Array.from({ length: count }, () => randomWord());
      if (startWithLorem && words[0]) words[0] = "Lorem";
      result = capitalize(words.join(" ")) + ".";
    }
    setOutput(result);
  }, [type, count, startWithLorem]);

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Lorem Ipsum Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Generate placeholder text for your designs and mockups.</p>

        <div className="space-y-5">
          {/* Controls */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                {(["paragraphs", "sentences", "words"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${type === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Count</span>
                <input type="number" min={1} max={type === "words" ? 500 : type === "sentences" ? 50 : 20}
                  value={count} onChange={e => setCount(Math.max(1, +e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-blue-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-slate-400 text-sm">Start with "Lorem ipsum"</span>
              </label>
            </div>

            <button onClick={generate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Generate
            </button>
          </div>

          {output && (
            <div className="relative">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {output}
              </div>
              <button onClick={copy}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
