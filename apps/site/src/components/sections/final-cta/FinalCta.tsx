import { Mascot } from "@/components/mascot/mascot/Mascot";
import { Button } from "@/components/ui/button/Button";
import { Container } from "@/components/ui/container/Container";
import { Pill, PillMark } from "@/components/ui/pill/Pill";
import { Reveal } from "@/components/ui/reveal/Reveal";
import { GITHUB_URL, STUDIO_URL } from "@/lib/links";
import { CAST } from "@/lib/mascots";

import { FinalCard } from "./FinalCard";

/** The send-off: one big card, a last call to action, and both mascots waiting at the bottom. */
export const FinalCta = () => (
  <section aria-labelledby="final-title" className="py-section">
    <Container>
      <Reveal pop>
        <FinalCard>
          <Pill>
            <PillMark />
            Phase 1 · open now
          </Pill>
          <h2
            id="final-title"
            className="max-w-final text-display leading-display font-bold tracking-display text-balance"
          >
            Your site is missing someone.
          </h2>
          <p className="mx-auto max-w-lede text-lede text-pretty text-muted">
            Open the studio, start from a sample or a blank canvas, and have a mascot on your page
            before your coffee cools.
          </p>
          <div className="z-2 flex flex-wrap justify-center gap-2.5">
            <Button href={STUDIO_URL}>Make a mascot</Button>
            <Button href={GITHUB_URL} variant="ghost">
              Read the code
            </Button>
          </div>
          <div className="absolute bottom-0 left-1/2 z-2 flex -translate-x-1/2 items-end gap-2.5">
            {CAST.map(doc => (
              <Mascot key={doc.id} doc={doc} scale={5} pettable />
            ))}
          </div>
        </FinalCard>
      </Reveal>
    </Container>
  </section>
);
