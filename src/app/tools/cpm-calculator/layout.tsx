import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CPM / CPC / CTR Calculator | FileSpark",
  description: "Enter any two ad metrics to instantly calculate the third.",
  alternates: { canonical: "/tools/cpm-calculator" },
  openGraph: {
    title: "CPM / CPC / CTR Calculator | FileSpark",
    description: "Enter any two ad metrics to instantly calculate the third.",
    url: "/tools/cpm-calculator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CPM / CPC / CTR Calculator | FileSpark",
    description: "Enter any two ad metrics to instantly calculate the third.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
