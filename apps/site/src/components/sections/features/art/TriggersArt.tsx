import { Mascot } from "@/components/mascot/mascot/Mascot";
import { Chip } from "@/components/ui/chip/Chip";
import { MOSS } from "@/lib/mascots";
import { cn } from "@/lib/utils";

const TAGS = [
  { text: "hover", className: "top-5.5 left-3/25 -rotate-6" },
  { text: "click", className: "top-14 right-9/100 rotate-4" },
  { text: "every 6 s", className: "bottom-19 left-3/100 rotate-3" },
  { text: 'emit("success")', className: "right-7/50 bottom-5 -rotate-4" }
];

/** Moss among the events that can set it off. Hover or click Moss to see one. */
export const TriggersArt = () => (
  <div className="relative grid size-full place-items-center">
    {TAGS.map(tag => (
      <Chip key={tag.text} className={cn("absolute text-xs", tag.className)}>
        {tag.text}
      </Chip>
    ))}
    <Mascot doc={MOSS} scale={6} pettable />
  </div>
);
