import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNS Lookup | FileSpark",
  description: "Query A, AAAA, CNAME, MX, NS, TXT, and SOA records for any domain.",
  alternates: { canonical: "/tools/dns-lookup" },
  openGraph: {
    title: "DNS Lookup | FileSpark",
    description: "Query A, AAAA, CNAME, MX, NS, TXT, and SOA records for any domain.",
    url: "/tools/dns-lookup",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DNS Lookup | FileSpark",
    description: "Query A, AAAA, CNAME, MX, NS, TXT, and SOA records for any domain.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
