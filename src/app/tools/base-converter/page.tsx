"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

/* ── Core conversion ─────────────────────────────────────────────── */
function toBigInt(s: string, base: number): bigint | null {
  const clean = s.replace(/[\s_]/g, "").toUpperCase();
  if (!clean) return null;
  try {
    return BigInt(parseInt(clean, base));
  } catch {
    return null;
  }
}

function fromBigInt(n: bigint, base: number): string {
  if (n < 0n) return "-" + (-n).toString(base).toUpperCase();
  return n.toString(base).toUpperCase();
}

function groupBinary(s: string) {
  return s.replace(/(.{4})/g, "$1 ").trim();
}

/* ── Two's complement ────────────────────────────────────────────── */
function toTwosComplement(n: bigint, bits: number): string {
  if (n >= 0n) return n.toString(2).padStart(bits, "0").slice(-bits);
  const mask = (1n << BigInt(bits)) - 1n;
  return ((n & mask)).toString(2).padStart(bits, "0");
}

function twosCompSigned(bits: string): bigint {
  if (bits[0] === "0") return BigInt("0b" + bits);
  const flipped = bits.split("").map((b) => (b === "0" ? "1" : "0")).join("");
  return -(BigInt("0b" + flipped) + 1n);
}

/* ── IEEE 754 float (32-bit) ─────────────────────────────────────── */
function toIEEE754(n: number): { sign: string; exp: string; mantissa: string; hex: string } {
  const buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = n;
  const u32 = new Uint32Array(buf)[0];
  const bits = u32.toString(2).padStart(32, "0");
  return {
    sign:     bits[0],
    exp:      bits.slice(1, 9),
    mantissa: bits.slice(9),
    hex:      u32.toString(16).toUpperCase().padStart(8, "0"),
  };
}

/* ── ASCII ───────────────────────────────────────────────────────── */
function toAscii(n: bigint): string | null {
  if (n < 0n || n > 127n) return null;
  const c = String.fromCharCode(Number(n));
  if (n < 32n) {
    const names = ["NUL","SOH","STX","ETX","EOT","ENQ","ACK","BEL","BS","TAB","LF","VT","FF","CR","SO","SI",
                   "DLE","DC1","DC2","DC3","DC4","NAK","SYN","ETB","CAN","EM","SUB","ESC","FS","GS","RS","US"];
    return `<${names[Number(n)]}>`;
  }
  if (n === 127n) return "<DEL>";
  return c;
}

/* ── Presets ─────────────────────────────────────────────────────── */
const PRESETS = [
  { label: "2  Binary",      base: 2  },
  { label: "8  Octal",       base: 8  },
  { label: "10 Decimal",     base: 10 },
  { label: "16 Hex",         base: 16 },
  { label: "32 Base32",      base: 32 },
  { label: "36 Base36",      base: 36 },
];

const BIT_WIDTHS = [8, 16, 32, 64] as const;
type BitWidth = typeof BIT_WIDTHS[number];

export default function BaseConverterPage() {
  const [values, setValues]     = useState<Map<number, string>>(new Map());
  const [activeBase, setActive] = useState(10);
  const [error, setError]       = useState("");
  const [customBase, setCustomBase] = useState(12);
  const [showCustom, setShowCustom] = useState(false);
  const [twoBits, setTwoBits]   = useState<BitWidth>(8);
  const [signed, setSigned]     = useState(true);
  const [showIEEE, setShowIEEE] = useState(false);

  const allBases = [
    ...PRESETS.map((p) => p.base),
    ...(showCustom ? [customBase] : []),
  ];

  const handleChange = useCallback((fromBase: number, raw: string) => {
    setError("");
    setActive(fromBase);
    const clean = raw.replace(/[\s_]/g, "").toUpperCase();
    const next = new Map<number, string>([[fromBase, raw]]);
    if (!clean) { setValues(new Map([[fromBase, raw]])); return; }

    // Validate charset
    const valid = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, fromBase);
    if ([...clean].some((c) => !valid.includes(c))) {
      setError(`"${clean}" contains characters invalid for base ${fromBase}`);
      setValues(next);
      return;
    }

    const n = BigInt(parseInt(clean, fromBase));
    const bases = [...PRESETS.map((p) => p.base), ...(showCustom ? [customBase] : [])];
    for (const b of bases) {
      if (b === fromBase) continue;
      const s = fromBigInt(n, b);
      next.set(b, b === 2 ? groupBinary(s) : s);
    }
    setValues(next);
  }, [showCustom, customBase]);

  const decStr = (values.get(10) ?? "").replace(/[\s_]/g, "");
  const decVal = decStr ? BigInt(parseInt(decStr, 10)) : null;
  const binStr = (values.get(2) ?? "").replace(/\s/g, "");

  const twosComp = decVal !== null ? toTwosComplement(decVal, twoBits) : null;
  const signedVal = twosComp ? twosCompSigned(twosComp) : null;
  const ascii = decVal !== null ? toAscii(decVal) : null;
  const ieee = (showIEEE && decVal !== null) ? toIEEE754(Number(decVal)) : null;

  const labelFor = (base: number) => PRESETS.find((p) => p.base === base)?.label.split(" ").slice(1).join(" ") ?? `Base ${base}`;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Number Base Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert between bases 2–36 with two's complement, IEEE 754, and ASCII.</p>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setShowCustom((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${showCustom ? "bg-blue-500/15 border-blue-500/40 text-blue-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"}`}>
            Custom base
          </button>
          <button onClick={() => setShowIEEE((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${showIEEE ? "bg-blue-500/15 border-blue-500/40 text-blue-300" : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white"}`}>
            IEEE 754
          </button>
        </div>

        <div className="space-y-3">
          {allBases.map((base) => (
            <div key={base} className={`bg-slate-900/60 border rounded-xl p-4 transition-colors ${activeBase === base ? "border-blue-500/40" : "border-slate-800/60"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{labelFor(base)}</span>
                  <span className="text-slate-600 text-xs font-mono">base {base}</span>
                </div>
                <CopyButton text={() => (values.get(base) ?? "").replace(/[\s_]/g, "")} />
              </div>
              <input
                value={values.get(base) ?? ""}
                onChange={(e) => handleChange(base, e.target.value)}
                spellCheck={false}
                placeholder={base === 2 ? "1010 1111" : base === 16 ? "FF" : base === 10 ? "255" : "…"}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 placeholder-slate-600 uppercase"
              />
            </div>
          ))}

          {/* Custom base config */}
          {showCustom && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
              <span className="text-slate-400 text-sm">Custom base</span>
              <input type="number" min={2} max={36} value={customBase}
                onChange={(e) => {
                  const b = Math.max(2, Math.min(36, +e.target.value));
                  setCustomBase(b);
                  setValues(new Map());
                }}
                className="w-20 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 text-center" />
              <span className="text-slate-600 text-xs">2 – 36</span>
            </div>
          )}

          <ErrorAlert message={error} />

          {/* Bit visualizer */}
          {binStr && !error && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-medium mb-3">Bit pattern (byte-padded)</p>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const padded = binStr.padStart(Math.ceil(binStr.length / 8) * 8, "0");
                  return padded.split("").map((bit, i) => (
                    <span key={i}>
                      {i > 0 && i % 8 === 0 && <span className="w-2 inline-block" />}
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-mono font-bold ${bit === "1" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>
                        {bit}
                      </span>
                    </span>
                  ));
                })()}
              </div>
              {decVal !== null && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span><span className="text-slate-400 font-mono">{decVal.toLocaleString()}</span> decimal</span>
                  <span><span className="text-slate-400 font-mono">{Math.ceil(binStr.length / 8)}</span> byte{Math.ceil(binStr.length / 8) !== 1 ? "s" : ""}</span>
                  <span><span className="text-slate-400 font-mono">{binStr.length}</span> bits</span>
                  {ascii && <span>ASCII <span className="text-violet-300 font-mono">{ascii}</span></span>}
                </div>
              )}
            </div>
          )}

          {/* Two's complement */}
          {decVal !== null && !error && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">Two&apos;s complement</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSigned((v) => !v)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${signed ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    {signed ? "Signed" : "Unsigned"}
                  </button>
                  <div className="flex gap-1">
                    {BIT_WIDTHS.map((b) => (
                      <button key={b} onClick={() => setTwoBits(b)}
                        className={`px-2 py-1 rounded-lg text-xs transition-colors ${twoBits === b ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {twosComp && (
                <div className="space-y-1">
                  <div className="flex gap-1 flex-wrap">
                    {twosComp.split("").map((bit, i) => (
                      <span key={i}>
                        {i > 0 && i % 8 === 0 && <span className="w-1.5 inline-block" />}
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-mono font-bold ${
                          i === 0 && signed ? "bg-amber-600/60 text-amber-200" : bit === "1" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
                        }`}>{bit}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 pt-1">
                    {signed && <span>Signed value: <span className="text-slate-300 font-mono">{signedVal?.toLocaleString()}</span></span>}
                    <span>Unsigned: <span className="text-slate-300 font-mono">{BigInt("0b" + twosComp).toLocaleString()}</span></span>
                    {signed && <span className="text-amber-500/70">■ sign bit</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IEEE 754 */}
          {ieee && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-medium">IEEE 754 Single (32-bit float)</p>
              <div className="flex flex-wrap gap-1 font-mono text-xs">
                {/* Sign */}
                <div>
                  <div className="text-center text-[9px] text-amber-400 mb-1">S</div>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold ${ieee.sign === "1" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"}`}>{ieee.sign}</span>
                </div>
                <span className="w-1" />
                {/* Exponent */}
                <div>
                  <div className="text-center text-[9px] text-green-400 mb-1 col-span-8">Exponent (8)</div>
                  <div className="flex gap-1">
                    {ieee.exp.split("").map((b, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold ${b === "1" ? "bg-green-700 text-white" : "bg-slate-800 text-slate-400"}`}>{b}</span>
                    ))}
                  </div>
                </div>
                <span className="w-1" />
                {/* Mantissa */}
                <div>
                  <div className="text-center text-[9px] text-blue-400 mb-1">Mantissa (23)</div>
                  <div className="flex gap-1 flex-wrap">
                    {ieee.mantissa.split("").map((b, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold ${b === "1" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>HEX: <span className="text-slate-300 font-mono">{ieee.hex}</span></span>
                <span>Exponent: <span className="text-slate-300 font-mono">{parseInt(ieee.exp, 2) - 127}</span></span>
                <span>Value: <span className="text-slate-300 font-mono">{new Float32Array(new Uint32Array([parseInt(ieee.hex, 16)]).buffer)[0]}</span></span>
              </div>
            </div>
          )}
        </div>

        <RelatedTools current="/tools/base-converter" />
      </div>
    </div>
  );
}
