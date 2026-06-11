"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Standard copy-to-clipboard button used across all tools so the feedback
 * pattern is identical everywhere: icon + label flips to a green "Copied"
 * state for 1.5s after a successful copy.
 *
 * `text` may be a string or a function returning the string, so callers can
 * defer building large outputs until the moment of the click.
 */
export function CopyButton({
  text,
  label = "Copy",
  className = "",
  disabled = false,
}: {
  text: string | (() => string);
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    const value = typeof text === "function" ? text() : text;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (rare) — nothing useful to show.
    }
  };

  return (
    <button
      onClick={copy}
      disabled={disabled}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        copied
          ? "bg-green-600/20 border-green-500/40 text-green-400"
          : "bg-slate-800 hover:bg-slate-700 border-slate-700/60 text-slate-300 hover:text-white"
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
