import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator | FileSpark",
  description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.",
  alternates: { canonical: "/tools/hash" },
  openGraph: {
    title: "Hash Generator | FileSpark",
    description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.",
    url: "/tools/hash",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hash Generator | FileSpark",
    description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
