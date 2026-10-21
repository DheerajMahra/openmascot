import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "OpenMascot Studio",
  description:
    "Open-source pixel mascot maker. Create a character, give it moods, embed it with two lines."
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* A short delay so tooltips don't flash while the pointer is just passing over. */}
        <TooltipProvider delay={400}>
          <MascotProvider>{children}</MascotProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
