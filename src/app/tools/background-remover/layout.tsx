import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover | FileSpark",
  description: "Remove image backgrounds instantly in your browser, no upload required.",
  alternates: { canonical: "/tools/background-remover" },
  openGraph: {
    title: "Background Remover | FileSpark",
    description: "Remove image backgrounds instantly in your browser, no upload required.",
    url: "/tools/background-remover",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Background Remover | FileSpark",
    description: "Remove image backgrounds instantly in your browser, no upload required.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
