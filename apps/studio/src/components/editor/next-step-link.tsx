"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { STEPS, stepIndex } from "@/lib/steps";

/** "Next: Animate →", pinned to the foot of the preview panel by EditorPreviewPanel. Renders nothing on the last step. */
export const NextStepLink = () => {
  const next = STEPS[stepIndex(usePathname()) + 1];
  if (!next) return null;
  return (
    <Button asChild variant="primary" size="lg" className="block text-center">
      <Link href={next.href}>Next: {next.label} →</Link>
    </Button>
  );
};
