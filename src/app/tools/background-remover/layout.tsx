import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover — FileSpark",
  description: "AI-powered background removal in your browser.",
  alternates: { canonical: "/tools/background-remover" },
  openGraph: {
    title: "Background Remover — FileSpark",
    description: "AI-powered background removal in your browser.",
    url: "/tools/background-remover",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Background Remover — FileSpark",
    description: "AI-powered background removal in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
