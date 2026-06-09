import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { writeFile, readFile, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const execFileAsync = promisify(execFile);

const CALIBRE = process.env.CALIBRE_PATH ?? "C:\\Program Files\\Calibre2\\ebook-convert.exe";

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB

const SUPPORTED_INPUT  = new Set(["epub","mobi","azw","azw3","fb2","lit","lrf","pdb","htmlz","txtz","cbz","cbr","chm","djvu","prc","txt","rtf","docx","odt","pdf"]);
const SUPPORTED_OUTPUT = new Set(["epub","mobi","azw3","pdf","fb2","txt","rtf","htmlz","docx","lit"]);

const MIME_MAP: Record<string, string> = {
  epub:  "application/epub+zip",
  mobi:  "application/x-mobipocket-ebook",
  azw3:  "application/vnd.amazon.mobi8-ebook",
  pdf:   "application/pdf",
  fb2:   "application/x-fictionbook+xml",
  txt:   "text/plain",
  rtf:   "application/rtf",
  htmlz: "application/zip",
  docx:  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  lit:   "application/x-ms-reader",
};

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "convert-ebook", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  const uid = randomBytes(8).toString("hex");

  try {
    const formData = await request.formData();
    const file   = formData.get("file") as File | null;
    const format = (formData.get("format") as string | null)?.toLowerCase();

    if (!file)   return new NextResponse("Missing file", { status: 400 });
    if (file.size > MAX_UPLOAD) return new NextResponse("File too large (max 100MB)", { status: 413 });
    if (!format) return new NextResponse("Missing format", { status: 400 });

    const inputExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!SUPPORTED_INPUT.has(inputExt))  return new NextResponse(`Unsupported input: ${inputExt}`, { status: 400 });
    if (!SUPPORTED_OUTPUT.has(format))   return new NextResponse(`Unsupported output: ${format}`,  { status: 400 });

    const inputFile  = path.join(tmpdir(), `calibre_${uid}.${inputExt}`);
    const outputFile = path.join(tmpdir(), `calibre_${uid}_out.${format}`);

    await writeFile(inputFile, Buffer.from(await file.arrayBuffer()));

    await execFileAsync(
      CALIBRE,
      [inputFile, outputFile, "--output-profile", "tablet"],
      { timeout: 180_000 }
    );

    if (!existsSync(outputFile)) {
      return new NextResponse("Calibre produced no output", { status: 500 });
    }

    const result = await readFile(outputFile);

    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type":        MIME_MAP[format] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${format}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/ebook]", err);
    if (err instanceof Error && err.message.includes("ENOENT")) {
      return new NextResponse(
        "Calibre is not installed. Download it from https://calibre-ebook.com | set CALIBRE_PATH env var if installed in a custom location.",
        { status: 500 }
      );
    }
    return new NextResponse(
      err instanceof Error ? err.message : "eBook conversion failed",
      { status: 500 }
    );
  } finally {
    const files = await readdir(tmpdir()).catch(() => [] as string[]);
    await Promise.all(
      files
        .filter((f) => f.startsWith(`calibre_${uid}`))
        .map((f) => unlink(path.join(tmpdir(), f)).catch(() => {}))
    );
  }
}
