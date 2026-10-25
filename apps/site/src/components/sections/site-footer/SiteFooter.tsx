import { Container } from "@/components/ui/container/Container";
import { GITHUB_URL } from "@/lib/links";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" }
];

export const SiteFooter = () => (
  <footer className="relative overflow-hidden pt-10">
    <Container className="flex flex-wrap justify-between gap-6 pb-5 text-sm text-muted">
      <span>OpenMascot · open-source pixel mascot maker</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-5">
        {LINKS.map(link => (
          <a key={link.href} href={link.href} className="no-underline hover:text-ink">
            {link.label}
          </a>
        ))}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline hover:text-ink"
        >
          GitHub
        </a>
      </nav>
      <p className="w-full text-xs">
        Clawd is a trademark of Anthropic, PBC. OpenMascot is not affiliated with Anthropic.
      </p>
    </Container>
    <div
      aria-hidden
      className="-mb-[0.22em] overflow-hidden pb-[env(safe-area-inset-bottom,0)] text-center font-pixel text-watermark leading-watermark whitespace-nowrap text-hairline select-none"
    >
      OpenMascot
    </div>
  </footer>
);
