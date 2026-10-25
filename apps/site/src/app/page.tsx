import { Features } from "@/components/sections/features/Features";
import { FinalCta } from "@/components/sections/final-cta/FinalCta";
import { Hero } from "@/components/sections/hero/Hero";
import { Parade } from "@/components/sections/parade/Parade";
import { SiteFooter } from "@/components/sections/site-footer/SiteFooter";
import { SiteHeader } from "@/components/sections/site-header/SiteHeader";
import { Story } from "@/components/sections/story/Story";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Story />
        <Features />
        <Parade />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
