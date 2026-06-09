import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placeholder Image Generator | FileSpark",
  description: "Generate placeholder images at any size with custom colors and text.",
  alternates: { canonical: "/tools/placeholder-image" },
  openGraph: {
    title: "Placeholder Image Generator | FileSpark",
    description: "Generate placeholder images at any size with custom colors and text.",
    url: "/tools/placeholder-image",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Placeholder Image Generator | FileSpark",
    description: "Generate placeholder images at any size with custom colors and text.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
