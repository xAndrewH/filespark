import type { Metadata } from "next";

const title = "Responsive Design Viewer — FileSpark";
const description = "Preview a page at multiple device sizes side by side, right in your browser.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/responsive-viewer" },
  openGraph: {
    title,
    description,
    url: "/tools/responsive-viewer",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
