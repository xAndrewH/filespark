import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Subject Previewer — FileSpark",
  description: "Preview how your subject line looks in Gmail and Apple Mail.",
  alternates: { canonical: "/tools/email-preview" },
  openGraph: {
    title: "Email Subject Previewer — FileSpark",
    description: "Preview how your subject line looks in Gmail and Apple Mail.",
    url: "/tools/email-preview",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Email Subject Previewer — FileSpark",
    description: "Preview how your subject line looks in Gmail and Apple Mail.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
