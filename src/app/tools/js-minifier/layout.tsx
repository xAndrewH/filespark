import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JS Minifier — FileSpark",
  description: "Minify JavaScript and TypeScript for production builds.",
  alternates: { canonical: "/tools/js-minifier" },
  openGraph: {
    title: "JS Minifier — FileSpark",
    description: "Minify JavaScript and TypeScript for production builds.",
    url: "/tools/js-minifier",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JS Minifier — FileSpark",
    description: "Minify JavaScript and TypeScript for production builds.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
