import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Contrast Checker — FileSpark",
  description: "Check foreground/background pairs against WCAG AA and AAA ratios.",
  alternates: { canonical: "/tools/color-contrast" },
  openGraph: {
    title: "Color Contrast Checker — FileSpark",
    description: "Check foreground/background pairs against WCAG AA and AAA ratios.",
    url: "/tools/color-contrast",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Color Contrast Checker — FileSpark",
    description: "Check foreground/background pairs against WCAG AA and AAA ratios.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
