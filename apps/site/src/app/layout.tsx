import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Geist, Geist_Mono, Silkscreen } from "next/font/google";

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

export const metadata: Metadata = {
  title: "OpenMascot · Pixel mascots for every website",
  description:
    "Open-source pixel mascot maker. Draw your character, give it moves, and put it on any website with two lines of HTML."
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
      <body>{children}</body>
    </html>
  );
}
