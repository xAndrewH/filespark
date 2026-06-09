import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Average Calculator | FileSpark",
  description: "Mean, median, mode, and range for any set of numbers.",
  alternates: { canonical: "/tools/average-calculator" },
  openGraph: {
    title: "Average Calculator | FileSpark",
    description: "Mean, median, mode, and range for any set of numbers.",
    url: "/tools/average-calculator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Average Calculator | FileSpark",
    description: "Mean, median, mode, and range for any set of numbers.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
