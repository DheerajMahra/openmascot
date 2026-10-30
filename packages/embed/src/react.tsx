"use client";

/*
 * React entry: `import { Mascot, emit } from "openmascot/react"`. Importing it registers
 * <open-mascot>; <Mascot> renders one.
 */
import type { MascotElement } from "./element";
import type { MascotDoc, MascotPosition } from "./types";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { defineMascotElement } from "./element";

export { emit, play } from "./element";
export type { MascotElement, MascotTarget } from "./element";
export type { MascotDoc, MascotPosition } from "./types";

defineMascotElement();

/** What <Mascot> takes. Each prop matches the <open-mascot> property of the same name. */
export interface MascotProps extends DetailedHTMLProps<
  HTMLAttributes<MascotElement>,
  MascotElement
> {
  doc?: MascotDoc;
  src?: string;
  scale?: number;
  position?: MascotPosition;
  /** A handle for `emit(name, { to })` and `play(name, { to })`. */
  name?: string;
  triggers?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    "open-mascot": MascotElement;
  }
}

declare module "react" {
  // oxlint-disable-next-line typescript/no-namespace -- JSX lives in a namespace
  namespace JSX {
    interface IntrinsicElements {
      "open-mascot": MascotProps;
    }
  }
}

/**
 * `<open-mascot>` for React. React 19 skips non-string props on custom elements when it hydrates
 * server-rendered HTML, so `doc` and `triggers` go in through a ref callback, which runs on
 * hydration too. The rest render as attributes.
 *
 *   <Mascot doc={moss} name="inbox" scale={3} />
 */
export const Mascot = ({ doc, triggers, ref, ...props }: MascotProps) => (
  <open-mascot
    {...props}
    ref={(el: MascotElement | null) => {
      if (!el) return;
      // Triggers first: setting them after the doc would mount twice.
      el.triggers = triggers ?? true;
      el.doc = doc ?? null;
      if (typeof ref === "function") {
        const cleanup = ref(el);
        return () => {
          if (cleanup) cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = el;
      return () => {
        if (ref) ref.current = null;
      };
    }}
  />
);
