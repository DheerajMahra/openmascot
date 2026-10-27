import { Container } from "@/components/ui/container/Container";
import { Kbd } from "@/components/ui/kbd/Kbd";
import { SectionHeading } from "@/components/ui/section-heading/SectionHeading";

import { EditorBoardArt } from "./art/EditorBoardArt";
import { ExportsArt } from "./art/ExportsArt";
import { GoodGuestArt } from "./art/GoodGuestArt";
import { PosesArt } from "./art/PosesArt";
import { SizeArt } from "./art/SizeArt";
import { TriggersArt } from "./art/TriggersArt";
import { FeatureCard } from "./FeatureCard";

export const Features = () => (
  <section id="features" aria-labelledby="features-title" className="py-section">
    <Container>
      <SectionHeading
        id="features-title"
        label="Features"
        title="Everything a small friend needs."
        lede="Triggers, poses, exports, a tiny player. Nothing you have to host, nothing that phones home."
      />
      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-3">
        <FeatureCard tint="moss" order={0} title="A simple editor" art={<EditorBoardArt />}>
          Pencil, mirror pencil, eraser and fill. Drag for a run of cells, and undo is <Kbd>⌘Z</Kbd>{" "}
          away.
        </FeatureCard>
        <FeatureCard tint="gold" order={1} title="Triggers, not timelines" art={<TriggersArt />}>
          Page load, click, hover, every few seconds, or Mascot.emit() from your code. Each move
          plays once, then rests on default.
        </FeatureCard>
        <FeatureCard tint="lilac" order={2} title="A handful of poses" art={<PosesArt />}>
          Each pose is one drawing. Start from default and change only what differs: the eyes, the
          arms, the mouth.
        </FeatureCard>
        <FeatureCard tint="blue" order={0} title="Takes any shape" art={<ExportsArt />}>
          JSON for the embed script, a GIF of a move for READMEs and chat, a PNG of a pose. No
          account.
        </FeatureCard>
        <FeatureCard tint="mint" order={1} title="A tiny player" art={<SizeArt />}>
          3.9 KB gzipped, one canvas per mascot, no dependencies. Several on a page stay fast.
        </FeatureCard>
        <FeatureCard tint="rose" order={2} title="A good guest" art={<GoodGuestArt />}>
          Respects reduced motion, carries an accessible name, and the mascot file is plain data,
          never code.
        </FeatureCard>
      </div>
    </Container>
  </section>
);
