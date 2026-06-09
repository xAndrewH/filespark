import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { writeFile, readFile, unlink, readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const execFileAsync = promisify(execFile);

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB
const SEVENZIP = process.env.SEVENZIP_PATH ?? "C:\\Program Files\\7-Zip\\7z.exe";

const SUPPORTED_INPUT  = new Set(["zip", "tar", "gz", "bz2", "7z", "rar", "xz"]);
const SUPPORTED_OUTPUT = new Set(["zip", "tar", "gz", "7z"]);

async function extractWith7z(inputFile: string, extractDir: string): Promise<void> {
  await execFileAsync(SEVENZIP, ["e", inputFile, `-o${extractDir}`, "-y"], { timeout: 120_000 });
}

async function packWithArchiver(extractDir: string, outputPath: string, format: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output  = createWriteStream(outputPath);
    const archive = format === "zip"
      ? archiver("zip", { zlib: { level: 6 } })
      : archiver("tar", { gzip: format === "gz" });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(extractDir, false);
    archive.finalize();
  });
}

async function packWith7z(extractDir: string, outputPath: string): Promise<void> {
  await execFileAsync(SEVENZIP, ["a", outputPath, `${extractDir}\\*`, "-y"], { timeout: 120_000 });
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "convert-archive", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  const uid        = randomBytes(8).toString("hex");
  const extractDir = path.join(tmpdir(), `archive_${uid}_extracted`);
  let   outputPath = "";
  let   inputFile  = "";

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

    if (inputExt === format) return new NextResponse("Input and output format are the same", { status: 400 });

    inputFile  = path.join(tmpdir(), `archive_${uid}_in.${inputExt}`);
    const outputExt = format === "gz" ? "tar.gz" : format;
    outputPath = path.join(tmpdir(), `archive_${uid}_out.${outputExt}`);

    await writeFile(inputFile, Buffer.from(await file.arrayBuffer()));
    await mkdir(extractDir, { recursive: true });

    // Extract
    const use7zForExtract = existsSync(SEVENZIP);
    if (use7zForExtract) {
      await extractWith7z(inputFile, extractDir);
    } else if (inputExt === "zip") {
      // Pure Node.js ZIP extraction fallback
      const unzipper = await import("unzipper");
      const directory = await unzipper.Open.file(inputFile);
      await Promise.all(
        directory.files
          .filter((f) => f.type === "File")
          .map(async (f) => {
            const outPath = path.join(extractDir, path.basename(f.path));
            // Defense in depth against zip-slip: ensure the resolved path
            // stays inside the extract directory before writing.
            const safePath = path.resolve(extractDir, outPath);
            if (safePath !== extractDir && !safePath.startsWith(extractDir + path.sep)) {
              return; // skip entries that escape the extract dir
            }
            const buf = await f.buffer();
            await writeFile(safePath, buf);
          })
      );
    } else {
      return new NextResponse(
        "7-Zip is required for this format. Install it from https://7-zip.org and set SEVENZIP_PATH env if needed.",
        { status: 500 }
      );
    }

    // Repack
    if (format === "7z") {
      if (!existsSync(SEVENZIP)) {
        return new NextResponse(
          "7-Zip is required to create .7z files. Install it from https://7-zip.org",
          { status: 500 }
        );
      }
      await packWith7z(extractDir, outputPath);
    } else {
      await packWithArchiver(extractDir, outputPath, format);
    }

    if (!existsSync(outputPath)) {
      return new NextResponse("Archive creation failed | no output produced", { status: 500 });
    }

    const result = await readFile(outputPath);
    const mimeMap: Record<string, string> = {
      zip: "application/zip",
      tar: "application/x-tar",
      gz:  "application/gzip",
      "7z": "application/x-7z-compressed",
    };

    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type":        mimeMap[format] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${outputExt}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/archive]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Archive conversion failed",
      { status: 500 }
    );
  } finally {
    const files = await readdir(tmpdir()).catch(() => [] as string[]);
    await Promise.all(
      files
        .filter((f) => f.startsWith(`archive_${uid}`))
        .map((f) => unlink(path.join(tmpdir(), f)).catch(() => {}))
    );
    if (existsSync(extractDir)) {
      const { rm } = await import("fs/promises");
      await rm(extractDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
