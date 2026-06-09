import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upscale Image | FileSpark",
  description: "Upscale images up to 4× resolution using bilinear or nearest-neighbor.",
  alternates: { canonical: "/tools/upscale-image" },
  openGraph: {
    title: "Upscale Image | FileSpark",
    description: "Upscale images up to 4× resolution using bilinear or nearest-neighbor.",
    url: "/tools/upscale-image",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Upscale Image | FileSpark",
    description: "Upscale images up to 4× resolution using bilinear or nearest-neighbor.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
