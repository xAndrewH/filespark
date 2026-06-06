"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Upload } from "lucide-react";

type TextPosition = "top-left" | "center" | "bottom-left";

const CANVAS_W = 1280;
const CANVAS_H = 720;

function renderThumbnail(
  canvas: HTMLCanvasElement,
  params: {
    bgMode: "solid" | "gradient";
    bgColor: string;
    bgColor2: string;
    title: string;
    subtitle: string;
    titleSize: number;
    titleColor: string;
    textPosition: TextPosition;
    textShadow: boolean;
    bgImageUrl: string | null;
    overlayOpacity: number;
    accentBar: boolean;
    accentColor: string;
  }
) {
  const {
    bgMode, bgColor, bgColor2, title, subtitle, titleSize, titleColor,
    textPosition, textShadow, bgImageUrl, overlayOpacity, accentBar, accentColor,
  } = params;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (bgMode === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, bgColor2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const drawRest = () => {
    if (overlayOpacity > 0) {
      ctx.fillStyle = `rgba(0,0,0,${overlayOpacity / 100})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    if (accentBar) {
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, 14, CANVAS_H);
    }

    const textX = accentBar ? 60 : 60;
    let textY: number;
    const titleSizeNum = titleSize;
    const subtitleSizeNum = Math.round(titleSizeNum * 0.45);
    const gap = Math.round(titleSizeNum * 0.3);

    if (textPosition === "top-left") {
      textY = 80;
    } else if (textPosition === "center") {
      const totalH = titleSizeNum + (subtitle ? gap + subtitleSizeNum : 0);
      textY = (CANVAS_H - totalH) / 2;
    } else {
      const totalH = titleSizeNum + (subtitle ? gap + subtitleSizeNum : 0);
      textY = CANVAS_H - totalH - 80;
    }

    if (textShadow) {
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSizeNum}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
    ctx.textBaseline = "top";

    if (textPosition === "center") {
      ctx.textAlign = "center";
      ctx.fillText(title || "Your Title Here", CANVAS_W / 2, textY);
      if (subtitle) {
        ctx.font = `${subtitleSizeNum}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = titleColor + "cc";
        ctx.fillText(subtitle, CANVAS_W / 2, textY + titleSizeNum + gap);
      }
    } else {
      ctx.textAlign = "left";
      ctx.fillText(title || "Your Title Here", textX, textY);
      if (subtitle) {
        ctx.font = `${subtitleSizeNum}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = titleColor + "cc";
        ctx.fillText(subtitle, textX, textY + titleSizeNum + gap);
      }
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  };

  if (bgImageUrl) {
    const img = new Image();
    img.onload = () => {
      const scale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - sw) / 2, (CANVAS_H - sh) / 2, sw, sh);
      drawRest();
    };
    img.src = bgImageUrl;
  } else {
    drawRest();
  }
}

export default function YoutubeThumbnailPage() {
  const [bgMode, setBgMode]               = useState<"solid" | "gradient">("gradient");
  const [bgColor, setBgColor]             = useState("#1a1a2e");
  const [bgColor2, setBgColor2]           = useState("#e94560");
  const [title, setTitle]                 = useState("");
  const [subtitle, setSubtitle]           = useState("");
  const [titleSize, setTitleSize]         = useState(72);
  const [titleColor, setTitleColor]       = useState("#ffffff");
  const [textPosition, setTextPosition]   = useState<TextPosition>("center");
  const [textShadow, setTextShadow]       = useState(true);
  const [bgImageUrl, setBgImageUrl]       = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [accentBar, setAccentBar]         = useState(false);
  const [accentColor, setAccentColor]     = useState("#ff0000");
  const canvasRef                         = useRef<HTMLCanvasElement>(null);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    renderThumbnail(canvas, {
      bgMode, bgColor, bgColor2, title, subtitle, titleSize, titleColor,
      textPosition, textShadow, bgImageUrl, overlayOpacity, accentBar, accentColor,
    });
  }, [bgMode, bgColor, bgColor2, title, subtitle, titleSize, titleColor, textPosition, textShadow, bgImageUrl, overlayOpacity, accentBar, accentColor]);

  useEffect(() => { draw(); }, [draw]);

  const download = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_W;
    offscreen.height = CANVAS_H;

    const doDownload = () => {
      offscreen.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "thumbnail.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    };

    const ctx = offscreen.getContext("2d")!;
    if (bgMode === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, bgColor2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const finalize = () => {
      renderThumbnail(offscreen, {
        bgMode, bgColor, bgColor2, title, subtitle, titleSize, titleColor,
        textPosition, textShadow, bgImageUrl, overlayOpacity, accentBar, accentColor,
      });
      setTimeout(doDownload, 100);
    };

    if (bgImageUrl) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        ctx.drawImage(img, (CANVAS_W - sw) / 2, (CANVAS_H - sh) / 2, sw, sh);
        finalize();
      };
      img.src = bgImageUrl;
    } else {
      finalize();
    }
  };

  const handleBgImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setBgImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const TEXT_POSITIONS: { id: TextPosition; label: string }[] = [
    { id: "top-left", label: "Top Left" },
    { id: "center", label: "Center" },
    { id: "bottom-left", label: "Bottom Left" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">YouTube Thumbnail Generator</h1>
        <p className="text-slate-500 text-sm mb-8">Design custom 1280×720 YouTube thumbnails in your browser.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <p className="text-slate-300 text-sm font-medium">Background</p>

              <div className="flex gap-2">
                {(["solid", "gradient"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setBgMode(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${bgMode === m ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 items-center">
                <div className="space-y-1 flex-1">
                  <label className="text-slate-400 text-xs block">{bgMode === "gradient" ? "Color 1" : "Color"}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                  </div>
                </div>
                {bgMode === "gradient" && (
                  <div className="space-y-1 flex-1">
                    <label className="text-slate-400 text-xs block">Color 2</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <input value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Background image (optional)</label>
                <div
                  className="border border-dashed border-slate-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-blue-500/40 transition-colors"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleBgImage(f); }}
                >
                  <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-500 text-xs">{bgImageUrl ? "Image loaded — click to replace" : "Drop image or click to upload"}</span>
                  {bgImageUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setBgImageUrl(null); }}
                      className="ml-auto text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBgImage(f); }} />
                </div>
              </div>

              {bgImageUrl && (
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs block">Overlay opacity: {overlayOpacity}%</label>
                  <input type="range" min={0} max={80} value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <p className="text-slate-300 text-sm font-medium">Text</p>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your title here"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Subtitle</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Title font size: {titleSize}px</label>
                <input type="range" min={24} max={120} value={titleSize} onChange={(e) => setTitleSize(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Title color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <input value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Text position</label>
                <div className="flex gap-2">
                  {TEXT_POSITIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTextPosition(p.id)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${textPosition === p.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={textShadow} onChange={(e) => setTextShadow(e.target.checked)} className="accent-blue-500" />
                <span className="text-slate-400 text-xs">Text shadow</span>
              </label>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm font-medium">Accent bar</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={accentBar} onChange={(e) => setAccentBar(e.target.checked)} className="accent-blue-500" />
                  <span className="text-slate-400 text-xs">Enable</span>
                </label>
              </div>
              {accentBar && (
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <p className="text-slate-400 text-xs mb-3">Preview (1280×720)</p>
              <div style={{ aspectRatio: "16/9" }} className="relative w-full overflow-hidden rounded-lg bg-slate-800">
                <canvas
                  ref={canvasRef}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            </div>
            <button
              onClick={download}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download thumbnail.png
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
