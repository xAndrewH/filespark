import { PDFDocument } from "pdf-lib";

const HEIC_EXTS = new Set(["heic", "heif", "hif"]);

function u8ToBlob(data: Uint8Array, type: string): Blob {
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  return new Blob([buf], { type });
}

async function decodeHeic(blob: Blob): Promise<Blob> {
  const mod = await import("heic2any");
  const fn = ((mod as unknown as { default: unknown }).default ?? mod) as (o: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>;
  const result = await fn({ blob, toType: "image/jpeg" });
  return Array.isArray(result) ? result[0] : result;
}

export async function convertPdfClient(files: File[], format: string, mode: string): Promise<Blob> {
  void mode;
  const firstExt = files[0].name.split(".").pop()?.toLowerCase() ?? "pdf";

  // Images → PDF
  if (firstExt !== "pdf" && format === "pdf") {
    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const src: Blob = HEIC_EXTS.has(ext) ? await decodeHeic(file) : file;
      const effectiveExt = HEIC_EXTS.has(ext) ? "jpg" : ext;
      const bytes = new Uint8Array(await src.arrayBuffer());
      const img = effectiveExt === "png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    return u8ToBlob(await pdfDoc.save(), "application/pdf");
  }

  // PDF → compress / re-save
  if (firstExt === "pdf") {
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return u8ToBlob(await pdfDoc.save({ useObjectStreams: true }), "application/pdf");
  }

  throw new Error("Unsupported PDF operation");
}
