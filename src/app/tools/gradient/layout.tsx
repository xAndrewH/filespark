import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Gradient Builder | FileSpark",
  description: "Build linear and radial gradients and copy the CSS.",
  alternates: { canonical: "/tools/gradient" },
  openGraph: {
    title: "CSS Gradient Builder | FileSpark",
    description: "Build linear and radial gradients and copy the CSS.",
    url: "/tools/gradient",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CSS Gradient Builder | FileSpark",
    description: "Build linear and radial gradients and copy the CSS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
