import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter — PNG, JPG, WEBP | FileSpark",
  description: "Convert images between PNG, JPG, and WEBP in bulk. Adjust quality and download all at once, entirely in your browser.",
  alternates: { canonical: "/tools/image-converter" },
  openGraph: {
    title: "Image Converter — PNG, JPG, WEBP | FileSpark",
    description: "Convert images between PNG, JPG, and WEBP in bulk. Adjust quality and download all at once, entirely in your browser.",
    url: "/tools/image-converter",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Image Converter — PNG, JPG, WEBP | FileSpark",
    description: "Convert images between PNG, JPG, and WEBP in bulk. Adjust quality and download all at once, entirely in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
