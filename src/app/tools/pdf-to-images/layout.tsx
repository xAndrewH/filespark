import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to JPG, PNG, or WEBP Converter | FileSpark",
  description: "Convert PDF pages to JPG, PNG, or WEBP images at multiple resolutions, entirely in your browser.",
  alternates: { canonical: "/tools/pdf-to-images" },
  openGraph: {
    title: "PDF to JPG, PNG, or WEBP Converter | FileSpark",
    description: "Convert PDF pages to JPG, PNG, or WEBP images at multiple resolutions, entirely in your browser.",
    url: "/tools/pdf-to-images",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PDF to JPG, PNG, or WEBP Converter | FileSpark",
    description: "Convert PDF pages to JPG, PNG, or WEBP images at multiple resolutions, entirely in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
