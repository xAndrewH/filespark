import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glassmorphism Generator — FileSpark",
  description: "Build glass-effect UI cards with blur and opacity controls.",
  alternates: { canonical: "/tools/glassmorphism" },
  openGraph: {
    title: "Glassmorphism Generator — FileSpark",
    description: "Build glass-effect UI cards with blur and opacity controls.",
    url: "/tools/glassmorphism",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Glassmorphism Generator — FileSpark",
    description: "Build glass-effect UI cards with blur and opacity controls.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
