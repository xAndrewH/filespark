import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator | FileSpark",
  description: "Cryptographically secure passwords with strength scoring.",
  alternates: { canonical: "/tools/password" },
  openGraph: {
    title: "Password Generator | FileSpark",
    description: "Cryptographically secure passwords with strength scoring.",
    url: "/tools/password",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Password Generator | FileSpark",
    description: "Cryptographically secure passwords with strength scoring.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
