import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Generator | FileSpark",
  description: "Design custom 1280×720 thumbnails with text, gradients, and images.",
  alternates: { canonical: "/tools/youtube-thumbnail" },
  openGraph: {
    title: "YouTube Thumbnail Generator | FileSpark",
    description: "Design custom 1280×720 thumbnails with text, gradients, and images.",
    url: "/tools/youtube-thumbnail",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YouTube Thumbnail Generator | FileSpark",
    description: "Design custom 1280×720 thumbnails with text, gradients, and images.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
