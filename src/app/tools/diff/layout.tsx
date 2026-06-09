import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff Checker | FileSpark",
  description: "Paste two texts and see exactly what changed.",
  alternates: { canonical: "/tools/diff" },
  openGraph: {
    title: "Text Diff Checker | FileSpark",
    description: "Paste two texts and see exactly what changed.",
    url: "/tools/diff",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Text Diff Checker | FileSpark",
    description: "Paste two texts and see exactly what changed.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
