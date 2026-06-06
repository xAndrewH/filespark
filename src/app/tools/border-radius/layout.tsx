import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Border Radius Builder — FileSpark",
  description: "Shape rounded corners per-side visually and copy the CSS.",
  alternates: { canonical: "/tools/border-radius" },
  openGraph: {
    title: "Border Radius Builder — FileSpark",
    description: "Shape rounded corners per-side visually and copy the CSS.",
    url: "/tools/border-radius",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Border Radius Builder — FileSpark",
    description: "Shape rounded corners per-side visually and copy the CSS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
