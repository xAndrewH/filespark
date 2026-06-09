import type { MetadataRoute } from "next";

const BASE = "https://filespark.app";

const TOOLS = [
  "/tools/age-calculator","/tools/aspect-ratio","/tools/average-calculator",
  "/tools/background-remover","/tools/base-converter","/tools/base64",
  "/tools/border-radius","/tools/box-shadow","/tools/calculator",
  "/tools/case-converter","/tools/code-to-image","/tools/color-contrast",
  "/tools/color-picker","/tools/conversion-rate","/tools/cpm-calculator",
  "/tools/cron","/tools/css-animation","/tools/css-beautifier",
  "/tools/css-grid","/tools/css-minifier","/tools/csv-json",
  "/tools/currency-converter","/tools/diff","/tools/dns-lookup",
  "/tools/email-preview","/tools/exif","/tools/favicon","/tools/find-replace",
  "/tools/framework-reference","/tools/glassmorphism","/tools/gradient",
  "/tools/grammar-checker","/tools/hash","/tools/html-beautifier",
  "/tools/html-to-markdown","/tools/http-headers","/tools/http-status",
  "/tools/image-compressor","/tools/image-editor","/tools/image-to-base64",
  "/tools/invoice-generator","/tools/ip-lookup","/tools/js-beautifier",
  "/tools/js-minifier","/tools/json","/tools/jwt-decoder",
  "/tools/landing-page-template","/tools/lorem","/tools/markdown",
  "/tools/meta-tag-analyzer","/tools/mock-data","/tools/my-ip",
  "/tools/og-meta","/tools/og-preview","/tools/page-speed","/tools/palette",
  "/tools/password","/tools/pdf-merge","/tools/pdf-pages","/tools/pdf-to-images",
  "/tools/percentage-calculator","/tools/placeholder-image","/tools/python-beautifier",
  "/tools/qr","/tools/raster-to-svg","/tools/regex","/tools/regex-cheatsheet",
  "/tools/responsive-viewer","/tools/roas-calculator","/tools/robots-generator",
  "/tools/roi-calculator","/tools/sales-tax","/tools/schema-generator",
  "/tools/sitemap-generator","/tools/ssl-checker","/tools/svg-to-png",
  "/tools/time-calculator","/tools/timestamp","/tools/traffic-attribution",
  "/tools/units","/tools/upscale-image","/tools/url-encode","/tools/utm-builder",
  "/tools/video-to-gif","/tools/word-counter","/tools/youtube-thumbnail",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...TOOLS.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/dmca`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
