"use client";

import { InfoIcon } from "lucide-react";
import { useId } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Circled "i" that shows its help text in a tooltip on hover or keyboard focus.
 * The tooltip is visual only, so the text is also wired up as the button's description.
 */
export const InfoTip = ({ text, label }: { text: string; label: string }) => {
  const descriptionId = useId();
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        aria-describedby={descriptionId}
        className="flex size-4 cursor-help items-center justify-center rounded-full border border-stage-text bg-paper p-0 text-muted transition-colors hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clay"
      >
        {/* The ring is the button's own border, so it matches the board buttons; hide the icon's. */}
        <InfoIcon size={14} strokeWidth={2.5} aria-hidden="true" className="[&_circle]:hidden" />
        <span id={descriptionId} className="sr-only">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
};
