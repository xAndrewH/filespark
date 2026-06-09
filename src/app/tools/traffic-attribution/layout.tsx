import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traffic Source Attribution | FileSpark",
  description: "Compare last-touch, first-touch, and linear attribution across channels.",
  alternates: { canonical: "/tools/traffic-attribution" },
  openGraph: {
    title: "Traffic Source Attribution | FileSpark",
    description: "Compare last-touch, first-touch, and linear attribution across channels.",
    url: "/tools/traffic-attribution",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Traffic Source Attribution | FileSpark",
    description: "Compare last-touch, first-touch, and linear attribution across channels.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
