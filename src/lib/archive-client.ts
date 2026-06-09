import { inflateSync, gzipSync, strFromU8 } from "fflate";

interface Entry { name: string; data: Uint8Array; }

// ── TAR ──────────────────────────────────────────────────────────

const ENC = new TextEncoder();
const DEC = new TextDecoder();

function tarStr(b: Uint8Array, o: number, len: number): string {
  const s = b.subarray(o, o + len); const end = s.indexOf(0);
  return DEC.decode(end >= 0 ? s.subarray(0, end) : s);
}
function tarOct(b: Uint8Array, o: number, len: number): number {
  return parseInt(tarStr(b, o, len).trim(), 8) || 0;
}
function wStr(b: Uint8Array, o: number, len: number, s: string) {
  b.fill(0, o, o + len); ENC.encode(s).subarray(0, len).forEach((x, i) => { b[o + i] = x; });
}
function wOct(b: Uint8Array, o: number, len: number, n: number) {
  wStr(b, o, len, n.toString(8).padStart(len - 1, "0") + "\0");
}
function checksum(h: Uint8Array): number {
  let s = 0; for (let i = 0; i < 512; i++) s += (i >= 148 && i < 156) ? 32 : h[i]; return s;
}

function packTar(entries: Entry[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  for (const e of entries) {
    let name = e.name; let prefix = "";
    if (name.length > 100) {
      const sl = name.lastIndexOf("/", 154);
      if (sl > 0 && name.length - sl - 1 <= 100) { prefix = name.slice(0, sl); name = name.slice(sl + 1); }
      else name = name.slice(-100);
    }
    const h = new Uint8Array(512);
    wStr(h, 0,   100, name);         wStr(h, 100, 8, "0000644\0");
    wStr(h, 108, 8,   "0000000\0");  wStr(h, 116, 8, "0000000\0");
    wOct(h, 124, 12, e.data.length); wOct(h, 136, 12, Math.floor(Date.now() / 1000));
    h.fill(32, 148, 156); h[156] = 48;
    wStr(h, 257, 6, "ustar\0"); wStr(h, 263, 2, "00"); wStr(h, 345, 155, prefix);
    const cs = checksum(h); wStr(h, 148, 8, cs.toString(8).padStart(6, "0") + "\0 ");
    chunks.push(h);
    const padded = new Uint8Array(Math.ceil(e.data.length / 512) * 512);
    padded.set(e.data); chunks.push(padded);
  }
  chunks.push(new Uint8Array(1024));
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total); let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.length; }
  return out;
}

function unpackTar(data: Uint8Array): Entry[] {
  const entries: Entry[] = []; let pos = 0;
  while (pos + 512 <= data.length) {
    const h = data.subarray(pos, pos + 512);
    if (h.every(b => b === 0)) break;
    const name   = tarStr(h, 0,   100);
    const prefix = tarStr(h, 345, 155);
    const type   = h[156];
    const size   = tarOct(h, 124, 12);
    const full   = prefix ? `${prefix}/${name}` : name;
    pos += 512;
    if ((type === 48 || type === 0 || type === 55) && full && size > 0)
      entries.push({ name: full, data: data.slice(pos, pos + size) });
    pos += Math.ceil(size / 512) * 512;
  }
  return entries;
}

// ── ZIP ──────────────────────────────────────────────────────────

async function readZip(file: File): Promise<Entry[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const entries: Entry[] = [];
  for (const [name, entry] of Object.entries(zip.files)) {
    if (!entry.dir) entries.push({ name, data: await entry.async("uint8array") });
  }
  return entries;
}

async function writeZip(entries: Entry[]): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const e of entries) zip.file(e.name, e.data);
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

// ── Public API ────────────────────────────────────────────────────

const EXTRACTABLE = new Set(["zip", "tar", "gz"]);
const PACKABLE    = new Set(["zip", "tar", "gz"]);

export function archiveNeedsServer(inputExt: string, outputFmt: string): boolean {
  return !EXTRACTABLE.has(inputExt) || !PACKABLE.has(outputFmt);
}

export async function convertArchiveClient(file: File, targetFormat: string): Promise<Blob> {
  const inExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fmt   = targetFormat.toLowerCase();

  if (!EXTRACTABLE.has(inExt)) throw new Error(`${inExt.toUpperCase()} extraction is not supported in-browser. Supported inputs: ZIP, TAR, TAR.GZ`);
  if (!PACKABLE.has(fmt))     throw new Error(`${fmt.toUpperCase()} creation is not supported in-browser. Supported outputs: ZIP, TAR, TAR.GZ`);

  // Extract
  let entries: Entry[];
  if (inExt === "zip") {
    entries = await readZip(file);
  } else if (inExt === "tar") {
    entries = unpackTar(new Uint8Array(await file.arrayBuffer()));
  } else { // gz = tar.gz
    const raw = inflateSync(new Uint8Array(await file.arrayBuffer()));
    entries = unpackTar(raw);
  }

  if (entries.length === 0) throw new Error("No files found in archive");

  // Repack | copy into a fresh ArrayBuffer to satisfy Blob's strict type requirements
  const toBlob = (d: Uint8Array, type: string) => {
    const buf = new ArrayBuffer(d.byteLength);
    new Uint8Array(buf).set(d);
    return new Blob([buf], { type });
  };
  if (fmt === "zip") {
    return toBlob(await writeZip(entries), "application/zip");
  } else if (fmt === "tar") {
    return toBlob(packTar(entries), "application/x-tar");
  } else { // gz = tar.gz
    return toBlob(gzipSync(packTar(entries)), "application/gzip");
  }
}

// suppress unused import warning
void strFromU8;
