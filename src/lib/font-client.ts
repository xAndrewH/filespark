import { inflateSync } from "fflate";

const WOFF_MAGIC  = 0x774f4646;
const WOFF2_MAGIC = 0x774f4632;

function r32(b: Uint8Array, o: number) { return ((b[o]<<24)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3]) >>> 0; }
function r16(b: Uint8Array, o: number) { return (b[o]<<8)|b[o+1]; }
function w32(b: Uint8Array, o: number, v: number) { b[o]=(v>>>24)&0xff; b[o+1]=(v>>>16)&0xff; b[o+2]=(v>>>8)&0xff; b[o+3]=v&0xff; }
function w16(b: Uint8Array, o: number, v: number) { b[o]=(v>>>8)&0xff; b[o+1]=v&0xff; }
function wStr(b: Uint8Array, o: number, len: number, s: string) { b.fill(0,o,o+len); new TextEncoder().encode(s).subarray(0,len).forEach((x,i)=>{ b[o+i]=x; }); }

function detectFont(buf: Uint8Array): "ttf"|"otf"|"woff"|"woff2"|"unknown" {
  if (buf.length < 4) return "unknown";
  const sig = r32(buf, 0);
  if (sig === WOFF_MAGIC)  return "woff";
  if (sig === WOFF2_MAGIC) return "woff2";
  if (sig === 0x00010000 || sig === 0x74727565) return "ttf";
  if (sig === 0x4f54544f) return "otf";
  return "unknown";
}

function stripWoff1(woff: Uint8Array): Uint8Array {
  const numTables = r16(woff, 12);
  const flavor    = r32(woff, 4);

  let sr = 1;
  while (sr * 2 <= numTables) sr *= 2;
  sr *= 16;
  const es = Math.log2(sr / 16);
  const rs = numTables * 16 - sr;

  const headerSize = 12 + numTables * 16;
  const out = new Uint8Array(r32(woff, 16));
  let wp = 0;

  w32(out, wp, flavor); wp += 4;
  w16(out, wp, numTables); wp += 2;
  w16(out, wp, sr); wp += 2;
  w16(out, wp, es); wp += 2;
  w16(out, wp, rs); wp += 2;

  const dir: { tag:number; checkSum:number; compOffset:number; compLength:number; origLength:number; origOffset:number }[] = [];
  let sfntOff = headerSize;
  for (let i = 0; i < numTables; i++) {
    const b = 44 + i * 20;
    dir.push({ tag: r32(woff,b), compOffset: r32(woff,b+4), compLength: r32(woff,b+8), origLength: r32(woff,b+12), checkSum: r32(woff,b+16), origOffset: sfntOff });
    sfntOff += Math.ceil(dir[i].origLength / 4) * 4;
  }

  for (const t of dir) { w32(out,wp,t.tag); wp+=4; w32(out,wp,t.checkSum); wp+=4; w32(out,wp,t.origOffset); wp+=4; w32(out,wp,t.origLength); wp+=4; }

  for (const t of dir) {
    const comp = woff.subarray(t.compOffset, t.compOffset + t.compLength);
    const data = t.compLength < t.origLength ? inflateSync(comp) : comp;
    out.set(data, t.origOffset);
  }
  return out;
}

const MIME: Record<string,string> = { ttf:"font/ttf", otf:"font/otf", woff:"font/woff", woff2:"font/woff2" };

export async function convertFontClient(file: File, targetFormat: string): Promise<Blob> {
  const fmt    = targetFormat.toLowerCase();
  const input  = new Uint8Array(await file.arrayBuffer());
  const inType = detectFont(input);
  let sfnt: Uint8Array;

  if (inType === "woff2") {
    const { decompress } = await import("wawoff2");
    sfnt = new Uint8Array(await decompress(input));
  } else if (inType === "woff") {
    sfnt = stripWoff1(input);
  } else {
    sfnt = input;
  }

  let result: Uint8Array;
  if (fmt === "woff2") {
    const { compress } = await import("wawoff2");
    result = new Uint8Array(await compress(sfnt));
  } else if (fmt === "woff") {
    const ttf2woff = (await import("ttf2woff")).default;
    result = new Uint8Array(ttf2woff(sfnt));
  } else {
    result = sfnt;
  }

  const buf = new ArrayBuffer(result.byteLength);
  new Uint8Array(buf).set(result);
  return new Blob([buf], { type: MIME[fmt] ?? "application/octet-stream" });
}
