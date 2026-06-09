import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV ↔ JSON | FileSpark",
  description: "Convert between CSV and JSON with a live table preview.",
  alternates: { canonical: "/tools/csv-json" },
  openGraph: {
    title: "CSV ↔ JSON | FileSpark",
    description: "Convert between CSV and JSON with a live table preview.",
    url: "/tools/csv-json",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CSV ↔ JSON | FileSpark",
    description: "Convert between CSV and JSON with a live table preview.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
