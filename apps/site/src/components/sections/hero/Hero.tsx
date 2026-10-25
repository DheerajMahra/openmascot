import { Button } from "@/components/ui/button/Button";
import { Container } from "@/components/ui/container/Container";
import { Pill } from "@/components/ui/pill/Pill";
import { SpeechBubble } from "@/components/ui/speech-bubble/SpeechBubble";
import { GITHUB_URL, STUDIO_URL } from "@/lib/links";

import { EventFlip } from "./EventFlip";
import { HeroCast } from "./HeroCast";

const NOTES = ["Two lines of HTML", "3.9 KB embed", "Stays in your browser"];

export const Hero = () => (
  <section
    aria-labelledby="hero-title"
    className="relative flex h-screen-nav flex-col overflow-hidden bg-hero pt-hero"
  >
    <Container className="z-1 flex flex-wrap items-end justify-center gap-10 pb-8 lg:block lg:pb-0">
      {/* On wide screens the bottom padding keeps room for Clawd's chip band, so a short window
          makes the hero taller instead of letting the chips cover the copy. */}
      <div className="flex basis-full flex-col items-center gap-5.5 pb-2 text-center lg:pb-80">
        <a
          href="#how"
          className="inline-flex min-h-8 items-center gap-2.5 rounded-full border border-hairline bg-paper py-1 pr-3 pl-1.5 text-left text-caption font-medium text-ink-soft no-underline shadow-float"
        >
          <Pill tone="moss" className="shrink-0">
            Open source
          </Pill>
          Draw one in minutes · no account
        </a>
        <SpeechBubble>
          <h1
            id="hero-title"
            className="text-hero leading-hero font-bold tracking-hero text-balance"
          >
            Pixel mascots for every <span className="text-clay">website.</span>
          </h1>
        </SpeechBubble>
        <p className="flex max-w-sub flex-wrap items-center justify-center gap-2 text-sub font-medium text-ink-soft">
          A tiny pixel-friend for your app that reacts to <EventFlip />
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button href={STUDIO_URL}>Make a mascot</Button>
          <Button href={GITHUB_URL} variant="ghost">
            Star on GitHub
          </Button>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-caption text-muted">
          {NOTES.map(note => (
            <li key={note} className="inline-flex items-center gap-1.5">
              <i aria-hidden className="block size-1.5 bg-leaf" />
              {note}
            </li>
          ))}
        </ul>
      </div>
      <HeroCast />
    </Container>
  </section>
);
