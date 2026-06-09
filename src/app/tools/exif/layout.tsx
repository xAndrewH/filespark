import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXIF Viewer | FileSpark",
  description: "Read camera settings, GPS, and metadata from images.",
  alternates: { canonical: "/tools/exif" },
  openGraph: {
    title: "EXIF Viewer | FileSpark",
    description: "Read camera settings, GPS, and metadata from images.",
    url: "/tools/exif",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EXIF Viewer | FileSpark",
    description: "Read camera settings, GPS, and metadata from images.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
