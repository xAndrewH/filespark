"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────── */
interface Edits {
  width: number; height: number;
  rotation: number; flipH: boolean; flipV: boolean; quality: number;
  brightness: number; contrast: number; saturation: number;
  hue: number; blur: number; opacity: number;
  bgColor: string; filterPreset: string;
}
// Crop stored in original-image coordinate space
interface CropRegion { x: number; y: number; w: number; h: number }
// Markup strokes — points in canvas pixel space at time of drawing
interface Stroke {
  id: string;
  tool: "pen" | "line" | "arrow" | "rect" | "ellipse" | "text";
  color: string; lineWidth: number;
  pts: [number, number][];
  text?: string; fontSize?: number;
}

/* ── Constants ──────────────────────────────────────────────────────── */
const DEFAULT_ADJ = {
  brightness: 100, contrast: 100, saturation: 100,
  hue: 0, blur: 0, opacity: 100, bgColor: "#000000", filterPreset: "none",
};
const FILTER_PRESETS = [
  { id: "none",      label: "None",     v: {} },
  { id: "vivid",     label: "Vivid",    v: { brightness: 110, contrast: 115, saturation: 140 } },
  { id: "matte",     label: "Matte",    v: { brightness: 108, contrast: 90,  saturation: 80  } },
  { id: "warm",      label: "Warm",     v: { brightness: 105, saturation: 110, hue: 15 } },
  { id: "cool",      label: "Cool",     v: { brightness: 100, saturation: 90, hue: -15 } },
  { id: "grayscale", label: "B&W",      v: { saturation: 0 } },
  { id: "sepia",     label: "Sepia",    v: { saturation: 30, brightness: 105, contrast: 95, hue: 30 } },
  { id: "faded",     label: "Faded",    v: { brightness: 115, contrast: 80, saturation: 70 } },
  { id: "dramatic",  label: "Dramatic", v: { brightness: 95, contrast: 140, saturation: 80 } },
  { id: "invert",    label: "Invert",   v: {} },
];
const CROP_RATIOS = [
  { label: "Free",  ratio: null },
  { label: "1:1",   ratio: 1 },
  { label: "16:9",  ratio: 16/9 },
  { label: "4:3",   ratio: 4/3 },
  { label: "3:2",   ratio: 3/2 },
];
const MARKUP_TOOLS = [
  { id: "pen",     label: "Pen",      icon: "✏️" },
  { id: "line",    label: "Line",     icon: "╱" },
  { id: "arrow",   label: "Arrow",    icon: "→" },
  { id: "rect",    label: "Rect",     icon: "▭" },
  { id: "ellipse", label: "Ellipse",  icon: "◯" },
  { id: "text",    label: "Text",     icon: "T" },
  { id: "eraser",  label: "Eraser",   icon: "⌫" },
] as const;

function buildFilter(e: Edits) {
  const p: string[] = [];
  if (e.filterPreset === "invert") p.push("invert(1)");
  p.push(`brightness(${e.brightness}%)`, `contrast(${e.contrast}%)`, `saturate(${e.saturation}%)`);
  if (e.hue)       p.push(`hue-rotate(${e.hue}deg)`);
  if (e.blur > 0)  p.push(`blur(${e.blur}px)`);
  if (e.opacity < 100) p.push(`opacity(${e.opacity}%)`);
  return p.join(" ");
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, scaleX = 1, scaleY = 1) {
  if (s.pts.length === 0) return;
  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.fillStyle   = s.color;
  ctx.lineWidth   = s.lineWidth;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  const px = (i: number) => s.pts[i][0] * scaleX;
  const py = (i: number) => s.pts[i][1] * scaleY;

  if (s.tool === "pen") {
    ctx.beginPath();
    ctx.moveTo(px(0), py(0));
    for (let i = 1; i < s.pts.length; i++) ctx.lineTo(px(i), py(i));
    ctx.stroke();
  } else if (s.tool === "line") {
    ctx.beginPath();
    ctx.moveTo(px(0), py(0));
    ctx.lineTo(px(s.pts.length - 1), py(s.pts.length - 1));
    ctx.stroke();
  } else if (s.tool === "arrow") {
    const [x1, y1] = [px(0), py(0)];
    const [x2, y2] = [px(s.pts.length - 1), py(s.pts.length - 1)];
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const hw = s.lineWidth * 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hw * Math.cos(angle - 0.4), y2 - hw * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - hw * Math.cos(angle + 0.4), y2 - hw * Math.sin(angle + 0.4));
    ctx.closePath(); ctx.fill();
  } else if (s.tool === "rect") {
    const [x1, y1] = [px(0), py(0)];
    const [x2, y2] = [px(s.pts.length - 1), py(s.pts.length - 1)];
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (s.tool === "ellipse") {
    const [x1, y1] = [px(0), py(0)];
    const [x2, y2] = [px(s.pts.length - 1), py(s.pts.length - 1)];
    ctx.beginPath();
    ctx.ellipse((x1+x2)/2, (y1+y2)/2, Math.abs(x2-x1)/2, Math.abs(y2-y1)/2, 0, 0, Math.PI*2);
    ctx.stroke();
  } else if (s.tool === "text" && s.text) {
    ctx.font = `bold ${(s.fontSize ?? 20) * scaleX}px sans-serif`;
    ctx.fillText(s.text, px(0), py(0));
  }
  ctx.restore();
}

type Tab = "transform" | "adjust" | "filters" | "markup" | "output";
type CropDragMode = "new" | "move" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br";

/* ── Component ──────────────────────────────────────────────────────── */
export default function ImageEditorPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [orig, setOrig]       = useState<HTMLImageElement | null>(null);
  const [edits, setEditsRaw]  = useState<Edits>({ ...DEFAULT_ADJ, width: 0, height: 0, rotation: 0, flipH: false, flipV: false, quality: 92 });
  const [cropRgn, setCropRgn] = useState<CropRegion | null>(null); // null = full image
  const [lockAR, setLockAR]   = useState(true);
  const [outputFmt, setFmt]   = useState<"png" | "jpeg" | "webp">("jpeg");
  const [activeTab, setTab]   = useState<Tab>("transform");
  const [zoom, setZoom]       = useState(1);
  const [isDrop, setIsDrop]   = useState(false);

  // Crop UI state
  const [cropMode, setCropMode]         = useState(false);
  const [cropRatio, setCropRatio]       = useState<number | null>(null);
  const [cropSel, setCropSel]           = useState<{x:number;y:number;w:number;h:number} | null>(null);
  const cropDragRef = useRef<{sx:number;sy:number;mode:CropDragMode;initialSel:{x:number;y:number;w:number;h:number}|null;origCrop:CropRegion;editsW:number;editsH:number}|null>(null);

  // Markup state
  const [strokes, setStrokes]       = useState<Stroke[]>([]);
  const [curStroke, setCurStrokeState] = useState<Stroke | null>(null);
  const curStrokeRef = useRef<Stroke | null>(null);
  const setCurStroke = (s: Stroke | null) => { curStrokeRef.current = s; setCurStrokeState(s); };
  const [markupTool, setMarkupTool] = useState<Stroke["tool"] | "eraser">("pen");
  const [markupColor, setMarkupColor] = useState("#ef4444");
  const [markupSize, setMarkupSize]   = useState(4);
  const [markupFontSize, setMarkupFontSize] = useState(24);
  const [pendingText, setPendingText] = useState<{x:number;y:number}|null>(null);
  const [textInput, setTextInput]     = useState("");

  // Undo
  type Snap = { edits: Edits; cropRgn: CropRegion | null; strokes: Stroke[] };
  const historyRef = useRef<Snap[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Refs that mirror state so pushSnap can read them synchronously
  const editsRef   = useRef<Edits>(edits);
  const cropRgnRef = useRef<CropRegion | null>(null);
  const strokesRef = useRef<Stroke[]>([]);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const markupRef  = useRef<HTMLCanvasElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  /* ── Sync refs after every render ──────────────────────────────── */
  useEffect(() => { editsRef.current   = edits;   }, [edits]);
  useEffect(() => { cropRgnRef.current = cropRgn; }, [cropRgn]);
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);

  /* ── History helpers ───────────────────────────────────────────── */
  const pushSnap = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-49),
      { edits: editsRef.current, cropRgn: cropRgnRef.current, strokes: strokesRef.current },
    ];
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.length) return;
    const prev = h[h.length - 1];
    historyRef.current = h.slice(0, -1);
    setEditsRaw(prev.edits);
    setCropRgn(prev.cropRgn);
    setStrokes(prev.strokes);
    setCanUndo(h.length > 1);
  }, []);

  const setEdits = useCallback((upd: Edits | ((e: Edits) => Edits)) => {
    pushSnap();
    setEditsRaw(upd);
  }, [pushSnap]);

  const set = useCallback(<K extends keyof Edits>(k: K, v: Edits[K]) => setEdits((e) => ({ ...e, [k]: v })), [setEdits]);

  /* ── Load image ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOrig(img);
      setEditsRaw({ ...DEFAULT_ADJ, width: img.naturalWidth, height: img.naturalHeight, rotation: 0, flipH: false, flipV: false, quality: 92 });
      setCropRgn(null);
      setStrokes([]);
      setCropMode(false);
      setCropSel(null);
      historyRef.current = [];
      setCanUndo(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  /* ── Render image canvas ───────────────────────────────────────── */
  useEffect(() => {
    if (!orig || !previewRef.current) return;
    const canvas = previewRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Source region (crop in original-image coords)
    const srcX = cropRgn?.x ?? 0;
    const srcY = cropRgn?.y ?? 0;
    const srcW = cropRgn?.w ?? orig.naturalWidth;
    const srcH = cropRgn?.h ?? orig.naturalHeight;

    // Output size (edits.width × edits.height = output of the visible content)
    const dstW = edits.width;
    const dstH = edits.height;

    // Canvas size expanded for rotation
    const rad  = (edits.rotation * Math.PI) / 180;
    const absC = Math.abs(Math.cos(rad));
    const absS = Math.abs(Math.sin(rad));
    const outW = Math.round(dstW * absC + dstH * absS);
    const outH = Math.round(dstW * absS + dstH * absC);

    canvas.width  = outW;
    canvas.height = outH;

    if (outputFmt === "jpeg") { ctx.fillStyle = edits.bgColor; ctx.fillRect(0, 0, outW, outH); }
    else ctx.clearRect(0, 0, outW, outH);

    ctx.filter = buildFilter(edits);
    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.scale(edits.flipH ? -1 : 1, edits.flipV ? -1 : 1);
    // Draw only the crop region of the original, scaled to dstW×dstH
    ctx.drawImage(orig, srcX, srcY, srcW, srcH, -dstW / 2, -dstH / 2, dstW, dstH);
    ctx.restore();
    ctx.filter = "none";
  }, [orig, edits, cropRgn, outputFmt]);

  /* ── Render markup canvas (always on top, same size) ──────────── */
  useEffect(() => {
    if (!markupRef.current || !previewRef.current) return;
    const mc = markupRef.current;
    mc.width  = previewRef.current.width;
    mc.height = previewRef.current.height;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, mc.width, mc.height);
    for (const s of strokes) drawStroke(ctx, s);
    if (curStrokeRef.current) drawStroke(ctx, curStrokeRef.current);
  }, [strokes, curStroke, edits.width, edits.height]);

  /* ── Crop drag (document-level, no mouseLeave issues) ─────────── */
  useEffect(() => {
    if (!cropMode) return;
    const onMove = (e: MouseEvent) => {
      if (!cropDragRef.current || !previewRef.current) return;
      const { sx, sy, mode, initialSel } = cropDragRef.current;
      const rect   = previewRef.current.getBoundingClientRect();
      const scaleX = previewRef.current.width  / rect.width;
      const scaleY = previewRef.current.height / rect.height;
      const maxW   = previewRef.current.width;
      const maxH   = previewRef.current.height;
      const cx = Math.max(0, Math.min((e.clientX - rect.left) * scaleX, maxW));
      const cy = Math.max(0, Math.min((e.clientY - rect.top)  * scaleY, maxH));
      const dx = cx - sx;
      const dy = cy - sy;

      if (mode === "new") {
        const sw = Math.abs(cx - sx);
        const sh = cropRatio ? sw / cropRatio : Math.abs(cy - sy);
        setCropSel({ x: Math.min(sx, cx), y: Math.min(sy, cy), w: sw, h: sh });
      } else if (mode === "move" && initialSel) {
        setCropSel({
          x: Math.max(0, Math.min(initialSel.x + dx, maxW - initialSel.w)),
          y: Math.max(0, Math.min(initialSel.y + dy, maxH - initialSel.h)),
          w: initialSel.w, h: initialSel.h,
        });
      } else if (mode === "resize-br" && initialSel) {
        const nw = Math.max(10, Math.min(initialSel.w + dx, maxW - initialSel.x));
        const nh = cropRatio ? nw / cropRatio : Math.max(10, Math.min(initialSel.h + dy, maxH - initialSel.y));
        setCropSel({ ...initialSel, w: nw, h: nh });
      } else if (mode === "resize-tl" && initialSel) {
        const nw = Math.max(10, initialSel.w - dx);
        const nh = cropRatio ? nw / cropRatio : Math.max(10, initialSel.h - dy);
        setCropSel({ x: Math.max(0, initialSel.x + initialSel.w - nw), y: Math.max(0, initialSel.y + initialSel.h - nh), w: nw, h: nh });
      } else if (mode === "resize-tr" && initialSel) {
        const nw = Math.max(10, Math.min(initialSel.w + dx, maxW - initialSel.x));
        const nh = cropRatio ? nw / cropRatio : Math.max(10, initialSel.h - dy);
        setCropSel({ ...initialSel, y: Math.max(0, initialSel.y + initialSel.h - nh), w: nw, h: nh });
      } else if (mode === "resize-bl" && initialSel) {
        const nw = Math.max(10, initialSel.w - dx);
        const nh = cropRatio ? nw / cropRatio : Math.max(10, Math.min(initialSel.h + dy, maxH - initialSel.y));
        setCropSel({ ...initialSel, x: Math.max(0, initialSel.x + initialSel.w - nw), w: nw, h: nh });
      }
    };
    const onUp = () => {
      cropDragRef.current = null;
      setCropSel((s) => (s && s.w > 4 && s.h > 4 ? s : null));
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [cropMode, cropRatio]);

  const startCropDrag = useCallback((e: React.MouseEvent, mode: CropDragMode) => {
    if (!previewRef.current || !orig) return;
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = previewRef.current.width  / rect.width;
    const scaleY = previewRef.current.height / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top)  * scaleY;
    cropDragRef.current = {
      sx, sy, mode,
      initialSel: cropSel ? { ...cropSel } : null,
      origCrop: cropRgn ?? { x: 0, y: 0, w: orig.naturalWidth, h: orig.naturalHeight },
      editsW: edits.width, editsH: edits.height,
    };
    if (mode === "new") setCropSel({ x: sx, y: sy, w: 0, h: 0 });
    e.preventDefault();
  }, [orig, cropRgn, cropSel, edits.width, edits.height]);

  const onCropMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !previewRef.current || !orig) return;
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = previewRef.current.width  / rect.width;
    const scaleY = previewRef.current.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;
    // If there's an existing selection and click is inside it, ignore (overlay handles it)
    if (cropSel && cropSel.w > 4 && cx >= cropSel.x && cx <= cropSel.x + cropSel.w && cy >= cropSel.y && cy <= cropSel.y + cropSel.h) return;
    startCropDrag(e, "new");
  }, [cropMode, orig, cropSel, startCropDrag]);

  const applyCrop = useCallback(() => {
    if (!cropSel || !orig || cropSel.w < 5 || cropSel.h < 5) return;
    pushSnap();

    // Convert canvas-pixel selection → original-image coords
    const prevCrop = cropRgn ?? { x: 0, y: 0, w: orig.naturalWidth, h: orig.naturalHeight };
    const ox = prevCrop.x + (cropSel.x / edits.width)  * prevCrop.w;
    const oy = prevCrop.y + (cropSel.y / edits.height) * prevCrop.h;
    const ow = (cropSel.w / edits.width)  * prevCrop.w;
    const oh = (cropSel.h / edits.height) * prevCrop.h;

    setCropRgn({ x: Math.round(ox), y: Math.round(oy), w: Math.round(ow), h: Math.round(oh) });
    setEditsRaw((ed) => ({ ...ed, width: Math.round(cropSel.w), height: Math.round(cropSel.h) }));
    setCropSel(null);
    setCropMode(false);
  }, [cropSel, orig, cropRgn, edits.width, edits.height, pushSnap]);

  const clearCrop = useCallback(() => {
    pushSnap();
    setCropRgn(null);
    if (orig) setEditsRaw((e) => ({ ...e, width: orig.naturalWidth, height: orig.naturalHeight }));
  }, [orig, pushSnap]);

  /* ── Markup mouse handlers ──────────────────────────────────────── */
  const markupDragRef = useRef(false);

  const getMarkupPos = (e: React.MouseEvent) => {
    const pc = previewRef.current;
    if (!pc) return null;
    const rect = pc.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (pc.width  / rect.width),
      y: (e.clientY - rect.top)  * (pc.height / rect.height),
    };
  };

  const onMarkupDown = (e: React.MouseEvent) => {
    if (activeTab !== "markup") return;
    const pos = getMarkupPos(e);
    if (!pos) return;

    if (markupTool === "text") {
      setPendingText(pos);
      setTextInput("");
      return;
    }
    if (markupTool === "eraser") return;

    markupDragRef.current = true;
    const stroke: Stroke = {
      id: crypto.randomUUID(), tool: markupTool,
      color: markupColor, lineWidth: markupSize,
      pts: [[pos.x, pos.y]], fontSize: markupFontSize,
    };
    setCurStroke(stroke);
    e.preventDefault();
  };

  const onMarkupMove = (e: React.MouseEvent) => {
    if (activeTab !== "markup" || !markupDragRef.current || !curStrokeRef.current) return;
    const pos = getMarkupPos(e);
    if (!pos) return;
    const updated = { ...curStrokeRef.current, pts: [...curStrokeRef.current.pts, [pos.x, pos.y] as [number, number]] };
    curStrokeRef.current = updated;
    setCurStrokeState(updated);
  };

  const onMarkupUp = () => {
    if (!markupDragRef.current || !curStrokeRef.current) return;
    markupDragRef.current = false;
    const committed = curStrokeRef.current;
    curStrokeRef.current = null;
    setCurStrokeState(null);
    pushSnap();
    setStrokes((ss) => [...ss, committed]);
  };

  const onMarkupClickEraser = (e: React.MouseEvent) => {
    if (markupTool !== "eraser") return;
    const pos = getMarkupPos(e);
    if (!pos) return;
    const r = markupSize * 10;
    pushSnap();
    setStrokes((ss) => ss.filter((s) => !s.pts.some(([px, py]) => (px-pos.x)**2 + (py-pos.y)**2 < r*r)));
  };

  const commitText = () => {
    if (!pendingText || !textInput.trim()) { setPendingText(null); return; }
    pushSnap();
    setStrokes((ss) => [...ss, {
      id: crypto.randomUUID(), tool: "text", color: markupColor,
      lineWidth: 1, pts: [[pendingText.x, pendingText.y]],
      text: textInput, fontSize: markupFontSize,
    }]);
    setPendingText(null);
    setTextInput("");
  };

  /* ── Resize helpers ────────────────────────────────────────────── */
  const setWidth = (w: number) => {
    if (!orig) return;
    const aspect = (cropRgn?.w ?? orig.naturalWidth) / (cropRgn?.h ?? orig.naturalHeight);
    setEdits((e) => ({ ...e, width: w, height: lockAR ? Math.round(w / aspect) : e.height }));
  };
  const setHeight = (h: number) => {
    if (!orig) return;
    const aspect = (cropRgn?.w ?? orig.naturalWidth) / (cropRgn?.h ?? orig.naturalHeight);
    setEdits((e) => ({ ...e, height: h, width: lockAR ? Math.round(h * aspect) : e.width }));
  };
  const rotate90 = (d: 1 | -1) => setEdits((e) => ({ ...e, rotation: ((e.rotation + d * 90) + 360) % 360 }));

  /* ── Tab resets ─────────────────────────────────────────────────── */
  const resetTab = () => {
    pushSnap();
    if (activeTab === "transform") {
      if (orig) setEditsRaw((e) => ({ ...e, width: orig.naturalWidth, height: orig.naturalHeight, rotation: 0, flipH: false, flipV: false }));
      setCropRgn(null);
    } else if (activeTab === "adjust") {
      setEditsRaw((e) => ({ ...e, ...DEFAULT_ADJ }));
    } else if (activeTab === "filters") {
      setEditsRaw((e) => ({ ...e, ...DEFAULT_ADJ }));
    } else if (activeTab === "markup") {
      setStrokes([]);
    } else if (activeTab === "output") {
      setFmt("jpeg");
      setEditsRaw((e) => ({ ...e, quality: 92 }));
    }
  };

  /* ── Download ───────────────────────────────────────────────────── */
  const download = () => {
    if (!previewRef.current || !file) return;
    const final = document.createElement("canvas");
    const pc = previewRef.current;
    final.width = pc.width; final.height = pc.height;
    const ctx = final.getContext("2d")!;
    ctx.drawImage(pc, 0, 0);
    for (const s of strokes) drawStroke(ctx, s);
    const mime = outputFmt === "png" ? "image/png" : outputFmt === "webp" ? "image/webp" : "image/jpeg";
    final.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_edited.${outputFmt}`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, mime, outputFmt === "png" ? undefined : edits.quality / 100);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrop(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) setFile(f);
  };

  /* ── Subcomponents ──────────────────────────────────────────────── */
  const Slider = ({ label, value, min, max, step = 1, unit = "", onChange, onSnap }: {
    label: string; value: number; min: number; max: number;
    step?: number; unit?: string; onChange: (v: number) => void; onSnap?: () => void;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs text-slate-500">{label}</label>
        <span className="text-xs text-slate-400 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onPointerDown={onSnap}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500" />
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "transform", label: "Transform" },
    { id: "adjust",    label: "Adjust" },
    { id: "filters",   label: "Filters" },
    { id: "markup",    label: "Markup" },
    { id: "output",    label: "Output" },
  ];

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tools
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Image Editor</h1>
          <p className="text-slate-500 text-sm">Resize, crop, rotate, adjust, add markup — all in your browser.</p>
        </div>

        {!file ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDrop(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDrop(false); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 py-24 rounded-2xl border border-dashed cursor-pointer transition-all ${
              isDrop ? "border-blue-500/70 bg-blue-500/8 text-blue-400" : "border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <div className="text-center">
              <p className="font-semibold text-base">Drop an image here</p>
              <p className="text-xs opacity-60 mt-1">or click to browse · JPG, PNG, WEBP, GIF, BMP…</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              onClick={(e) => e.stopPropagation()} />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">

            {/* ── Left panel ── */}
            <div className="flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-900/60 border border-slate-800/60 p-1 gap-1">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === t.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Transform */}
              {activeTab === "transform" && (
                <div className="space-y-4">
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white text-sm font-semibold">Resize</h3>
                      <button onClick={() => setLockAR((l) => !l)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors ${lockAR ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                        {lockAR ? "🔒 Locked" : "🔓 Free"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Width (px)</label>
                        <input type="number" value={edits.width}
                          onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/60" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Height (px)</label>
                        <input type="number" value={edits.height}
                          onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/60" />
                      </div>
                    </div>
                    {orig && (
                      <div className="flex flex-wrap gap-1.5">
                        {[25, 50, 75, 100, 150, 200].map((pct) => (
                          <button key={pct} onClick={() => {
                            const srcW = cropRgn?.w ?? orig.naturalWidth;
                            const srcH = cropRgn?.h ?? orig.naturalHeight;
                            setEdits((e) => ({ ...e, width: Math.round(srcW * pct / 100), height: Math.round(srcH * pct / 100) }));
                          }} className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-md transition-colors">
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}
                    {orig && <p className="text-slate-600 text-xs">Original: {orig.naturalWidth}×{orig.naturalHeight}px</p>}
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                    <h3 className="text-white text-sm font-semibold">Rotate &amp; Flip</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => rotate90(-1)} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">↺ 90° CCW</button>
                      <button onClick={() => rotate90(1)}  className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">↻ 90° CW</button>
                      <button onClick={() => setEdits((e) => ({ ...e, flipH: !e.flipH }))}
                        className={`py-2 border text-xs rounded-lg transition-colors ${edits.flipH ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}>
                        Flip H
                      </button>
                      <button onClick={() => setEdits((e) => ({ ...e, flipV: !e.flipV }))}
                        className={`py-2 border text-xs rounded-lg transition-colors ${edits.flipV ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}>
                        Flip V
                      </button>
                    </div>
                    <Slider label="Custom angle" value={edits.rotation} min={0} max={359} unit="°" onChange={(v) => set("rotation", v)} />
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white text-sm font-semibold">Crop</h3>
                      {cropRgn && !cropMode && (
                        <button onClick={clearCrop} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear</button>
                      )}
                    </div>
                    {/* Aspect ratio presets */}
                    <div className="flex flex-wrap gap-1">
                      {CROP_RATIOS.map((r) => (
                        <button key={r.label} onClick={() => setCropRatio(r.ratio)}
                          className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
                            cropRatio === r.ratio ? "bg-blue-500/15 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {cropMode ? (
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs">Drag on the image to draw the crop box.</p>
                        {cropSel && cropSel.w > 4 && (
                          <p className="text-slate-400 text-xs font-mono">{Math.round(cropSel.w)} × {Math.round(cropSel.h)} px</p>
                        )}
                        {/* Numeric crop inputs */}
                        {cropSel && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {(["x","y","w","h"] as const).map((k) => (
                              <div key={k}>
                                <label className="text-[10px] text-slate-600 block mb-0.5 uppercase">{k}</label>
                                <input type="number" value={Math.round(cropSel[k])}
                                  onChange={(ev) => {
                                    const v = parseInt(ev.target.value) || 0;
                                    setCropSel((s) => s ? { ...s, [k]: v } : s);
                                  }}
                                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none focus:border-blue-500/60" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={applyCrop} disabled={!cropSel || cropSel.w < 5}
                            className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors">
                            Apply
                          </button>
                          <button onClick={() => { setCropMode(false); setCropSel(null); }}
                            className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setCropMode(true); setCropSel(null); setTab("transform"); }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                        {cropRgn ? "Re-crop" : "Start cropping"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Adjust */}
              {activeTab === "adjust" && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
                  <h3 className="text-white text-sm font-semibold">Adjustments</h3>
                  <Slider label="Brightness" value={edits.brightness} min={0} max={200} unit="%" onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, brightness: v }))} />
                  <Slider label="Contrast"   value={edits.contrast}   min={0} max={200} unit="%" onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, contrast:   v }))} />
                  <Slider label="Saturation" value={edits.saturation} min={0} max={200} unit="%" onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, saturation: v }))} />
                  <Slider label="Hue rotate" value={edits.hue} min={-180} max={180} unit="°"    onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, hue:        v }))} />
                  <Slider label="Blur"  value={edits.blur} min={0} max={20} step={0.5} unit="px" onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, blur:      v }))} />
                  <Slider label="Opacity"    value={edits.opacity}    min={0} max={100} unit="%" onSnap={pushSnap} onChange={(v) => setEditsRaw((e) => ({ ...e, opacity:   v }))} />
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Background fill</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={edits.bgColor} onChange={(e) => set("bgColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer" />
                      <span className="text-xs text-slate-400 font-mono">{edits.bgColor}</span>
                      <span className="text-xs text-slate-600 ml-auto">JPEG &amp; rotation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              {activeTab === "filters" && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <h3 className="text-white text-sm font-semibold">Filter Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FILTER_PRESETS.map((p) => (
                      <button key={p.id} onClick={() => {
                        pushSnap();
                        setEditsRaw((e) => ({ ...e, ...DEFAULT_ADJ, filterPreset: p.id, ...p.v, width: e.width, height: e.height, rotation: e.rotation, flipH: e.flipH, flipV: e.flipV, quality: e.quality }));
                      }}
                        className={`py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                          edits.filterPreset === p.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs">Fine-tune in the Adjust tab.</p>
                </div>
              )}

              {/* Markup */}
              {activeTab === "markup" && (
                <div className="space-y-3">
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                    <h3 className="text-white text-sm font-semibold">Tools</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      {MARKUP_TOOLS.map((t) => (
                        <button key={t.id} onClick={() => setMarkupTool(t.id as Stroke["tool"])}
                          className={`py-2 text-xs rounded-lg border transition-colors flex flex-col items-center gap-0.5 ${
                            markupTool === t.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          }`}>
                          <span className="text-base leading-none">{t.icon}</span>
                          <span className="text-[10px]">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                    <h3 className="text-white text-sm font-semibold">Style</h3>
                    <div className="flex items-center gap-3">
                      <input type="color" value={markupColor} onChange={(e) => setMarkupColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer flex-shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ffffff","#000000"].map((c) => (
                          <button key={c} onClick={() => setMarkupColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${markupColor === c ? "border-white scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <Slider label="Stroke size" value={markupSize} min={1} max={30} unit="px" onChange={setMarkupSize} />
                    {markupTool === "text" && (
                      <Slider label="Font size" value={markupFontSize} min={8} max={96} unit="px" onChange={setMarkupFontSize} />
                    )}
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white text-sm font-semibold">Strokes ({strokes.length})</h3>
                      {strokes.length > 0 && (
                        <button onClick={() => { pushSnap(); setStrokes([]); }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear all</button>
                      )}
                    </div>
                    {strokes.length === 0 && <p className="text-slate-600 text-xs">Draw on the image to add markup.</p>}
                  </div>
                  <p className="text-slate-600 text-xs text-center">Markup is included when you download.</p>
                </div>
              )}

              {/* Output */}
              {activeTab === "output" && (
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
                  <h3 className="text-white text-sm font-semibold">Output</h3>
                  <div>
                    <label className="text-xs text-slate-500 block mb-2">Format</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["jpeg","png","webp"] as const).map((f) => (
                        <button key={f} onClick={() => setFmt(f)}
                          className={`py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
                            outputFmt === f ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}>
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {outputFmt !== "png" && (
                    <Slider label="Quality" value={edits.quality} min={1} max={100} unit="%" onChange={(v) => set("quality", v)} />
                  )}
                  <div>
                    <label className="text-xs text-slate-500 block mb-2">Preview zoom</label>
                    <div className="flex gap-1.5">
                      {[0.25, 0.5, 1, 2].map((z) => (
                        <button key={z} onClick={() => setZoom(z)}
                          className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${
                            zoom === z ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}>
                          {z === 0.25 ? "¼×" : z === 0.5 ? "½×" : z === 1 ? "1×" : "2×"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="flex gap-2">
                <button onClick={undo} disabled={!canUndo}
                  title="Undo"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Undo
                </button>
                <button onClick={resetTab} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors">
                  Reset tab
                </button>
                <button onClick={() => { setFile(null); setOrig(null); setCropRgn(null); setStrokes([]); setCropMode(false); setCropSel(null); historyRef.current = []; setCanUndo(false); }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors">
                  New
                </button>
              </div>
              <button onClick={download}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {outputFmt.toUpperCase()}
              </button>
            </div>

            {/* ── Canvas area ── */}
            <div className="flex flex-col gap-2">
              <div
                className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-start justify-center min-h-[400px] overflow-auto"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%231e293b'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%231e293b'/%3E%3C/svg%3E\")" }}
              >
                <div className="inline-block relative select-none"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>

                  {/* Image canvas */}
                  <canvas ref={previewRef}
                    onMouseDown={cropMode ? onCropMouseDown : undefined}
                    className={`block max-w-full rounded-lg shadow-xl ${cropMode ? "cursor-crosshair" : ""}`}
                  />

                  {/* Markup canvas (transparent overlay) */}
                  <canvas ref={markupRef}
                    className={`absolute inset-0 rounded-lg ${activeTab === "markup" && markupTool !== "eraser" ? "cursor-crosshair" : activeTab === "markup" && markupTool === "eraser" ? "cursor-cell" : "pointer-events-none"}`}
                    onMouseDown={activeTab === "markup" ? (markupTool === "eraser" ? onMarkupClickEraser : onMarkupDown) : undefined}
                    onMouseMove={activeTab === "markup" && markupTool !== "eraser" ? onMarkupMove : undefined}
                    onMouseUp={activeTab === "markup" && markupTool !== "eraser" ? onMarkupUp : undefined}
                  />

                  {/* Crop selection overlay */}
                  {cropMode && cropSel && cropSel.w > 4 && cropSel.h > 4 && previewRef.current && (
                    <>
                      {/* Dark mask outside crop */}
                      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="absolute bg-transparent"
                          style={{
                            left:   `${(cropSel.x / previewRef.current.width)  * 100}%`,
                            top:    `${(cropSel.y / previewRef.current.height) * 100}%`,
                            width:  `${(cropSel.w / previewRef.current.width)  * 100}%`,
                            height: `${(cropSel.h / previewRef.current.height) * 100}%`,
                            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                          }}
                        />
                      </div>
                      {/* Draggable crop box */}
                      <div className="absolute border-2 border-white/80 cursor-move"
                        style={{
                          left:   `${(cropSel.x / previewRef.current.width)  * 100}%`,
                          top:    `${(cropSel.y / previewRef.current.height) * 100}%`,
                          width:  `${(cropSel.w / previewRef.current.width)  * 100}%`,
                          height: `${(cropSel.h / previewRef.current.height) * 100}%`,
                        }}
                        onMouseDown={(e) => { e.stopPropagation(); startCropDrag(e, "move"); }}>
                        {/* Corner resize handles */}
                        {([
                          { cls: "top-0 left-0 -translate-x-1 -translate-y-1 cursor-nwse-resize", mode: "resize-tl" as CropDragMode },
                          { cls: "top-0 right-0 translate-x-1 -translate-y-1 cursor-nesw-resize", mode: "resize-tr" as CropDragMode },
                          { cls: "bottom-0 left-0 -translate-x-1 translate-y-1 cursor-nesw-resize", mode: "resize-bl" as CropDragMode },
                          { cls: "bottom-0 right-0 translate-x-1 translate-y-1 cursor-nwse-resize", mode: "resize-br" as CropDragMode },
                        ]).map(({ cls, mode }) => (
                          <div key={mode} className={`absolute w-3 h-3 bg-white rounded-sm ${cls}`}
                            onMouseDown={(e) => { e.stopPropagation(); startCropDrag(e, mode); }} />
                        ))}
                        {/* Rule-of-thirds grid */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                          <div className="absolute left-1/3 top-0 bottom-0 border-l border-white" />
                          <div className="absolute left-2/3 top-0 bottom-0 border-l border-white" />
                          <div className="absolute top-1/3 left-0 right-0 border-t border-white" />
                          <div className="absolute top-2/3 left-0 right-0 border-t border-white" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Text input overlay */}
                  {pendingText && previewRef.current && (
                    <div className="absolute" style={{
                      left: `${(pendingText.x / previewRef.current.width)  * 100}%`,
                      top:  `${(pendingText.y / previewRef.current.height) * 100}%`,
                    }}>
                      <input
                        autoFocus
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") { setPendingText(null); } }}
                        onBlur={commitText}
                        placeholder="Type text…"
                        className="bg-black/60 text-white border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none min-w-24"
                        style={{ fontSize: markupFontSize / zoom, color: markupColor }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                {orig && <span>{orig.naturalWidth}×{orig.naturalHeight}px original</span>}
                {previewRef.current && <span>→ {previewRef.current.width}×{previewRef.current.height}px output</span>}
                {cropMode && <span className="text-blue-400 ml-auto">Crop mode — drag to select</span>}
                {activeTab === "markup" && <span className="text-violet-400 ml-auto">Drawing: {markupTool}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
