import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Merge | FileSpark",
  description: "Combine multiple PDFs into one, reorder pages before merging.",
  alternates: { canonical: "/tools/pdf-merge" },
  openGraph: {
    title: "PDF Merge | FileSpark",
    description: "Combine multiple PDFs into one, reorder pages before merging.",
    url: "/tools/pdf-merge",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PDF Merge | FileSpark",
    description: "Combine multiple PDFs into one, reorder pages before merging.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
