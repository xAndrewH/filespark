"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check, Plus, Trash2, Download } from "lucide-react";

const USER_AGENT_SUGGESTIONS = ["*", "Googlebot", "Bingbot", "GPTBot", "CCBot", "DuckDuckBot", "Slurp", "Baiduspider"];

interface RuleGroup {
  id: number;
  userAgent: string;
  crawlDelay: string;
  allows: string[];
  disallows: string[];
}

let nextId = 2;

function generateRobotsTxt(groups: RuleGroup[], sitemapUrl: string): string {
  const parts: string[] = [];

  for (const group of groups) {
    const lines: string[] = [];
    lines.push(`User-agent: ${group.userAgent || "*"}`);
    if (group.crawlDelay) lines.push(`Crawl-delay: ${group.crawlDelay}`);
    for (const path of group.disallows) {
      if (path) lines.push(`Disallow: ${path}`);
    }
    for (const path of group.allows) {
      if (path) lines.push(`Allow: ${path}`);
    }
    parts.push(lines.join("\n"));
  }

  if (sitemapUrl) {
    parts.push(`Sitemap: ${sitemapUrl}`);
  }

  return parts.join("\n\n");
}

export default function RobotsGeneratorPage() {
  const [groups, setGroups] = useState<RuleGroup[]>([
    { id: 1, userAgent: "*", crawlDelay: "", allows: ["/"], disallows: [] },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const output = generateRobotsTxt(groups, sitemapUrl);

  const updateGroup = (id: number, patch: Partial<RuleGroup>) => {
    setGroups(gs => gs.map(g => g.id === id ? { ...g, ...patch } : g));
  };

  const addGroup = () => {
    setGroups(gs => [...gs, { id: nextId++, userAgent: "", crawlDelay: "", allows: [], disallows: [] }]);
  };

  const removeGroup = (id: number) => {
    setGroups(gs => gs.filter(g => g.id !== id));
  };

  const addPath = (id: number, type: "allows" | "disallows") => {
    setGroups(gs => gs.map(g => g.id === id ? { ...g, [type]: [...g[type], "/"] } : g));
  };

  const updatePath = (id: number, type: "allows" | "disallows", index: number, val: string) => {
    setGroups(gs => gs.map(g => {
      if (g.id !== id) return g;
      const arr = [...g[type]];
      arr[index] = val;
      return { ...g, [type]: arr };
    }));
  };

  const removePath = (id: number, type: "allows" | "disallows", index: number) => {
    setGroups(gs => gs.map(g => {
      if (g.id !== id) return g;
      const arr = g[type].filter((_, i) => i !== index);
      return { ...g, [type]: arr };
    }));
  };

  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Robots.txt Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Build a robots.txt file visually and download it for your site.</p>

        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Sitemap URL</p>
            <input
              type="url"
              value={sitemapUrl}
              onChange={e => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>

          {groups.map((group, gi) => (
            <div key={group.id} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">User-agent Block {gi + 1}</p>
                {groups.length > 1 && (
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">User-agent</p>
                  <input
                    type="text"
                    list={`ua-list-${group.id}`}
                    value={group.userAgent}
                    onChange={e => updateGroup(group.id, { userAgent: e.target.value })}
                    placeholder="*"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                  <datalist id={`ua-list-${group.id}`}>
                    {USER_AGENT_SUGGESTIONS.map(ua => (
                      <option key={ua} value={ua} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Crawl-delay (optional)</p>
                  <input
                    type="number"
                    min={0}
                    value={group.crawlDelay}
                    onChange={e => updateGroup(group.id, { crawlDelay: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Disallow</p>
                  <button
                    onClick={() => addPath(group.id, "disallows")}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add path
                  </button>
                </div>
                {group.disallows.length === 0 && (
                  <p className="text-xs text-slate-600 italic">No disallow rules.</p>
                )}
                <div className="space-y-2">
                  {group.disallows.map((path, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={e => updatePath(group.id, "disallows", i, e.target.value)}
                        placeholder="/admin/"
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                      <button onClick={() => removePath(group.id, "disallows", i)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Allow</p>
                  <button
                    onClick={() => addPath(group.id, "allows")}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add path
                  </button>
                </div>
                {group.allows.length === 0 && (
                  <p className="text-xs text-slate-600 italic">No allow rules.</p>
                )}
                <div className="space-y-2">
                  {group.allows.map((path, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={e => updatePath(group.id, "allows", i, e.target.value)}
                        placeholder="/"
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                      <button onClick={() => removePath(group.id, "allows", i)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addGroup}
            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60 inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add another user-agent block
          </button>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700/60"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={download}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={12}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
