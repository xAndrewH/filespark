import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF — FileSpark",
  description: "Turn a clip of any video into an optimized GIF, right in your browser.",
  alternates: { canonical: "/tools/video-to-gif" },
  openGraph: {
    title: "Video to GIF — FileSpark",
    description: "Turn a clip of any video into an optimized GIF, right in your browser.",
    url: "/tools/video-to-gif",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Video to GIF — FileSpark",
    description: "Turn a clip of any video into an optimized GIF, right in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
