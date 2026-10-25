const TOGGLES = ["prefers-reduced-motion", 'aria-label="Moss mascot"'];

/** Two switches, both on: the manners the embed has by default. */
export const GoodGuestArt = () => (
  <ul className="flex flex-col items-center gap-2.5">
    {TOGGLES.map(text => (
      <li
        key={text}
        className="flex items-center gap-2.5 rounded-full border-2 border-ink bg-paper py-1.5 pr-3 pl-1.5 font-mono text-xs shadow-ink-sm"
      >
        <span
          aria-hidden
          className="relative h-5 w-8.5 rounded-full bg-leaf after:absolute after:top-0.75 after:left-4.25 after:size-3.5 after:rounded-full after:border-2 after:border-ink after:bg-paper"
        />
        {text}
        <span className="sr-only">: on</span>
      </li>
    ))}
  </ul>
);
