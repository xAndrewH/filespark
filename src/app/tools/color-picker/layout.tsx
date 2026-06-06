import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Picker — FileSpark",
  description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly.",
  alternates: { canonical: "/tools/color-picker" },
  openGraph: {
    title: "Color Picker — FileSpark",
    description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly.",
    url: "/tools/color-picker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Color Picker — FileSpark",
    description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
