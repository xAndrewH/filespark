import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML → Markdown | FileSpark",
  description: "Convert pasted HTML into clean Markdown.",
  alternates: { canonical: "/tools/html-to-markdown" },
  openGraph: {
    title: "HTML → Markdown | FileSpark",
    description: "Convert pasted HTML into clean Markdown.",
    url: "/tools/html-to-markdown",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML → Markdown | FileSpark",
    description: "Convert pasted HTML into clean Markdown.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
