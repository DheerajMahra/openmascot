import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { MascotProvider } from "@/lib/mascot-store";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

// The title is rendered in the layout below, not here: metadata streams in on every navigation, which
// takes the old <title> down first, and the tab flashes the URL in between.
export const metadata: Metadata = {
  // The studio's own origin, so the start page's canonical URL comes out absolute.
  metadataBase: new URL(process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3000"),
  description:
    "Open-source pixel mascot maker. Create a character, give it moods, embed it with two lines."
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* React hoists this into <head>; the root layout never unmounts, so neither does the title. */}
        <title>OpenMascot Studio</title>
        {/* A short delay so tooltips don't flash while the pointer is just passing over. */}
        <TooltipProvider delay={400}>
          <MascotProvider>{children}</MascotProvider>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
