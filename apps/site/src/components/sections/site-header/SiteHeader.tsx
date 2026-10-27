import { ArrowUpRightIcon } from "lucide-react";

import { PoseImage } from "@/components/mascot/pose-image/PoseImage";
import { Button } from "@/components/ui/button/Button";
import { STUDIO_URL } from "@/lib/links";
import { MOSS } from "@/lib/mascots";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" }
];

export const SiteHeader = () => (
  <header
    id="top"
    className="sticky top-[env(safe-area-inset-top,0)] z-50 border-b border-hairline bg-paper/85 px-gutter backdrop-blur-md backdrop-saturate-150"
  >
    <div className="flex h-14 items-center gap-6">
      <a
        href="#top"
        className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight no-underline"
      >
        <PoseImage doc={MOSS} pose="default" scale={1.5} />
        OpenMascot
      </a>
      <nav aria-label="Sections" className="hidden gap-1 text-sm font-medium text-ink-soft lg:flex">
        {NAV.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 no-underline hover:bg-ink/6"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <Button href={STUDIO_URL} size="sm" className="ml-auto hidden sm:inline-flex">
        Open the studio
        <ArrowUpRightIcon aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
    </div>
  </header>
);
