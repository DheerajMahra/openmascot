import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Silkscreen } from "next/font/google";

import { SITE_URL } from "@/lib/links";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

/** Only the footer watermark uses it. */
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: "400",
  subsets: ["latin"]
});

const title = "OpenMascot · Pixel mascots for every website";
const description =
  "Open-source pixel mascot maker. Draw your character, give it moves, and put it on any website with two lines of HTML.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "OpenMascot",
    title,
    description,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Moss and Clawd, the OpenMascot samples" }
    ]
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] }
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#ffffff"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${silkscreen.variable} antialiased`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
