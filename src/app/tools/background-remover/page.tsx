"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Eraser, Brush, Undo2, RotateCcw, Check, X, Eye } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RelatedTools } from "@/components/RelatedTools";

type BgOption = "transparent" | "white" | "black" | "custom" | "blur";
type ModelSize = "isnet_quint8" | "isnet";
type EditTool = "erase" | "restore";

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function applyBackground(resultUrl: string, bg: BgOption, customColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      if (bg === "transparent") {
        ctx.drawImage(img, 0, 0);
      } else if (bg === "blur") {
        // Draw blurred original underneath
        const orig = new Image();
        orig.onload = () => {
          ctx.filter = "blur(20px)";
          ctx.drawImage(orig, -20, -20, canvas.width + 40, canvas.height + 40);
          ctx.filter = "none";
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        orig.src = resultUrl;
        return;
      } else {
        ctx.fillStyle = bg === "white" ? "#ffffff" : bg === "black" ? "#000000" : customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = resultUrl;
  });
}

const BG_OPTIONS: { id: BgOption; label: string; preview: string }[] = [
  { id: "transparent", label: "Transparent", preview: "repeating-conic-gradient(#374151 0% 25%,#1e293b 0% 50%) 0 0/12px 12px" },
  { id: "white",       label: "White",       preview: "#ffffff" },
  { id: "black",       label: "Black",       preview: "#000000" },
  { id: "blur",        label: "Blur BG",     preview: "linear-gradient(135deg,#6366f1,#ec4899)" },
  { id: "custom",      label: "Custom",      preview: "" },
];

export default function BackgroundRemoverPage() {
  const [original, setOriginal]     = useState<string | null>(null);
  const [rawResult, setRawResult]   = useState<string | null>(null);  // current cutout (with manual edits applied)
  const [display, setDisplay]       = useState<string | null>(null);  // with bg applied
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress]     = useState("");
  const [error, setError]           = useState("");
  const [fileName, setFileName]     = useState("image");
  const [model, setModel]           = useState<ModelSize>("isnet");
  const [bg, setBg]                 = useState<BgOption>("transparent");
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [sliderPos, setSliderPos]   = useState(50);
  const [showSlider, setShowSlider] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentFile = useRef<File | null>(null);

  // Manual touch-up (erase/restore) state
  const [editMode, setEditMode]       = useState(false);
  const [editTool, setEditTool]       = useState<EditTool>("erase");
  const [brushSize, setBrushSize]     = useState(40);
  const [canUndo, setCanUndo]         = useState(false);
  const [showOriginalEdit, setShowOriginalEdit] = useState(false);
  const [cursorPos, setCursorPos]     = useState<{ x: number; y: number } | null>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const aiResultRef   = useRef<string | null>(null);
  const historyRef    = useRef<ImageData[]>([]);
  const drawingRef    = useRef(false);
  const lastPointRef  = useRef<{ x: number; y: number } | null>(null);

  const updateDisplay = useCallback(async (resultUrl: string, bgOpt: BgOption, color: string) => {
    const out = await applyBackground(resultUrl, bgOpt, color);
    setDisplay(out);
  }, []);

  const run = useCallback(async (file: File) => {
    setOriginal(URL.createObjectURL(file));
    setRawResult(null);
    setDisplay(null);
    setError("");
    setShowSlider(false);
    setEditMode(false);
    aiResultRef.current = null;
    setProcessing(true);
    setProgress("Loading AI model…");
    currentFile.current = file;
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Processing image…");
      const blob = await removeBackground(file, {
        model,
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) setProgress(`AI model: ${Math.round((current / total) * 100)}%`);
        },
      });
      const url = URL.createObjectURL(blob);
      setRawResult(url);
      aiResultRef.current = url;
      await updateDisplay(url, bg, customColor);
      setShowSlider(true);
    } catch (e) {
      setError((e as Error).message);
    }
    setProgress("");
    setProcessing(false);
  }, [model, bg, customColor, updateDisplay]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    run(file);
  };

  const reprocess = () => { if (currentFile.current) run(currentFile.current); };

  const changeBg = async (newBg: BgOption) => {
    setBg(newBg);
    if (rawResult) await updateDisplay(rawResult, newBg, customColor);
  };

  const changeColor = async (color: string) => {
    setCustomColor(color);
    if (rawResult && bg === "custom") await updateDisplay(rawResult, "custom", color);
  };

  const download = () => {
    if (!display) return;
    const a = document.createElement("a");
    a.href = display;
    a.download = `${fileName}_no_bg.png`;
    a.click();
  };

  // ---- Manual erase / restore editor ----

  const openEditor = useCallback(async () => {
    if (!rawResult || !original) return;
    const [resImg, origImg] = await Promise.all([loadImageEl(rawResult), loadImageEl(original)]);
    const canvas = editCanvasRef.current;
    const oc = origCanvasRef.current;
    if (!canvas || !oc) return;

    canvas.width = resImg.naturalWidth;
    canvas.height = resImg.naturalHeight;
    canvas.getContext("2d")!.drawImage(resImg, 0, 0, canvas.width, canvas.height);

    oc.width = canvas.width;
    oc.height = canvas.height;
    oc.getContext("2d")!.drawImage(origImg, 0, 0, oc.width, oc.height);

    historyRef.current = [];
    setCanUndo(false);
    setShowOriginalEdit(false);
    setEditMode(true);
  }, [rawResult, original]);

  const paintAt = useCallback((x: number, y: number, radius: number) => {
    const canvas = editCanvasRef.current;
    const oc = origCanvasRef.current;
    if (!canvas || !oc) return;
    const ctx = canvas.getContext("2d")!;
    if (editTool === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(oc, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [editTool]);

  const getImagePos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = editCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      radius: (brushSize / 2) * scaleX,
    };
  };

  const strokeTo = useCallback((x: number, y: number, radius: number) => {
    const last = lastPointRef.current;
    if (!last) {
      paintAt(x, y, radius);
    } else {
      const dist = Math.hypot(x - last.x, y - last.y);
      const step = Math.max(1, radius / 2);
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        paintAt(last.x + (x - last.x) * t, last.y + (y - last.y) * t, radius);
      }
    }
    lastPointRef.current = { x, y };
  }, [paintAt]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (showOriginalEdit) return;
    e.preventDefault();
    const canvas = editCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
    setCanUndo(true);
    drawingRef.current = true;
    lastPointRef.current = null;
    const { x, y, radius } = getImagePos(e);
    strokeTo(x, y, radius);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!drawingRef.current || showOriginalEdit) return;
    if (e.buttons !== 1) { drawingRef.current = false; return; }
    const { x, y, radius } = getImagePos(e);
    strokeTo(x, y, radius);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const undo = () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const snap = historyRef.current.pop();
    if (!snap) return;
    canvas.getContext("2d")!.putImageData(snap, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  };

  const resetEdits = async () => {
    const canvas = editCanvasRef.current;
    if (!canvas || !aiResultRef.current) return;
    const img = await loadImageEl(aiResultRef.current);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    setCanUndo(false);
  };

  const applyEdits = async () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setRawResult(url);
    await updateDisplay(url, bg, customColor);
    setEditMode(false);
  };

  const cancelEdits = () => setEditMode(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Background Remover</h1>
        <p className="text-slate-500 text-sm mb-8">Remove image backgrounds and replace them | entirely in your browser, nothing uploaded.</p>

        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap gap-4">
              {/* Model */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Model</span>
                {([["isnet_quint8", "Fast"], ["isnet", "Quality"]] as [ModelSize, string][]).map(([m, label]) => (
                  <button key={m} onClick={() => setModel(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${model === m ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {rawResult && (
              <button onClick={reprocess} disabled={processing}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors disabled:opacity-40">
                ↺ Re-process with new settings
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div
            className="bg-slate-900/60 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            {processing ? (
              <div className="space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">{progress}</p>
                <p className="text-slate-500 text-xs">First use downloads the model (~40 MB). Cached afterwards.</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Drop an image or <span className="text-blue-400">browse</span></p>
                <p className="text-slate-500 text-xs mt-1">Works best with clear subjects: people, products, objects</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (f) handleFile(f); }} />
          </div>

          <ErrorAlert message={error} />

          {/* Comparison slider */}
          {original && display && showSlider && !editMode && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <p className="text-slate-400 text-xs font-medium">Before / After | drag slider</p>
              <div className="relative overflow-hidden rounded-xl select-none"
                style={{ background: "repeating-conic-gradient(#374151 0% 25%,#1e293b 0% 50%) 0 0/16px 16px" }}>
                {/* After (result) | full width */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={display} alt="Result" className="w-full block" />
                {/* Before (original) | clipped to slider position */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={original} alt="Original" className="block" style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }} />
                </div>
                {/* Slider handle */}
                <div className="absolute inset-y-0 flex items-center justify-center" style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}>
                  <div className="w-0.5 h-full bg-white/80" />
                  <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                    </svg>
                  </div>
                </div>
                {/* Drag listener */}
                <div className="absolute inset-0 cursor-ew-resize"
                  onMouseMove={(e) => {
                    if (e.buttons !== 1) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSliderPos(Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)));
                  }}
                  onTouchMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const t = e.touches[0];
                    setSliderPos(Math.max(2, Math.min(98, ((t.clientX - rect.left) / rect.width) * 100)));
                  }}
                />
              </div>
              <div className="flex gap-1 text-[10px] text-slate-600 justify-between px-1">
                <span>← Original</span>
                <span>Result →</span>
              </div>
            </div>
          )}

          {/* Touch up: erase / restore */}
          {rawResult && !processing && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Touch up cutout</p>
                  <p className="text-slate-500 text-xs mt-0.5">Erase leftover background or restore parts the AI removed by mistake.</p>
                </div>
                {!editMode ? (
                  <button onClick={openEditor}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors">
                    <Eraser className="w-3.5 h-3.5" />
                    Erase / Restore
                  </button>
                ) : (
                  <div className="shrink-0 flex gap-2">
                    <button onClick={cancelEdits}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button onClick={applyEdits}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </div>
                )}
              </div>

              {editMode && (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 bg-slate-800/60 border border-slate-700/60 rounded-lg p-1">
                      <button onClick={() => setEditTool("erase")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${editTool === "erase" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                        <Eraser className="w-3.5 h-3.5" />
                        Erase
                      </button>
                      <button onClick={() => setEditTool("restore")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${editTool === "restore" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                        <Brush className="w-3.5 h-3.5" />
                        Restore
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <span className="text-slate-400 text-xs shrink-0">Brush size</span>
                      <input type="range" min={5} max={150} value={brushSize} onChange={(e) => setBrushSize(+e.target.value)} className="flex-1 accent-blue-500" />
                      <span className="text-slate-500 text-xs w-8 text-right font-mono">{brushSize}</span>
                    </div>
                    <button onClick={undo} disabled={!canUndo}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Undo2 className="w-3.5 h-3.5" />
                      Undo
                    </button>
                    <button onClick={resetEdits}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button
                      onPointerDown={() => setShowOriginalEdit(true)}
                      onPointerUp={() => setShowOriginalEdit(false)}
                      onPointerLeave={() => setShowOriginalEdit(false)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors select-none">
                      <Eye className="w-3.5 h-3.5" />
                      Hold to compare
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden select-none"
                    style={{ background: "repeating-conic-gradient(#374151 0% 25%,#1e293b 0% 50%) 0 0/16px 16px", touchAction: "none" }}>
                    <canvas
                      ref={editCanvasRef}
                      className="w-full block cursor-none"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={stopDrawing}
                      onPointerLeave={() => { stopDrawing(); setCursorPos(null); }}
                    />
                    <canvas ref={origCanvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${showOriginalEdit ? "" : "hidden"}`} />
                    {cursorPos && !showOriginalEdit && (
                      <div className="pointer-events-none absolute rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2"
                        style={{ left: cursorPos.x, top: cursorPos.y, width: brushSize, height: brushSize }} />
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">
                    {showOriginalEdit ? "Showing original image." : editTool === "erase" ? "Paint to remove pixels." : "Paint to restore pixels from the original image."}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Background options */}
          {rawResult && !editMode && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-medium">Background</p>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map(({ id, label, preview }) => (
                  <button key={id} onClick={() => changeBg(id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${bg === id ? "border-blue-500/60 bg-blue-500/10 text-blue-300" : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {id !== "custom" ? (
                      <span className="w-4 h-4 rounded border border-slate-600 shrink-0" style={{ background: preview }} />
                    ) : (
                      <input type="color" value={customColor} onClick={(e) => e.stopPropagation()}
                        onChange={(e) => changeColor(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {display && !editMode && (
            <button onClick={download}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Download PNG
            </button>
          )}
        </div>

        <RelatedTools current="/tools/background-remover" />
      </div>
    </div>
  );
}
