"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useStepHref } from "@/hooks/use-step-href";
import { STEPS, stepIndex } from "@/lib/steps";

/** "Next: Animate →", pinned to the foot of the preview panel by EditorPreviewPanel. Renders nothing on the last step. */
export const NextStepLink = () => {
  const next = STEPS[stepIndex(usePathname()) + 1];
  const hrefFor = useStepHref();
  if (!next) return null;
  return (
    <Button
      asChild
      variant="primary"
      size="lg"
      className="flex items-center justify-center gap-1.5"
    >
      <Link href={hrefFor(next)}>
        Next: {next.label} <ArrowRightIcon size={16} />
      </Link>
    </Button>
  );
};
