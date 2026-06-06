import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conversion Rate Calculator — FileSpark",
  description: "Calculate conversion rates, revenue impact, and A/B test significance.",
  alternates: { canonical: "/tools/conversion-rate" },
  openGraph: {
    title: "Conversion Rate Calculator — FileSpark",
    description: "Calculate conversion rates, revenue impact, and A/B test significance.",
    url: "/tools/conversion-rate",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Conversion Rate Calculator — FileSpark",
    description: "Calculate conversion rates, revenue impact, and A/B test significance.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
