import type { MascotTarget } from "./element";

/*
 * Script-tag entry. Bundled to dist/embed.js as an IIFE.
 *
 *   <script src="embed.js" defer></script>
 *   <open-mascot src="mascot.json" position="bottom-right"></open-mascot>
 *
 * Without position the mascot renders inline where the tag sits. From page code:
 * Mascot.emit("success"), or Mascot.play("wave", { to: "guide" }) for the one named "guide".
 */
import { defineMascotElement, emit, play } from "./element";

declare global {
  interface Window {
    Mascot: MascotGlobal;
  }
}

interface MascotGlobal {
  emit: (name: string, target?: MascotTarget) => boolean;
  play: (name: string, target?: MascotTarget) => boolean;
}

window.Mascot = { emit, play };
defineMascotElement();
