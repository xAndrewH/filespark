import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder | FileSpark",
  description: "Percent-encode URLs or decode encoded query strings.",
  alternates: { canonical: "/tools/url-encode" },
  openGraph: {
    title: "URL Encoder / Decoder | FileSpark",
    description: "Percent-encode URLs or decode encoded query strings.",
    url: "/tools/url-encode",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Encoder / Decoder | FileSpark",
    description: "Percent-encode URLs or decode encoded query strings.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
