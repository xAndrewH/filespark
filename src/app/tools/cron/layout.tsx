import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Builder | FileSpark",
  description: "Build and validate cron schedules with next-run preview.",
  alternates: { canonical: "/tools/cron" },
  openGraph: {
    title: "Cron Expression Builder | FileSpark",
    description: "Build and validate cron schedules with next-run preview.",
    url: "/tools/cron",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Expression Builder | FileSpark",
    description: "Build and validate cron schedules with next-run preview.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
