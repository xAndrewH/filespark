declare module "ttf2woff" {
  function ttf2woff(input: Uint8Array, options?: Record<string, unknown>): Uint8Array;
  export = ttf2woff;
}
