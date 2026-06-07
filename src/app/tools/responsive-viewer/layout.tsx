import type { Metadata } from "next";

const title = "Responsive Design Viewer — FileSpark";
const description = "Capture real screenshots of any page at multiple device sizes, side by side — phone, tablet, laptop, and desktop.";

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
