import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python Beautifier | FileSpark",
  description: "Format Python code with PEP 8 compliant 4-space indentation.",
  alternates: { canonical: "/tools/python-beautifier" },
  openGraph: {
    title: "Python Beautifier | FileSpark",
    description: "Format Python code with PEP 8 compliant 4-space indentation.",
    url: "/tools/python-beautifier",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Python Beautifier | FileSpark",
    description: "Format Python code with PEP 8 compliant 4-space indentation.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
