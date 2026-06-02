import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join, basename } from "path";
import { writeFile, readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

const SOFFICE =
  process.env.SOFFICE_PATH ??
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

const MIME_MAP: Record<string, string> = {
  pdf:  "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc:  "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  epub: "application/epub+zip",
  txt:  "text/plain",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
};

export async function POST(request: NextRequest) {
  let inputPath = "";
  let outputPath = "";

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string | null)?.toLowerCase() ?? "pdf";
    const mode = (formData.get("mode") as string | null) ?? "convert";

    if (!file) return new NextResponse("Missing file", { status: 400 });

    const inputExt = file.name.split(".").pop()?.toLowerCase() ?? "docx";
    const uid = randomUUID();
    const baseName = `filespark_${uid}`;
    inputPath = join(tmpdir(), `${baseName}.${inputExt}`);

    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // LibreOffice convert-to target format
    // For multi-page PDF→JPG, LibreOffice produces <name>0.jpg, <name>1.jpg, etc.
    // We only return the first page when converting PDF→image.
    await execFileAsync(
      SOFFICE,
      ["--headless", "--convert-to", format, "--outdir", tmpdir(), inputPath],
      { timeout: 120_000 }
    );

    // Locate the output file — LibreOffice uses the input basename
    outputPath = join(tmpdir(), `${baseName}.${format}`);

    // For PDF → JPG, LibreOffice may add a page number suffix (e.g., filespark_xxx0.jpg)
    let finalOutputPath = outputPath;
    if (!await fileExists(outputPath) && ["jpg", "jpeg", "png"].includes(format)) {
      finalOutputPath = join(tmpdir(), `${baseName}0.${format}`);
    }

    const result = await readFile(finalOutputPath);
    const mime = MIME_MAP[format] ?? "application/octet-stream";
    const downloadName = `${file.name.replace(/\.[^.]+$/, "")}.${format}`;

    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/document]", err);
    const msg = err instanceof Error ? err.message : "Conversion failed";
    const hint = msg.includes("ENOENT")
      ? "LibreOffice not found. Ensure it is installed or set SOFFICE_PATH env var."
      : msg;
    return new NextResponse(hint, { status: 500 });
  } finally {
    await Promise.allSettled([
      inputPath  ? unlink(inputPath).catch(() => {}) : Promise.resolve(),
      outputPath ? unlink(outputPath).catch(() => {}) : Promise.resolve(),
    ]);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try { await readFile(path); return true; }
  catch { return false; }
}
