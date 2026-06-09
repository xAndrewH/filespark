import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Browser Tools | FileSpark",
  description:
    "85+ free browser tools for developers, designers, and marketers. JSON formatter, image editor, text diff, SEO tools, calculators, and more. No sign-up, no installs.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free Browser Tools | FileSpark",
    description:
      "85+ free browser tools for developers, designers, and marketers. JSON formatter, image editor, text diff, SEO tools, calculators, and more. No sign-up, no installs.",
    url: "/tools",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Free Browser Tools | FileSpark",
    description:
      "85+ free browser tools for developers, designers, and marketers. JSON formatter, image editor, text diff, SEO tools, calculators, and more. No sign-up, no installs.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
