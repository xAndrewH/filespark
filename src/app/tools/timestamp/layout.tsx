import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timestamp Converter | FileSpark",
  description: "Convert Unix timestamps to human-readable dates and back.",
  alternates: { canonical: "/tools/timestamp" },
  openGraph: {
    title: "Timestamp Converter | FileSpark",
    description: "Convert Unix timestamps to human-readable dates and back.",
    url: "/tools/timestamp",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Timestamp Converter | FileSpark",
    description: "Convert Unix timestamps to human-readable dates and back.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
