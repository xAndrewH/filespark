import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter — FileSpark",
  description: "Convert length, weight, temperature, area, volume, and more.",
  alternates: { canonical: "/tools/units" },
  openGraph: {
    title: "Unit Converter — FileSpark",
    description: "Convert length, weight, temperature, area, volume, and more.",
    url: "/tools/units",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Unit Converter — FileSpark",
    description: "Convert length, weight, temperature, area, volume, and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
