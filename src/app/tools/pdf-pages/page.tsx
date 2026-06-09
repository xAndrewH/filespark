"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnail: string | null;
  deleted: boolean;
}

function SortablePage({ item, onToggleDelete }: { item: PageItem; onToggleDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: item.deleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border overflow-hidden transition-all ${
        item.deleted
          ? "border-red-500/40 opacity-40"
          : "border-slate-700/60 hover:border-slate-600"
      }`}
    >
      {/* Drag handle + thumbnail */}
      <div
        {...attributes}
        {...listeners}
        className={`bg-slate-800/60 cursor-grab active:cursor-grabbing ${item.deleted ? "pointer-events-none" : ""}`}
      >
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={`Page ${item.originalIndex + 1}`} className="w-full" />
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center bg-slate-800">
            <span className="text-slate-600 text-xs">Page {item.originalIndex + 1}</span>
          </div>
        )}
      </div>

      {/* Page number */}
      <div className="py-1.5 text-center text-xs text-slate-500 bg-slate-900/80">
        {item.deleted ? (
          <span className="text-red-400">Deleted</span>
        ) : (
          `Page ${item.originalIndex + 1}`
        )}
      </div>

      {/* Delete toggle */}
      <button
        onClick={() => onToggleDelete(item.id)}
        className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
          item.deleted
            ? "bg-green-500/80 text-white opacity-100"
            : "bg-red-500/80 text-white opacity-0 group-hover:opacity-100"
        }`}
        title={item.deleted ? "Restore page" : "Remove page"}
      >
        {item.deleted ? "↩" : "×"}
      </button>
    </div>
  );
}

export default function PdfPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalPdf, setOriginalPdf] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("document.pdf");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadPdf = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setPages([]);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      setOriginalPdf(buffer);

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      const count = pdf.numPages;
      const items: PageItem[] = [];

      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, canvas, viewport }).promise;
        items.push({
          id: `page-${i}`,
          originalIndex: i - 1,
          thumbnail: canvas.toDataURL("image/jpeg", 0.6),
          deleted: false,
        });
      }

      setPages(items);
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") loadPdf(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadPdf(file);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages(prev => {
        const oldIdx = prev.findIndex(p => p.id === active.id);
        const newIdx = prev.findIndex(p => p.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const toggleDelete = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, deleted: !p.deleted } : p));
  };

  const save = async () => {
    if (!originalPdf) return;
    setSaving(true);
    try {
      const srcDoc = await PDFDocument.load(originalPdf);
      const outDoc = await PDFDocument.create();
      const activePages = pages.filter(p => !p.deleted);
      const indices = activePages.map(p => p.originalIndex);
      const copied = await outDoc.copyPages(srcDoc, indices);
      copied.forEach(p => outDoc.addPage(p));
      const bytes = await outDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName.replace(/\.pdf$/i, "") + "-edited.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setError(`Failed to save PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = pages.filter(p => !p.deleted).length;
  const deletedCount = pages.filter(p => p.deleted).length;

  const ids = pages.map(p => p.id);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Reorder / Delete PDF Pages</h1>
        <p className="text-slate-500 text-sm mb-8">Drag to reorder pages or remove unwanted ones, then download the edited PDF.</p>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {pages.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-16 text-center cursor-pointer transition-colors"
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
            {loading ? (
              <div className="space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Loading PDF pages…</p>
              </div>
            ) : (
              <div className="space-y-3">
                <svg className="w-12 h-12 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-300 text-sm font-medium">Drop a PDF here</p>
                <p className="text-slate-600 text-xs">or click to browse</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">
                  <span className="text-white font-medium">{fileName}</span> | {activeCount} page{activeCount !== 1 ? "s" : ""}
                  {deletedCount > 0 && <span className="text-red-400 ml-1">({deletedCount} removed)</span>}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPages([]); setOriginalPdf(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-400 transition-colors"
                >
                  Load Different PDF
                </button>
                <button
                  onClick={save}
                  disabled={saving || activeCount === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
                >
                  {saving ? "Saving…" : `Save PDF (${activeCount} pages)`}
                </button>
              </div>
            </div>

            <p className="text-slate-600 text-xs mb-4">Drag pages to reorder · hover a page to remove it · click × again to restore</p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {pages.map(p => (
                    <SortablePage key={p.id} item={p} onToggleDelete={toggleDelete} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
}
