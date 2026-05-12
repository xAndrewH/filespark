"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface ExifData {
  [key: string]: unknown;
}

function formatValue(val: unknown): string {
  if (val == null) return "—";
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[0] === "number" && typeof val[1] === "number") {
      return `${val[0]}/${val[1]} (${(val[0] / val[1]).toFixed(4)})`;
    }
    return val.map(v => formatValue(v)).join(", ");
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function formatGps(lat: number[], latRef: string, lon: number[], lonRef: string): string {
  const toDecimal = (dms: number[]) => dms[0] + dms[1] / 60 + dms[2] / 3600;
  const la = toDecimal(lat) * (latRef === "S" ? -1 : 1);
  const lo = toDecimal(lon) * (lonRef === "W" ? -1 : 1);
  return `${la.toFixed(6)}°, ${lo.toFixed(6)}°`;
}

const SECTION_KEYS: Record<string, string[]> = {
  "Camera": ["Make", "Model", "Software", "LensModel", "LensMake"],
  "Image": ["ImageWidth", "ImageHeight", "Orientation", "XResolution", "YResolution", "ResolutionUnit", "ColorSpace"],
  "Capture": ["ExposureTime", "FNumber", "ISO", "ExposureBias", "MeteringMode", "Flash", "FocalLength", "WhiteBalance", "ExposureProgram", "ExposureMode"],
  "Date & Time": ["DateTimeOriginal", "DateTime", "DateTimeDigitized"],
  "GPS": ["GPSLatitude", "GPSLongitude", "GPSAltitude", "GPSSpeed", "GPSImgDirection"],
  "File": ["FileSize", "MIMEType", "FileType"],
};

export default function ExifPage() {
  const [data, setData] = useState<ExifData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setData(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const exifr = await import("exifr");
      const result = await exifr.parse(file, { tiff: true, xmp: true, iptc: true, icc: true, gps: true, translateKeys: true, translateValues: true });
      setData(result ?? {});
    } catch (e) {
      setError(`Could not read EXIF data: ${(e as Error).message}`);
    }
    setLoading(false);
  };

  const gpsStr = data?.GPSLatitude && data?.GPSLongitude
    ? formatGps(data.GPSLatitude as number[], data.GPSLatitudeRef as string, data.GPSLongitude as number[], data.GPSLongitudeRef as string)
    : null;

  const allDisplayedKeys = Object.values(SECTION_KEYS).flat();
  const otherEntries = data ? Object.entries(data).filter(([k]) => !allDisplayedKeys.includes(k) && !k.startsWith("GPS") || (k.startsWith("GPS") && !["GPSLatitude","GPSLongitude","GPSLatitudeRef","GPSLongitudeRef"].includes(k))) : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">EXIF Viewer</h1>
        <p className="text-slate-500 text-sm mb-8">Read image metadata — camera settings, GPS, timestamps and more.</p>

        <div className="space-y-5">
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Reading EXIF data…</p>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="max-h-32 rounded-lg border border-slate-700 object-contain" />
                <p className="text-slate-500 text-xs">Click to load a different image</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm">Drop an image here or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-600 text-xs mt-1">JPEG, HEIC, TIFF, and RAW files typically contain EXIF data</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {data && !loading && (
            <div className="space-y-4">
              {gpsStr && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">GPS Location</p>
                    <p className="text-blue-200 font-mono text-sm mt-0.5">{gpsStr}</p>
                  </div>
                  <a href={`https://maps.google.com/?q=${gpsStr.replace("°, ", ",").replace("°", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors shrink-0">
                    View on map
                  </a>
                </div>
              )}

              {Object.entries(SECTION_KEYS).map(([section, keys]) => {
                const entries = keys.filter(k => data[k] != null).map(k => [k, data[k]] as [string, unknown]);
                if (entries.length === 0) return null;
                return (
                  <div key={section} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <p className="text-white text-sm font-medium mb-3">{section}</p>
                    <div className="space-y-2">
                      {entries.map(([k, v]) => (
                        <div key={k} className="flex gap-4 text-sm">
                          <span className="text-slate-500 w-40 shrink-0 text-xs">{k}</span>
                          <span className="text-slate-300 font-mono text-xs break-all">{formatValue(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {otherEntries.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                  <p className="text-white text-sm font-medium mb-3">Other</p>
                  <div className="space-y-2">
                    {otherEntries.map(([k, v]) => (
                      <div key={k} className="flex gap-4 text-sm">
                        <span className="text-slate-500 w-40 shrink-0 text-xs">{k}</span>
                        <span className="text-slate-300 font-mono text-xs break-all">{formatValue(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(data).length === 0 && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-8 text-center">
                  <p className="text-slate-500 text-sm">No EXIF data found in this image.</p>
                  <p className="text-slate-600 text-xs mt-1">Screenshots and heavily edited images often have no metadata.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
