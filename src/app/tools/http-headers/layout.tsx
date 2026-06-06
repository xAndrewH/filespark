import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Header Analyzer — FileSpark",
  description: "Fetch a URL and inspect all response headers, categorized and scored.",
  alternates: { canonical: "/tools/http-headers" },
  openGraph: {
    title: "HTTP Header Analyzer — FileSpark",
    description: "Fetch a URL and inspect all response headers, categorized and scored.",
    url: "/tools/http-headers",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Header Analyzer — FileSpark",
    description: "Fetch a URL and inspect all response headers, categorized and scored.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
