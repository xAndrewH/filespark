"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";

type Language = "javascript" | "typescript" | "python" | "html" | "css" | "json" | "bash" | "other";
type Theme = "dark" | "light" | "dracula" | "solarized";
type BgType = string;

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "bash", label: "Bash" },
  { id: "other", label: "Other" },
];

const THEMES: { id: Theme; label: string; bg: string; fg: string }[] = [
  { id: "dark",      label: "Dark",      bg: "#1e1e1e", fg: "#d4d4d4" },
  { id: "light",     label: "Light",     bg: "#ffffff", fg: "#333333" },
  { id: "dracula",   label: "Dracula",   bg: "#282a36", fg: "#f8f8f2" },
  { id: "solarized", label: "Solarized", bg: "#002b36", fg: "#839496" },
];

const BG_PRESET_IDS = ["transparent", "black", "gradient-purple", "gradient-blue"] as const;

const BG_PRESETS: { id: string; label: string }[] = [
  { id: "transparent",     label: "None" },
  { id: "black",           label: "Black" },
  { id: "gradient-purple", label: "Purple" },
  { id: "gradient-blue",   label: "Blue" },
];

interface TokenSpan {
  text: string;
  color: string;
}

function tokenize(code: string, lang: Language, fgColor: string, themeId: Theme): TokenSpan[][] {
  const lines = code.split("\n");

  const keywordsByLang: Record<Language, string[]> = {
    javascript: ["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","class","new","import","export","default","from","typeof","instanceof","async","await","try","catch","finally","throw","void","delete","in","of","this","super","extends","static","yield","null","undefined","true","false"],
    typescript: ["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","class","new","import","export","default","from","typeof","instanceof","async","await","try","catch","finally","throw","void","delete","in","of","this","super","extends","static","yield","null","undefined","true","false","interface","type","enum","implements","declare","namespace","abstract","readonly","public","private","protected","as","keyof","infer","never","any","unknown","string","number","boolean"],
    python: ["def","class","return","if","elif","else","for","while","break","continue","import","from","as","try","except","finally","raise","with","pass","lambda","yield","async","await","and","or","not","in","is","None","True","False","global","nonlocal","del","assert","print"],
    html: ["html","head","body","div","span","p","a","img","ul","ol","li","table","tr","td","th","form","input","button","select","option","script","style","link","meta","title","h1","h2","h3","h4","h5","h6","header","footer","main","nav","section","article","aside"],
    css: ["background","color","font","margin","padding","border","width","height","display","position","flex","grid","overflow","opacity","transform","transition","animation","box-shadow","text-align","font-size","font-weight","line-height"],
    json: [],
    bash: ["echo","export","if","then","else","fi","for","do","done","while","until","case","esac","function","return","exit","cd","ls","mkdir","rm","cp","mv","cat","grep","sed","awk","curl","wget","source","alias","unset","read","local","shift","set","trap"],
    other: [],
  };

  const keywords = new Set(keywordsByLang[lang] ?? []);

  const themeColors: Record<Theme, { keyword: string; string: string; comment: string; number: string }> = {
    dark:      { keyword: "#569cd6", string: "#ce9178", comment: "#6a9955", number: "#b5cea8" },
    light:     { keyword: "#0000ff", string: "#a31515", comment: "#008000", number: "#098658" },
    dracula:   { keyword: "#ff79c6", string: "#f1fa8c", comment: "#6272a4", number: "#bd93f9" },
    solarized: { keyword: "#268bd2", string: "#2aa198", comment: "#586e75", number: "#d33682" },
  };

  const colors = themeColors[themeId];

  return lines.map((line) => {
    const spans: TokenSpan[] = [];
    let i = 0;

    while (i < line.length) {
      if (line.startsWith("//", i) || (lang === "python" && line[i] === "#") || (lang === "bash" && line[i] === "#")) {
        spans.push({ text: line.slice(i), color: colors.comment });
        break;
      }

      if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
        const quote = line[i];
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === "\\" && j + 1 < line.length) j++;
          j++;
        }
        j++;
        spans.push({ text: line.slice(i, j), color: colors.string });
        i = j;
        continue;
      }

      if (/\d/.test(line[i]) && (i === 0 || /\W/.test(line[i - 1]))) {
        let j = i;
        while (j < line.length && /[\d.]/.test(line[j])) j++;
        spans.push({ text: line.slice(i, j), color: colors.number });
        i = j;
        continue;
      }

      if (/[a-zA-Z_$]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        spans.push({ text: word, color: keywords.has(word) ? colors.keyword : fgColor });
        i = j;
        continue;
      }

      spans.push({ text: line[i], color: fgColor });
      i++;
    }

    return spans;
  });
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderCodeCanvas(
  canvas: HTMLCanvasElement,
  params: {
    code: string;
    language: Language;
    theme: Theme;
    fontSize: number;
    padding: number;
    bgType: BgType;
    windowControls: boolean;
    lineNumbers: boolean;
    preview: boolean;
  }
) {
  const { code, language, theme, fontSize, padding, bgType, windowControls, lineNumbers, preview } = params;
  const themeConf = THEMES.find((t) => t.id === theme)!;
  const ctx = canvas.getContext("2d")!;

  const fontFamily = "monospace";
  const lineHeight = fontSize * 1.6;
  const displayCode = code || "// paste your code here";
  const lines = displayCode.split("\n");
  const tokenLines = tokenize(displayCode, language, themeConf.fg, theme);

  ctx.font = `${fontSize}px ${fontFamily}`;
  const charWidth = ctx.measureText("M").width;
  const maxLineLen = Math.max(...lines.map((l) => l.length), 20);
  const lineNumWidth = lineNumbers ? charWidth * (String(lines.length).length + 1.5) : 0;

  const winW = Math.max(lineNumWidth + maxLineLen * charWidth + padding * 2, 300);
  const headerH = windowControls ? 40 : 0;
  const winH = lines.length * lineHeight + padding * 2 + headerH;

  const canvasW = winW + padding * 2;
  const canvasH = winH + padding * 2;

  const scale = preview ? Math.min(1, 560 / canvasW) : 1;
  canvas.width = Math.round(canvasW * scale);
  canvas.height = Math.round(canvasH * scale);
  ctx.scale(scale, scale);

  if (bgType === "transparent") {
    ctx.clearRect(0, 0, canvasW, canvasH);
  } else if (bgType === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else if (bgType === "gradient-purple") {
    const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    grad.addColorStop(0, "#7c3aed");
    grad.addColorStop(1, "#db2777");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else if (bgType === "gradient-blue") {
    const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    grad.addColorStop(0, "#1d4ed8");
    grad.addColorStop(1, "#0891b2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    ctx.fillStyle = bgType;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  const winX = padding;
  const winY = padding;

  drawRoundRect(ctx, winX, winY, winW, winH, 12);
  ctx.fillStyle = themeConf.bg;
  ctx.fill();

  if (windowControls) {
    const dotY = winY + 20;
    const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
    dotColors.forEach((color, idx) => {
      ctx.beginPath();
      ctx.arc(winX + 20 + idx * 22, dotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  const codeX = winX + padding + lineNumWidth;
  const codeStartY = winY + (windowControls ? headerH : 0) + padding;

  tokenLines.forEach((spans, lineIdx) => {
    const y = codeStartY + lineIdx * lineHeight + fontSize;

    if (lineNumbers) {
      ctx.fillStyle = "#555555";
      ctx.textAlign = "right";
      ctx.fillText(String(lineIdx + 1), winX + padding + lineNumWidth - charWidth * 0.5, y);
      ctx.textAlign = "left";
    }

    let x = codeX;
    for (const span of spans) {
      ctx.fillStyle = span.color;
      ctx.fillText(span.text, x, y);
      x += ctx.measureText(span.text).width;
    }
  });
}

export default function CodeToImagePage() {
  const [code, setCode]                     = useState("");
  const [language, setLanguage]             = useState<Language>("javascript");
  const [theme, setTheme]                   = useState<Theme>("dark");
  const [fontSize, setFontSize]             = useState(14);
  const [padding, setPadding]               = useState(32);
  const [bgType, setBgType]                 = useState<BgType>("gradient-purple");
  const [customBg, setCustomBg]             = useState("#1a1a2e");
  const [windowControls, setWindowControls] = useState(true);
  const [lineNumbers, setLineNumbers]       = useState(false);
  const canvasRef                           = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCodeCanvas(canvas, { code, language, theme, fontSize, padding, bgType, windowControls, lineNumbers, preview: true });
  }, [code, language, theme, fontSize, padding, bgType, windowControls, lineNumbers]);

  useEffect(() => { draw(); }, [draw]);

  const download = () => {
    const offscreen = document.createElement("canvas");
    renderCodeCanvas(offscreen, { code, language, theme, fontSize, padding, bgType, windowControls, lineNumbers, preview: false });
    offscreen.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "code.png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  const isCustomBg = !BG_PRESET_IDS.includes(bgType as typeof BG_PRESET_IDS[number]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Code to Image</h1>
        <p className="text-slate-500 text-sm mb-8">Turn a code snippet into a beautiful shareable PNG.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${theme === t.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Font size: {fontSize}px</label>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Padding: {padding}px</label>
                <input
                  type="range"
                  min={16}
                  max={64}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs block">Background</label>
                <div className="flex flex-wrap gap-2">
                  {BG_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setBgType(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${bgType === p.id ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setBgType(customBg)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${isCustomBg ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white"}`}
                  >
                    Custom
                  </button>
                </div>
                {isCustomBg && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={bgType}
                      onChange={(e) => { setBgType(e.target.value); setCustomBg(e.target.value); }}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="text-slate-500 text-xs font-mono">{bgType}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={windowControls}
                    onChange={(e) => setWindowControls(e.target.checked)}
                    className="accent-blue-500"
                  />
                  <span className="text-slate-400 text-xs">Window controls</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineNumbers}
                    onChange={(e) => setLineNumbers(e.target.checked)}
                    className="accent-blue-500"
                  />
                  <span className="text-slate-400 text-xs">Line numbers</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <label className="text-slate-400 text-xs mb-1.5 block">Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                placeholder="Paste code here…"
                spellCheck={false}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono resize-none placeholder-slate-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <p className="text-slate-400 text-xs mb-3">Preview</p>
              <div
                className="flex items-center justify-center rounded-lg overflow-hidden min-h-[200px]"
                style={{ background: "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 0 0 / 16px 16px" }}
              >
                <canvas ref={canvasRef} className="max-w-full rounded" />
              </div>
            </div>
            <button
              onClick={download}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
