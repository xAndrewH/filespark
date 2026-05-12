declare module "heic-convert" {
  interface ConvertOptions {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }
  function convert(options: ConvertOptions): Promise<ArrayBuffer>;
  export default convert;
  export function one(options: ConvertOptions): Promise<ArrayBuffer>;
  export function all(options: ConvertOptions): Promise<ArrayBuffer[]>;
}
