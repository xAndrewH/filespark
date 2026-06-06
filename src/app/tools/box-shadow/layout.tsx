import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Box Shadow Builder — FileSpark",
  description: "Build CSS box shadows with multiple layers and live preview.",
  alternates: { canonical: "/tools/box-shadow" },
  openGraph: {
    title: "Box Shadow Builder — FileSpark",
    description: "Build CSS box shadows with multiple layers and live preview.",
    url: "/tools/box-shadow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Box Shadow Builder — FileSpark",
    description: "Build CSS box shadows with multiple layers and live preview.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
