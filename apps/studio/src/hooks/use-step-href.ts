import type { Step } from "@/lib/steps";

import { useMascotSelector } from "@/lib/mascot-store";
import { stepHref } from "@/lib/steps";

/** Builds step links for the open mascot. */
export const useStepHref = (): ((step: Step) => string) => {
  const id = useMascotSelector(s => s.doc.id);
  const from = useMascotSelector(s => s.from);
  return step => stepHref(step, id, from);
};
