import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — FileSpark",
  description: "Generate QR codes from any URL or text. Download as PNG.",
  alternates: { canonical: "/tools/qr" },
  openGraph: {
    title: "QR Code Generator — FileSpark",
    description: "Generate QR codes from any URL or text. Download as PNG.",
    url: "/tools/qr",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "QR Code Generator — FileSpark",
    description: "Generate QR codes from any URL or text. Download as PNG.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
