"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Image as ImageIcon, Download, Copy, Check, AlertTriangle } from "lucide-react";

type Mode = "encode" | "decode";
type Variant = "raw" | "css" | "html" | "markdown";

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/x-icon": "ico",
  "image/avif": "avif",
};

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(2) + " KB";
}

function base64ByteLength(dataUri: string): number {
  const comma = dataUri.indexOf(",");
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  const padding = (b64.match(/=+$/) || [""])[0].length;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export default function ImageToBase64Page() {
  const [mode, setMode] = useState<Mode>("encode");

  const [dataUri, setDataUri] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [variant, setVariant] = useState<Variant>("raw");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [decodeInput, setDecodeInput] = useState("");
  const [decodeMime, setDecodeMime] = useState("image/png");
  const [decodedUri, setDecodedUri] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [decodedSize, setDecodedSize] = useState(0);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUri(result);
      setFileName(file.name);
      setMimeType(file.type);
      setOriginalSize(file.size);
      setVariant("raw");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const wrapped = (() => {
    if (!dataUri) return "";
    switch (variant) {
      case "css": return `background-image: url('${dataUri}');`;
      case "html": return `<img src="${dataUri}" alt="" />`;
      case "markdown": return `![](${dataUri})`;
      default: return dataUri;
    }
  })();

  const copy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const base64Size = dataUri ? base64ByteLength(dataUri) : 0;
  const increasePct = originalSize > 0 ? ((base64Size - originalSize) / originalSize) * 100 : 0;
  const large = originalSize > 1024 * 1024;

  const decode = useCallback((value: string, mime: string) => {
    setDecodeError("");
    setDecodedUri("");
    setDecodedSize(0);
    const trimmed = value.trim();
    if (!trimmed) return;
    let uri: string;
    if (trimmed.startsWith("data:")) {
      if (!/^data:image\//.test(trimmed)) {
        setDecodeError("The data URI does not appear to be an image.");
        return;
      }
      uri = trimmed;
    } else {
      uri = `data:${mime};base64,${trimmed.replace(/\s/g, "")}`;
    }
    try {
      const comma = uri.indexOf(",");
      const b64 = uri.slice(comma + 1).replace(/\s/g, "");
      const binary = atob(b64);
      setDecodedSize(binary.length);
      setDecodedUri(uri);
    } catch {
      setDecodeError("Invalid Base64 | could not decode this string.");
    }
  }, []);

  const handleDecodeInput = (v: string) => {
    setDecodeInput(v);
    decode(v, decodeMime);
  };

  const handleDecodeMime = (m: string) => {
    setDecodeMime(m);
    decode(decodeInput, m);
  };

  const download = () => {
    if (!decodedUri) return;
    const comma = decodedUri.indexOf(",");
    const header = decodedUri.slice(5, comma);
    const mime = header.split(";")[0] || "image/png";
    const b64 = decodedUri.slice(comma + 1).replace(/\s/g, "");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image.${MIME_EXT[mime] || "bin"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setDataUri("");
    setFileName("");
    setMimeType("");
    setOriginalSize(0);
    setVariant("raw");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Image to Base64 / Data URI</h1>
        <p className="text-slate-500 text-sm mb-8">Convert images to Base64 Data URIs, or decode a Data URI back to a downloadable image. Everything runs in your browser.</p>

        <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 mb-6 w-fit">
          {([["encode", "Image → Base64"], ["decode", "Base64 → Image"]] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="space-y-5">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-blue-500/60 bg-blue-500/5" : "border-slate-700/60 hover:border-slate-600"}`}
            >
              <Upload className="w-7 h-7 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-medium">Drop an image here or click to browse</p>
              <p className="text-slate-600 text-xs mt-1">PNG, JPEG, GIF, WebP, SVG and more</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </div>

            {dataUri && (
              <>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                  <div className="flex items-start gap-5">
                    <img src={dataUri} alt={fileName} className="max-h-48 rounded-lg border border-slate-800/60" />
                    <div className="flex-1 min-w-0 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Filename</span>
                        <span className="text-slate-200 truncate">{fileName}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">MIME type</span>
                        <span className="text-slate-200">{mimeType || "unknown"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Original size</span>
                        <span className="text-slate-200">{formatKB(originalSize)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Base64 size</span>
                        <span className="text-slate-200">{formatKB(base64Size)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Size increase</span>
                        <span className="text-amber-400">+{increasePct.toFixed(1)}%</span>
                      </div>
                      <button onClick={reset} className="text-slate-600 hover:text-slate-400 text-xs transition-colors pt-1">
                        Clear / upload another
                      </button>
                    </div>
                  </div>
                </div>

                {large && (
                  <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-200/90 text-sm">
                      This image is over 1 MB. Base64-embedding large images bloats your HTML/CSS, can&apos;t be cached separately, and is usually not recommended over linking a real image URL.
                    </p>
                  </div>
                )}

                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1 bg-slate-950/60 border border-slate-800/60 rounded-lg p-1">
                      {([["raw", "Raw Data URI"], ["css", "CSS"], ["html", "HTML"], ["markdown", "Markdown"]] as const).map(([v, label]) => (
                        <button
                          key={v}
                          onClick={() => setVariant(v)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${variant === v ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => copy(wrapped)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={wrapped}
                    className="w-full h-40 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono text-xs resize-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {mode === "decode" && (
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Data URI or raw Base64</label>
                <textarea
                  value={decodeInput}
                  onChange={(e) => handleDecodeInput(e.target.value)}
                  placeholder="data:image/png;base64,iVBORw0KGgo... or raw Base64"
                  className="w-full h-40 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono text-xs resize-none"
                />
              </div>
              {decodeInput.trim() && !decodeInput.trim().startsWith("data:") && (
                <div className="flex items-center gap-3">
                  <label className="text-slate-400 text-xs">MIME type</label>
                  <select
                    value={decodeMime}
                    onChange={(e) => handleDecodeMime(e.target.value)}
                    className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  >
                    <option value="image/png">image/png</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/gif">image/gif</option>
                    <option value="image/webp">image/webp</option>
                    <option value="image/svg+xml">image/svg+xml</option>
                  </select>
                </div>
              )}
            </div>

            {decodeError && (
              <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-200/90 text-sm">{decodeError}</p>
              </div>
            )}

            {decodedUri && !decodeError && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-center bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
                  <img
                    src={decodedUri}
                    alt="Decoded"
                    className="max-h-64 rounded-lg"
                    onError={() => setDecodeError("This data could not be rendered as an image.")}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    Decoded size: <span className="text-slate-200">{formatKB(decodedSize)}</span>
                  </div>
                  <button
                    onClick={download}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
