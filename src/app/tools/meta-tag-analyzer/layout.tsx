import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta Tag Analyzer | FileSpark",
  description: "Enter a URL and see all OG, Twitter Card, and SEO meta tags it serves.",
  alternates: { canonical: "/tools/meta-tag-analyzer" },
  openGraph: {
    title: "Meta Tag Analyzer | FileSpark",
    description: "Enter a URL and see all OG, Twitter Card, and SEO meta tags it serves.",
    url: "/tools/meta-tag-analyzer",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Meta Tag Analyzer | FileSpark",
    description: "Enter a URL and see all OG, Twitter Card, and SEO meta tags it serves.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
