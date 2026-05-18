import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle these on the server — load from node_modules at runtime
  serverExternalPackages: [
    "sharp",
    "heic-convert",
    "wawoff2",
    "ttf2woff",
    "archiver",
    "unzipper",
    "tar",
  ],

  turbopack: {
    resolveAlias: {
      // Stub Node.js built-ins for browser bundles.
      // Emscripten packages (wawoff2) guard usage with ENVIRONMENT_IS_NODE checks
      // so these stubs are resolved at bundle time but never called at runtime.
      fs:   { browser: "./src/lib/node-browser-stub.js" },
      path: { browser: "./src/lib/node-browser-stub.js" },
    },
  },

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
