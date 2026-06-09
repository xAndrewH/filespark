import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { BackToTop } from "@/components/BackToTop";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "FileSpark | File Converter & Browser Tools",
  description:
    "Convert and compress 80+ file formats. Use 85+ free browser tools for developers, designers, and marketers. No account, no installs, nothing stored.",
  metadataBase: new URL("https://filespark.app"),
  manifest: "/manifest.json",
  openGraph: {
    siteName: "FileSpark",
    title: "FileSpark | File Converter & Browser Tools",
    description:
      "Convert and compress 80+ file formats. Use 85+ free browser tools for developers, designers, and marketers. No account, no installs, nothing stored.",
    url: "https://filespark.app",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileSpark | File Converter & Browser Tools",
    description:
      "Convert and compress 80+ file formats. Use 85+ free browser tools for developers, designers, and marketers. No account, no installs, nothing stored.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">
        {children}
        <Footer />
        <CommandPalette />
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
