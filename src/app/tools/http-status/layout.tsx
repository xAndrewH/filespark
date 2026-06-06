import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Status Codes — FileSpark",
  description: "Searchable reference for every HTTP status code.",
  alternates: { canonical: "/tools/http-status" },
  openGraph: {
    title: "HTTP Status Codes — FileSpark",
    description: "Searchable reference for every HTTP status code.",
    url: "/tools/http-status",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Status Codes — FileSpark",
    description: "Searchable reference for every HTTP status code.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
