import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reorder / Delete PDF Pages — FileSpark",
  description: "Drag to reorder or remove pages from a PDF before saving.",
  alternates: { canonical: "/tools/pdf-pages" },
  openGraph: {
    title: "Reorder / Delete PDF Pages — FileSpark",
    description: "Drag to reorder or remove pages from a PDF before saving.",
    url: "/tools/pdf-pages",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reorder / Delete PDF Pages — FileSpark",
    description: "Drag to reorder or remove pages from a PDF before saving.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
