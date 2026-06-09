import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor | FileSpark",
  description: "Compress JPEG, PNG, and WEBP images in bulk.",
  alternates: { canonical: "/tools/image-compressor" },
  openGraph: {
    title: "Image Compressor | FileSpark",
    description: "Compress JPEG, PNG, and WEBP images in bulk.",
    url: "/tools/image-compressor",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Image Compressor | FileSpark",
    description: "Compress JPEG, PNG, and WEBP images in bulk.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
