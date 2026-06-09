import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Beautifier | FileSpark",
  description: "Format and indent HTML, CSS, JavaScript, and more in one place.",
  alternates: { canonical: "/tools/code-beautifier" },
  openGraph: {
    title: "Code Beautifier | FileSpark",
    description: "Format and indent HTML, CSS, JavaScript, and more in one place.",
    url: "/tools/code-beautifier",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Code Beautifier | FileSpark",
    description: "Format and indent HTML, CSS, JavaScript, and more in one place.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
