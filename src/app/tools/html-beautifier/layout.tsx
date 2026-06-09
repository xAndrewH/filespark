import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Beautifier | FileSpark",
  description: "Format and indent HTML following W3C best practices.",
  alternates: { canonical: "/tools/html-beautifier" },
  openGraph: {
    title: "HTML Beautifier | FileSpark",
    description: "Format and indent HTML following W3C best practices.",
    url: "/tools/html-beautifier",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Beautifier | FileSpark",
    description: "Format and indent HTML following W3C best practices.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
