import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Animation Builder | FileSpark",
  description: "Build keyframe animations visually and export the CSS.",
  alternates: { canonical: "/tools/css-animation" },
  openGraph: {
    title: "CSS Animation Builder | FileSpark",
    description: "Build keyframe animations visually and export the CSS.",
    url: "/tools/css-animation",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CSS Animation Builder | FileSpark",
    description: "Build keyframe animations visually and export the CSS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
