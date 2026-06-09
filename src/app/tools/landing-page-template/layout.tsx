import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing Page Checklist | FileSpark",
  description: "45-item checklist to audit your landing page against conversion best practices.",
  alternates: { canonical: "/tools/landing-page-template" },
  openGraph: {
    title: "Landing Page Checklist | FileSpark",
    description: "45-item checklist to audit your landing page against conversion best practices.",
    url: "/tools/landing-page-template",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Landing Page Checklist | FileSpark",
    description: "45-item checklist to audit your landing page against conversion best practices.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
