import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter — FileSpark",
  description: "Live exchange rates for 160+ currencies by country.",
  alternates: { canonical: "/tools/currency-converter" },
  openGraph: {
    title: "Currency Converter — FileSpark",
    description: "Live exchange rates for 160+ currencies by country.",
    url: "/tools/currency-converter",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Currency Converter — FileSpark",
    description: "Live exchange rates for 160+ currencies by country.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
