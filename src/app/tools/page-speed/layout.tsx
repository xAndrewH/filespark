import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Speed Estimator | FileSpark",
  description: "Check load time, TTFB, resource counts, and get performance tips for any URL.",
  alternates: { canonical: "/tools/page-speed" },
  openGraph: {
    title: "Page Speed Estimator | FileSpark",
    description: "Check load time, TTFB, resource counts, and get performance tips for any URL.",
    url: "/tools/page-speed",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Page Speed Estimator | FileSpark",
    description: "Check load time, TTFB, resource counts, and get performance tips for any URL.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
