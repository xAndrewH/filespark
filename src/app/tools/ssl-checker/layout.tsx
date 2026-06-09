import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSL Certificate Checker | FileSpark",
  description: "Enter a domain and see cert expiry, issuer, SANs, and fingerprint.",
  alternates: { canonical: "/tools/ssl-checker" },
  openGraph: {
    title: "SSL Certificate Checker | FileSpark",
    description: "Enter a domain and see cert expiry, issuer, SANs, and fingerprint.",
    url: "/tools/ssl-checker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SSL Certificate Checker | FileSpark",
    description: "Enter a domain and see cert expiry, issuer, SANs, and fingerprint.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
