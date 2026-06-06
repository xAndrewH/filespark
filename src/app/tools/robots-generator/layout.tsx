import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robots.txt Generator — FileSpark",
  description: "Build allow/disallow rules and preview your robots.txt file.",
  alternates: { canonical: "/tools/robots-generator" },
  openGraph: {
    title: "Robots.txt Generator — FileSpark",
    description: "Build allow/disallow rules and preview your robots.txt file.",
    url: "/tools/robots-generator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Robots.txt Generator — FileSpark",
    description: "Build allow/disallow rules and preview your robots.txt file.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
