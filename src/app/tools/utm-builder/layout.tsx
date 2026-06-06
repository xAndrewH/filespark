import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UTM Builder — FileSpark",
  description: "Build UTM-tagged URLs for campaign tracking.",
  alternates: { canonical: "/tools/utm-builder" },
  openGraph: {
    title: "UTM Builder — FileSpark",
    description: "Build UTM-tagged URLs for campaign tracking.",
    url: "/tools/utm-builder",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UTM Builder — FileSpark",
    description: "Build UTM-tagged URLs for campaign tracking.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
