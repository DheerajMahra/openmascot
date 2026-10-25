import { Container } from "@/components/ui/container/Container";
import { SectionHeading } from "@/components/ui/section-heading/SectionHeading";

import { StoryStage } from "./StoryStage";

/** How it works: Make, Animate, Share, told with a scene per step. */
export const Story = () => (
  <section id="how" aria-labelledby="how-title" className="py-section">
    <Container>
      <SectionHeading
        id="how-title"
        label="How it works"
        title="Make. Animate. Share."
        lede="Three steps in the studio, all in your browser: draw your character, give it moves, and take it with you."
      />
      <StoryStage />
    </Container>
  </section>
);
