import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The site's own type, shadow and radius tokens. Without them tailwind-merge reads `text-caption`
// as a color and drops `text-white` next to it.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "tag",
        "label",
        "code",
        "caption",
        "button",
        "lede",
        "sub",
        "step",
        "display",
        "hero",
        "big",
        "watermark"
      ],
      shadow: [
        "hairline",
        "float",
        "lift",
        "card-hover",
        "stage",
        "code",
        "primary",
        "primary-hover",
        "ink-sm",
        "ink-md",
        "ink-lg",
        "live",
        "kbd"
      ],
      radius: ["card", "tile", "stage", "final"]
    }
  }
});

/** Join class names, letting later Tailwind classes win over conflicting earlier ones. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
