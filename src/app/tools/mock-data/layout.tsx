import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Data Generator — FileSpark",
  description: "Build a schema and generate fake JSON, CSV, or SQL test data.",
  alternates: { canonical: "/tools/mock-data" },
  openGraph: {
    title: "Mock Data Generator — FileSpark",
    description: "Build a schema and generate fake JSON, CSV, or SQL test data.",
    url: "/tools/mock-data",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mock Data Generator — FileSpark",
    description: "Build a schema and generate fake JSON, CSV, or SQL test data.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
