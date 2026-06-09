import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const MAX_UPLOAD = 100 * 1024 * 1024; // 100MB

const MIME_MAP: Record<string, string> = {
  ttf:   "font/ttf",
  otf:   "font/otf",
  woff:  "font/woff",
  woff2: "font/woff2",
};

// WOFF1 magic bytes: "wOFF"
const WOFF_MAGIC  = 0x774f4646;
// WOFF2 magic bytes: "wOF2"
const WOFF2_MAGIC = 0x774f4632;

function detectFontType(buf: Buffer): "ttf" | "otf" | "woff" | "woff2" | "unknown" {
  if (buf.length < 4) return "unknown";
  const sig = buf.readUInt32BE(0);
  if (sig === WOFF_MAGIC)  return "woff";
  if (sig === WOFF2_MAGIC) return "woff2";
  // sfnt signature: 0x00010000 = TTF, "OTTO" = OTF CFF
  if (sig === 0x00010000 || sig === 0x74727565) return "ttf";
  if (sig === 0x4f54544f) return "otf";
  return "unknown";
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, "convert-font", 20, 60_000); // 20 conversions/min
  if (!rl.ok) return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const formData = await request.formData();
    const file   = formData.get("file") as File | null;
    const format = (formData.get("format") as string | null)?.toLowerCase();

    if (!file)   return new NextResponse("Missing file", { status: 400 });
    if (file.size > MAX_UPLOAD) return new NextResponse("File too large (max 100MB)", { status: 413 });
    if (!format) return new NextResponse("Missing format", { status: 400 });

    const inputBuf  = Buffer.from(await file.arrayBuffer());
    const inputType = detectFontType(inputBuf);
    let   sfntBuf: Buffer; // raw TTF/OTF sfnt bytes

    // Step 1 | normalise input to raw sfnt (TTF/OTF bytes)
    if (inputType === "woff2") {
      const { decompress } = await import("wawoff2");
      sfntBuf = Buffer.from(await decompress(new Uint8Array(inputBuf)));
    } else if (inputType === "woff") {
      sfntBuf = stripWoff1(inputBuf);
    } else {
      sfntBuf = inputBuf; // already TTF or OTF
    }

    // Step 2 | encode to target format
    let result: Buffer;
    if (format === "woff2") {
      const { compress } = await import("wawoff2");
      result = Buffer.from(await compress(new Uint8Array(sfntBuf)));
    } else if (format === "woff") {
      const ttf2woff = (await import("ttf2woff")).default;
      result = Buffer.from(ttf2woff(new Uint8Array(sfntBuf)));
    } else {
      // ttf or otf | pass through sfnt bytes as-is
      result = sfntBuf;
    }

    const ext = format;
    return new NextResponse(result as unknown as BodyInit, {
      headers: {
        "Content-Type":        MIME_MAP[ext] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${ext}"`,
      },
    });
  } catch (err) {
    console.error("[api/convert/font]", err);
    return new NextResponse(
      err instanceof Error ? err.message : "Font conversion failed",
      { status: 500 }
    );
  }
}

/**
 * Strip the WOFF1 container and return the raw sfnt (TTF/OTF) bytes.
 * WOFF spec: https://www.w3.org/TR/WOFF/
 */
function stripWoff1(woff: Buffer): Buffer {
  const numTables = woff.readUInt16BE(12);
  const flavor    = woff.readUInt32BE(4); // sfnt version (TTF=0x00010000, OTF="OTTO")

  // Reconstruct sfnt header
  // Find largest power of 2 <= numTables
  let searchRange = 1;
  while (searchRange * 2 <= numTables) searchRange *= 2;
  searchRange *= 16;
  const entrySelector  = Math.log2(searchRange / 16);
  const rangeShift     = numTables * 16 - searchRange;

  const headerSize    = 12 + numTables * 16;
  const out           = Buffer.alloc(woff.readUInt32BE(16)); // totalSfntSize
  let   writePos      = 0;

  // sfnt header
  out.writeUInt32BE(flavor, writePos); writePos += 4;
  out.writeUInt16BE(numTables, writePos); writePos += 2;
  out.writeUInt16BE(searchRange, writePos); writePos += 2;
  out.writeUInt16BE(entrySelector, writePos); writePos += 2;
  out.writeUInt16BE(rangeShift, writePos); writePos += 2;

  // Gather table directory entries from WOFF (each is 20 bytes)
  const woffDirOffset = 44; // WOFF header is 44 bytes
  const tables: { tag: number; checkSum: number; origOffset: number; origLength: number; compLength: number; compOffset: number }[] = [];

  let sfntOffset = headerSize;
  for (let i = 0; i < numTables; i++) {
    const base = woffDirOffset + i * 20;
    tables.push({
      tag:        woff.readUInt32BE(base),
      compOffset: woff.readUInt32BE(base + 4),
      compLength: woff.readUInt32BE(base + 8),
      origLength: woff.readUInt32BE(base + 12),
      checkSum:   woff.readUInt32BE(base + 16),
      origOffset: sfntOffset,
    });
    sfntOffset += Math.ceil(tables[i].origLength / 4) * 4;
  }

  // Write sfnt table directory
  for (const t of tables) {
    out.writeUInt32BE(t.tag, writePos); writePos += 4;
    out.writeUInt32BE(t.checkSum, writePos); writePos += 4;
    out.writeUInt32BE(t.origOffset, writePos); writePos += 4;
    out.writeUInt32BE(t.origLength, writePos); writePos += 4;
  }

  // Decompress and write table data
  const zlib = require("zlib") as typeof import("zlib");
  for (const t of tables) {
    const compressed = woff.subarray(t.compOffset, t.compOffset + t.compLength);
    let tableData: Buffer;
    if (t.compLength < t.origLength) {
      tableData = zlib.inflateRawSync(compressed);
    } else {
      tableData = compressed as Buffer;
    }
    tableData.copy(out, t.origOffset);
  }

  return out;
}
