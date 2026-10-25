import type { ReactNode } from "react";

import { Card, CardArt, CardBody, CardText, CardTitle } from "@/components/ui/card/Card";
import { Reveal } from "@/components/ui/reveal/Reveal";

interface FeatureCardProps {
  tint: "clay" | "gold" | "lilac" | "moss" | "blue";
  title: string;
  /** Place in its row, for the staggered reveal. */
  order: 0 | 1 | 2;
  art: ReactNode;
  children: ReactNode;
}

/** One feature: an illustration in a tinted well, a title and a line of copy. */
export const FeatureCard = ({ tint, title, order, art, children }: FeatureCardProps) => (
  <Reveal pop order={order} className="flex">
    <Card className="w-full">
      <CardArt tint={tint}>{art}</CardArt>
      <CardBody>
        <CardTitle>{title}</CardTitle>
        <CardText>{children}</CardText>
      </CardBody>
    </Card>
  </Reveal>
);
