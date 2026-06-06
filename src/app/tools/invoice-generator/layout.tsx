import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Generator — FileSpark",
  description: "Fill in line items and preview a clean, printable invoice.",
  alternates: { canonical: "/tools/invoice-generator" },
  openGraph: {
    title: "Invoice Generator — FileSpark",
    description: "Fill in line items and preview a clean, printable invoice.",
    url: "/tools/invoice-generator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Invoice Generator — FileSpark",
    description: "Fill in line items and preview a clean, printable invoice.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
