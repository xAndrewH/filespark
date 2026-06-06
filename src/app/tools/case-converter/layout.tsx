import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Converter — FileSpark",
  description: "Convert text between camelCase, snake_case, kebab-case, and more.",
  alternates: { canonical: "/tools/case-converter" },
  openGraph: {
    title: "Case Converter — FileSpark",
    description: "Convert text between camelCase, snake_case, kebab-case, and more.",
    url: "/tools/case-converter",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Case Converter — FileSpark",
    description: "Convert text between camelCase, snake_case, kebab-case, and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
