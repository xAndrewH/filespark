import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — FileSpark",
  description: "Encode plain text to Base64 or decode Base64 strings.",
  alternates: { canonical: "/tools/base64" },
  openGraph: {
    title: "Base64 Encoder / Decoder — FileSpark",
    description: "Encode plain text to Base64 or decode Base64 strings.",
    url: "/tools/base64",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder / Decoder — FileSpark",
    description: "Encode plain text to Base64 or decode Base64 strings.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
