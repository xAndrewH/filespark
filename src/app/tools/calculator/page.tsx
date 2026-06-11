"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";

type Mode = "basic" | "advanced";

function evaluate(expr: string): string {
  try {
    // Replace math functions
    const sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/\^/g, "**");
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!isFinite(result)) return "Error";
    const n = parseFloat(result.toPrecision(12));
    return String(n);
  } catch {
    return "Error";
  }
}

const BASIC_BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

const ADVANCED_EXTRA = [
  ["sin(", "cos(", "tan(", "π"],
  ["√(", "log(", "ln(", "e"],
  ["(", ")", "^", "abs("],
];

export default function CalculatorPage() {
  const [mode, setMode] = useState<Mode>("basic");
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [justEvaled, setJustEvaled] = useState(false);

  const press = useCallback((key: string) => {
    if (key === "C") {
      setDisplay("0");
      setExpr("");
      setJustEvaled(false);
      return;
    }
    if (key === "⌫") {
      setExpr(e => {
        const n = e.slice(0, -1);
        setDisplay(n || "0");
        return n;
      });
      setJustEvaled(false);
      return;
    }
    if (key === "±") {
      setExpr(e => {
        const toggled = e.startsWith("-") ? e.slice(1) : "-" + e;
        setDisplay(toggled || "0");
        return toggled;
      });
      return;
    }
    if (key === "%") {
      setExpr(e => {
        const val = evaluate(e) ;
        const pct = String(parseFloat(val) / 100);
        setDisplay(pct);
        return pct;
      });
      return;
    }
    if (key === "=") {
      const result = evaluate(expr || display);
      if (result !== "Error" && expr) {
        setHistory(h => [{ expr, result }, ...h].slice(0, 20));
      }
      setDisplay(result);
      setExpr(result === "Error" ? "" : result);
      setJustEvaled(true);
      return;
    }

    const operators = ["+", "−", "×", "÷", "^", "*", "/"];
    const isOp = operators.includes(key);

    setExpr(e => {
      let next = e;
      if (justEvaled && !isOp) {
        next = "";
      }
      next = next + (key === "−" ? "-" : key);
      setDisplay(next);
      return next;
    });
    setJustEvaled(false);
  }, [expr, display, justEvaled]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        "0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
        ".":".", "+":"+", "-":"−", "*":"×", "/":"÷", "^":"^",
        "Enter":"=", "=":"=", "Backspace":"⌫", "Escape":"C", "%":"%",
        "(":"(", ")":")",
      };
      if (map[e.key]) { e.preventDefault(); press(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [press]);

  const btnClass = (key: string) => {
    const base = "flex items-center justify-center rounded-xl text-base font-medium h-14 transition-all active:scale-95 select-none cursor-pointer";
    if (key === "=") return `${base} bg-blue-600 hover:bg-blue-500 text-white col-span-1`;
    if (["÷", "×", "−", "+"].includes(key)) return `${base} bg-slate-700 hover:bg-slate-600 text-blue-300`;
    if (["C", "±", "%", "⌫"].includes(key)) return `${base} bg-slate-700 hover:bg-slate-600 text-slate-300`;
    return `${base} bg-slate-800 hover:bg-slate-700 text-white`;
  };

  const advBtnClass = "flex items-center justify-center rounded-xl text-sm font-mono h-11 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-300 transition-all active:scale-95 cursor-pointer select-none";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-sm mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Calculator</h1>
          </div>
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
            {(["basic", "advanced"] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          {/* Display */}
          <div className="px-5 py-4 min-h-[80px] flex flex-col items-end justify-end">
            <p className="text-slate-500 text-xs font-mono truncate w-full text-right">{expr || " "}</p>
            <p className="text-white text-4xl font-light font-mono truncate w-full text-right">{display}</p>
          </div>

          <div className="p-3 space-y-3">
            {/* Advanced buttons */}
            {mode === "advanced" && (
              <div className="space-y-2">
                {ADVANCED_EXTRA.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-4 gap-2">
                    {row.map(k => (
                      <button key={k} onClick={() => press(k)} className={advBtnClass}>{k}</button>
                    ))}
                  </div>
                ))}
                <div className="border-t border-slate-700/50 pt-2" />
              </div>
            )}

            {/* Basic buttons */}
            {BASIC_BUTTONS.map((row, ri) => (
              <div key={ri} className={`grid gap-2 ${row.length === 4 ? "grid-cols-4" : "grid-cols-4"}`}>
                {row.map(k => (
                  <button key={k} onClick={() => press(k)} className={btnClass(k)}>
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">History</p>
              <button onClick={() => setHistory([])} className="text-slate-500 hover:text-slate-300 text-xs">Clear</button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-500 font-mono truncate mr-2">{h.expr}</span>
                  <button onClick={() => { setDisplay(h.result); setExpr(h.result); }}
                    className="text-slate-300 font-mono shrink-0 hover:text-blue-400 transition-colors">{h.result}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <RelatedTools current="/tools/calculator" />
      </div>
    </div>
  );
}
