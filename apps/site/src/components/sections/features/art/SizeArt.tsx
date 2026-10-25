import { cn } from "@/lib/utils";

const CELLS = 12;
const FILLED = 8;

/** The embed's weight, with a pixel gauge two thirds full. */
export const SizeArt = () => (
  <div>
    <p className="text-big leading-none font-extrabold tracking-hero text-ink">
      3.9<small className="ml-1 text-[0.4em] font-bold text-muted">KB</small>
    </p>
    <div aria-hidden className="mt-3.5 flex gap-1">
      {Array.from({ length: CELLS }, (_, i) => (
        <i
          key={i}
          className={cn(
            "block h-4.5 w-3.5 border-2 border-ink",
            i < FILLED ? "bg-leaf" : "bg-paper"
          )}
        />
      ))}
    </div>
  </div>
);
