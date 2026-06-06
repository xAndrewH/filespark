import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Card Preview — FileSpark",
  description: "Enter a URL and see how it renders on Facebook, X, and LinkedIn.",
  alternates: { canonical: "/tools/og-preview" },
  openGraph: {
    title: "Social Card Preview — FileSpark",
    description: "Enter a URL and see how it renders on Facebook, X, and LinkedIn.",
    url: "/tools/og-preview",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Social Card Preview — FileSpark",
    description: "Enter a URL and see how it renders on Facebook, X, and LinkedIn.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
