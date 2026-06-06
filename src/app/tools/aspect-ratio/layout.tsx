import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aspect Ratio Calculator — FileSpark",
  description: "Calculate width or height while locking an aspect ratio.",
  alternates: { canonical: "/tools/aspect-ratio" },
  openGraph: {
    title: "Aspect Ratio Calculator — FileSpark",
    description: "Calculate width or height while locking an aspect ratio.",
    url: "/tools/aspect-ratio",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aspect Ratio Calculator — FileSpark",
    description: "Calculate width or height while locking an aspect ratio.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
