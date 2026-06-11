import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Converter | FileSpark",
  description: "Combine JPG, PNG, WEBP, or GIF images into a single PDF. Reorder pages, choose page size and margins.",
  alternates: { canonical: "/tools/image-to-pdf" },
  openGraph: {
    title: "Image to PDF Converter | FileSpark",
    description: "Combine JPG, PNG, WEBP, or GIF images into a single PDF. Reorder pages, choose page size and margins.",
    url: "/tools/image-to-pdf",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Image to PDF Converter | FileSpark",
    description: "Combine JPG, PNG, WEBP, or GIF images into a single PDF. Reorder pages, choose page size and margins.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
