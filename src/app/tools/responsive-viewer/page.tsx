"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Smartphone, Plus, X, RotateCw, ExternalLink, AlertTriangle } from "lucide-react";

type Device = {
  id: string;
  name: string;
  width: number;
  height: number;
  custom?: boolean;
};

const PRESETS: Device[] = [
  { id: "iphone-se", name: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 393, height: 852 },
  { id: "pixel-7", name: "Pixel 7", width: 412, height: 915 },
  { id: "ipad-mini", name: "iPad Mini", width: 768, height: 1024 },
  { id: "ipad-pro", name: "iPad Pro", width: 1024, height: 1366 },
  { id: "laptop", name: "Laptop", width: 1366, height: 768 },
  { id: "desktop", name: "Desktop", width: 1920, height: 1080 },
];

const DEFAULT_SELECTED = ["iphone-14-pro", "ipad-mini", "laptop"];

const CARD_WIDTH = 280;

function DeviceFrame({ device, url, reloadKey }: { device: Device; url: string; reloadKey: number }) {
  const scale = Math.min(1, CARD_WIDTH / device.width);
  const displayWidth = device.width * scale;
  const displayHeight = device.height * scale;

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-900/80">
        <span className="text-slate-300 text-xs font-medium truncate">{device.name}</span>
        <span className="text-slate-600 text-[11px] tabular-nums shrink-0 ml-2">
          {device.width}×{device.height}
        </span>
      </div>
      <div className="flex items-center justify-center bg-slate-950/60 p-3">
        <div
          className="relative bg-white rounded-md overflow-hidden shadow-lg shadow-black/30"
          style={{ width: displayWidth, height: displayHeight }}
        >
          <iframe
            key={reloadKey}
            src={url}
            title={`${device.name} preview`}
            style={{
              width: device.width,
              height: device.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResponsiveViewerPage() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [customDevices, setCustomDevices] = useState<Device[]>([]);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const allDevices = useMemo(() => [...PRESETS, ...customDevices], [customDevices]);
  const activeDevices = useMemo(
    () => allDevices.filter((d) => selected.includes(d.id)),
    [allDevices, selected]
  );

  const normalizeUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const load = () => {
    const normalized = normalizeUrl(input);
    if (!normalized) return;
    try {
      new URL(normalized);
    } catch {
      setError("Enter a valid URL");
      return;
    }
    setError("");
    setUrl(normalized);
    setReloadKey((k) => k + 1);
  };

  const toggleDevice = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addCustomDevice = () => {
    const w = parseInt(customWidth, 10);
    const h = parseInt(customHeight, 10);
    if (!w || !h || w < 50 || h < 50 || w > 4000 || h > 4000) return;
    const id = `custom-${Date.now()}`;
    setCustomDevices((prev) => [...prev, { id, name: `Custom ${w}×${h}`, width: w, height: h, custom: true }]);
    setSelected((prev) => [...prev, id]);
    setCustomWidth("");
    setCustomHeight("");
  };

  const removeCustomDevice = (id: string) => {
    setCustomDevices((prev) => prev.filter((d) => d.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Smartphone className="w-7 h-7 text-blue-400" />
            Responsive Design Viewer
          </h1>
          <p className="text-slate-500 text-sm">
            Preview a page at multiple device sizes side by side, right in your browser.
          </p>
        </div>

        {/* URL input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
            placeholder="example.com or https://example.com/page"
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600"
          />
          <button
            onClick={load}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            type="button"
          >
            Load
          </button>
          {url && (
            <>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                type="button"
                title="Reload all previews"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Device picker */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDevice(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selected.includes(d.id)
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
                type="button"
              >
                {d.name} <span className="text-slate-500">{d.width}×{d.height}</span>
              </button>
            ))}
            {customDevices.map((d) => (
              <span
                key={d.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selected.includes(d.id)
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400"
                }`}
              >
                <button onClick={() => toggleDevice(d.id)} type="button">
                  {d.name}
                </button>
                <button
                  onClick={() => removeCustomDevice(d.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  type="button"
                  title="Remove custom device"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              placeholder="Width"
              className="w-24 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600"
            />
            <span className="text-slate-600 text-xs">×</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              placeholder="Height"
              className="w-24 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/60 placeholder:text-slate-600"
            />
            <button
              onClick={addCustomDevice}
              disabled={!customWidth || !customHeight}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors border border-slate-700/60"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              Add custom size
            </button>
          </div>
        </div>

        {!url && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-8 text-center">
            <Smartphone className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Enter a URL above to preview it across devices.</p>
          </div>
        )}

        {url && activeDevices.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">Select at least one device above to preview.</p>
          </div>
        )}

        {url && activeDevices.length > 0 && (
          <>
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300 text-xs mb-5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Some sites block embedding via <code className="bg-slate-800/60 px-1 py-0.5 rounded">X-Frame-Options</code> or{" "}
                <code className="bg-slate-800/60 px-1 py-0.5 rounded">Content-Security-Policy</code> headers — those will show
                blank. This works best with your own sites or pages that allow framing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDevices.map((d) => (
                <DeviceFrame key={d.id} device={d} url={url} reloadKey={reloadKey} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
