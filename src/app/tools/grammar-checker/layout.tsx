import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grammar & Spell Checker — FileSpark",
  description: "Check grammar, spelling, and style instantly in your browser.",
  alternates: { canonical: "/tools/grammar-checker" },
  openGraph: {
    title: "Grammar & Spell Checker — FileSpark",
    description: "Check grammar, spelling, and style instantly in your browser.",
    url: "/tools/grammar-checker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Grammar & Spell Checker — FileSpark",
    description: "Check grammar, spelling, and style instantly in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
