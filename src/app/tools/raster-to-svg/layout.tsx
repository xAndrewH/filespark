import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNG / JPG → SVG — FileSpark",
  description: "Vectorize raster images to scalable SVG.",
  alternates: { canonical: "/tools/raster-to-svg" },
  openGraph: {
    title: "PNG / JPG → SVG — FileSpark",
    description: "Vectorize raster images to scalable SVG.",
    url: "/tools/raster-to-svg",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PNG / JPG → SVG — FileSpark",
    description: "Vectorize raster images to scalable SVG.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
