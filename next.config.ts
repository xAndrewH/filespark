import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle native/WASM packages — load them from node_modules at runtime
  serverExternalPackages: [
    "sharp",
    "heic-convert",
    "wawoff2",
    "ttf2woff",
    "archiver",
    "unzipper",
    "tar",
  ],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
