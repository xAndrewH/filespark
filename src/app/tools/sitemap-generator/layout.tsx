import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap Generator | FileSpark",
  description: "Paste a list of URLs and generate a valid sitemap.xml with per-URL overrides.",
  alternates: { canonical: "/tools/sitemap-generator" },
  openGraph: {
    title: "Sitemap Generator | FileSpark",
    description: "Paste a list of URLs and generate a valid sitemap.xml with per-URL overrides.",
    url: "/tools/sitemap-generator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sitemap Generator | FileSpark",
    description: "Paste a list of URLs and generate a valid sitemap.xml with per-URL overrides.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
