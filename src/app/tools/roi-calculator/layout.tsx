import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Calculator — FileSpark",
  description: "Calculate ROI, net profit, and compound growth over time.",
  alternates: { canonical: "/tools/roi-calculator" },
  openGraph: {
    title: "ROI Calculator — FileSpark",
    description: "Calculate ROI, net profit, and compound growth over time.",
    url: "/tools/roi-calculator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ROI Calculator — FileSpark",
    description: "Calculate ROI, net profit, and compound growth over time.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
