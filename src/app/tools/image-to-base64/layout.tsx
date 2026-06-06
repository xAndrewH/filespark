import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image → Base64 — FileSpark",
  description: "Convert images to Base64 data URIs, or decode them back to files.",
  alternates: { canonical: "/tools/image-to-base64" },
  openGraph: {
    title: "Image → Base64 — FileSpark",
    description: "Convert images to Base64 data URIs, or decode them back to files.",
    url: "/tools/image-to-base64",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Image → Base64 — FileSpark",
    description: "Convert images to Base64 data URIs, or decode them back to files.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
