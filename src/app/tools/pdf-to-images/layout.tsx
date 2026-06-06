import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Images — FileSpark",
  description: "Convert each PDF page to a PNG at multiple quality levels.",
  alternates: { canonical: "/tools/pdf-to-images" },
  openGraph: {
    title: "PDF to Images — FileSpark",
    description: "Convert each PDF page to a PNG at multiple quality levels.",
    url: "/tools/pdf-to-images",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PDF to Images — FileSpark",
    description: "Convert each PDF page to a PNG at multiple quality levels.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
