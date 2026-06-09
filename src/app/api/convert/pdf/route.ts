import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { PDFDocument } from "pdf-lib";
import { maybeDecodeHeic } from "@/lib/heic";

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "convert-pdf", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const format = (formData.get("format") as string | null) ?? "pdf";
    const mode = (formData.get("mode") as string | null) ?? "convert";

    if (files.length === 0) return new NextResponse("No files provided", { status: 400 });
    if (files.some((f) => f.size > MAX_UPLOAD)) return new NextResponse("File too large (max 100MB)", { status: 413 });

    const firstExt = files[0].name.split(".").pop()?.toLowerCase() ?? "pdf";

    // Image(s) → PDF
    if (firstExt !== "pdf" && format === "pdf") {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const imgExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

        // Decode HEIC → JPEG first (Sharp/pdf-lib can't decode HEIC on Windows)
        const raw = await maybeDecodeHeic(
          Buffer.from(await file.arrayBuffer()),
          imgExt
        );

        // After HEIC decode we always get JPEG; otherwise keep original format
        const effectiveExt = ["heic", "heif", "hif"].includes(imgExt) ? "jpg" : imgExt;

        let img;
        if (effectiveExt === "png") {
          img = await pdfDoc.embedPng(new Uint8Array(raw));
        } else {
          img = await pdfDoc.embedJpg(new Uint8Array(raw));
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const saved = await pdfDoc.save();
      return new NextResponse(Buffer.from(saved) as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="converted.pdf"',
        },
      });
    }

    // PDF → compress / re-save
    if (firstExt === "pdf") {
      const bytes = new Uint8Array(await files[0].arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const saved = await pdfDoc.save({ useObjectStreams: true });

      return new NextResponse(Buffer.from(saved) as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${mode === "compress" ? "compressed" : "converted"}.pdf"`,
        },
      });
    }

    return new NextResponse("Unsupported PDF conversion", { status: 400 });
  } catch (err) {
    console.error("[api/convert/pdf]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "PDF operation failed",
      { status: 500 }
    );
  }
}
