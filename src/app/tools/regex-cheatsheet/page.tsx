"use client";

import { useState } from "react";
import Link from "next/link";

interface RegexRow {
  pattern: string;
  description: string;
  example: string;
}

interface RegexCategory {
  name: string;
  rows: RegexRow[];
}

const CATEGORIES: RegexCategory[] = [
  {
    name: "Anchors",
    rows: [
      { pattern: "^", description: "Start of string (or line in multiline mode)", example: "^Hello matches 'Hello world'" },
      { pattern: "$", description: "End of string (or line in multiline mode)", example: "world$ matches 'Hello world'" },
      { pattern: "\\b", description: "Word boundary — transition between \\w and \\W", example: "\\bcat\\b matches 'cat' but not 'catfish'" },
      { pattern: "\\B", description: "Non-word boundary", example: "\\Bcat\\B matches 'scattered'" },
    ],
  },
  {
    name: "Character Classes",
    rows: [
      { pattern: "\\d", description: "Any digit — equivalent to [0-9]", example: "\\d+ matches '42' in 'foo42bar'" },
      { pattern: "\\w", description: "Word character — [a-zA-Z0-9_]", example: "\\w+ matches 'hello_2'" },
      { pattern: "\\s", description: "Whitespace — space, tab, newline, etc.", example: "\\s+ matches spaces and tabs" },
      { pattern: "\\D", description: "Non-digit — [^0-9]", example: "\\D+ matches 'abc' in 'abc123'" },
      { pattern: "\\W", description: "Non-word character — [^a-zA-Z0-9_]", example: "\\W matches '!' in 'hello!'" },
      { pattern: "\\S", description: "Non-whitespace character", example: "\\S+ matches 'hello' (no spaces)" },
      { pattern: "[abc]", description: "Character set — matches a, b, or c", example: "[aeiou] matches any vowel" },
      { pattern: "[^abc]", description: "Negated set — matches anything except a, b, or c", example: "[^0-9] matches any non-digit" },
      { pattern: "[a-z]", description: "Range — any lowercase letter a through z", example: "[a-zA-Z] matches any letter" },
    ],
  },
  {
    name: "Quantifiers",
    rows: [
      { pattern: "*", description: "Zero or more of the preceding element", example: "a* matches '', 'a', 'aaa'" },
      { pattern: "+", description: "One or more of the preceding element", example: "a+ matches 'a', 'aaa' but not ''" },
      { pattern: "?", description: "Zero or one — makes preceding element optional", example: "colou?r matches 'color' and 'colour'" },
      { pattern: "{n}", description: "Exactly n repetitions", example: "\\d{4} matches exactly 4 digits" },
      { pattern: "{n,}", description: "n or more repetitions", example: "\\w{3,} matches words with 3+ chars" },
      { pattern: "{n,m}", description: "Between n and m repetitions (inclusive)", example: "\\d{2,4} matches 2 to 4 digits" },
      { pattern: "*?", description: "Lazy (non-greedy) zero or more — matches as few as possible", example: "<.+?> matches each tag individually" },
      { pattern: "+?", description: "Lazy one or more — matches as few as possible", example: "a+? matches only the first 'a'" },
    ],
  },
  {
    name: "Groups & Lookaround",
    rows: [
      { pattern: "(abc)", description: "Capturing group — captures the match for back-reference", example: "(\\d+) captures the number" },
      { pattern: "(?:abc)", description: "Non-capturing group — groups without capturing", example: "(?:foo|bar)+ matches 'foobar'" },
      { pattern: "(?=abc)", description: "Positive lookahead — matches if followed by abc", example: "\\d+(?= dollars) matches digits before ' dollars'" },
      { pattern: "(?!abc)", description: "Negative lookahead — matches if NOT followed by abc", example: "\\d+(?! dollars) matches digits not before ' dollars'" },
      { pattern: "(?<=abc)", description: "Positive lookbehind — matches if preceded by abc", example: "(?<=\\$)\\d+ matches digits after '$'" },
      { pattern: "(?<!abc)", description: "Negative lookbehind — matches if NOT preceded by abc", example: "(?<!\\$)\\d+ matches digits not after '$'" },
    ],
  },
  {
    name: "Common Patterns",
    rows: [
      { pattern: "^[\\w.+-]+@[\\w-]+\\.[\\w.]+$", description: "Email address (basic validation)", example: "user@example.com" },
      { pattern: "https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+", description: "URL (http or https)", example: "https://example.com/path?q=1" },
      { pattern: "^(\\+1)?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$", description: "US phone number (various formats)", example: "(555) 867-5309 or 555-867-5309" },
      { pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", description: "ISO date YYYY-MM-DD", example: "2024-01-15" },
      { pattern: "^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$", description: "IPv4 address", example: "192.168.1.1" },
      { pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", description: "Hex color code", example: "#fff or #3b82f6" },
      { pattern: "^\\d{5}(-\\d{4})?$", description: "US ZIP code (5 or 9 digit)", example: "90210 or 90210-1234" },
      { pattern: "^4[0-9]{12}(?:[0-9]{3})?$", description: "Visa credit card number", example: "4111111111111111" },
    ],
  },
];

export default function RegexCheatsheetPage() {
  const [search, setSearch] = useState("");
  const [copiedPattern, setCopiedPattern] = useState<string | null>(null);

  const q = search.toLowerCase().trim();

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    rows: cat.rows.filter(
      r =>
        !q ||
        r.pattern.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.example.toLowerCase().includes(q)
    ),
  })).filter(cat => cat.rows.length > 0);

  const copyPattern = async (pattern: string) => {
    await navigator.clipboard.writeText(pattern);
    setCopiedPattern(pattern);
    setTimeout(() => setCopiedPattern(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Regex Cheat Sheet</h1>
        <p className="text-slate-500 text-sm mb-8">Searchable reference for regular expression syntax with examples and one-click copy.</p>

        {/* Search */}
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patterns, descriptions, examples…"
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-2xl pl-11 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <p className="text-slate-500 text-center py-12">No patterns match &ldquo;{search}&rdquo;</p>
        )}

        <div className="space-y-8">
          {filtered.map(cat => (
            <div key={cat.name}>
              <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                {cat.name}
                <span className="text-slate-600 text-xs font-normal">{cat.rows.length} patterns</span>
              </h2>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide w-44">Pattern</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Description</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Example</th>
                      <th className="w-16" />
                    </tr>
                  </thead>
                  <tbody>
                    {cat.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <code className="font-mono text-blue-300 text-xs bg-slate-800/70 px-1.5 py-0.5 rounded break-all">{row.pattern}</code>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-xs align-top leading-relaxed">{row.description}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs align-top leading-relaxed hidden md:table-cell">{row.example}</td>
                        <td className="px-4 py-3 align-top">
                          <button
                            onClick={() => copyPattern(row.pattern)}
                            className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                          >
                            {copiedPattern === row.pattern ? "Copied!" : "Copy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
