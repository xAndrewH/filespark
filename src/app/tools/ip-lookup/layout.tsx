import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IP Address Lookup | FileSpark",
  description: "Look up geolocation and network details for any IP address.",
  alternates: { canonical: "/tools/ip-lookup" },
  openGraph: {
    title: "IP Address Lookup | FileSpark",
    description: "Look up geolocation and network details for any IP address.",
    url: "/tools/ip-lookup",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IP Address Lookup | FileSpark",
    description: "Look up geolocation and network details for any IP address.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
