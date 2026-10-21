import type { MascotDoc, MascotOptions, MascotPosition } from "./types";

/*
 * Script-tag entry. Bundled to dist/embed.js as an IIFE.
 *
 *   <script src="embed.js" defer></script>
 *   <div data-mascot="m_8f2k" data-src="mascot.json" data-position="bottom-right"></div>
 *
 * Without data-position the mascot renders inline where the div sits.
 * From page code: Mascot.play("celebrate") or Mascot.emit("success").
 */
import { MascotPlayer } from "./player";

declare global {
  interface Window {
    Mascot: MascotGlobal;
    /** Optional inline registry: window.MASCOTS = { m_8f2k: {...} } skips the fetch. */
    MASCOTS?: Record<string, MascotDoc>;
  }
}

interface MascotGlobal {
  mount: (el: HTMLElement, doc: MascotDoc, opts?: MascotOptions) => MascotPlayer;
  play: (name: string) => void;
  emit: (name: string) => void;
  scan: () => void;
  instances: MascotPlayer[];
}

const instances: MascotPlayer[] = [];

const mount = (el: HTMLElement, doc: MascotDoc, opts?: MascotOptions): MascotPlayer => {
  const player = new MascotPlayer(el, doc, opts);
  instances.push(player);
  return player;
};

const optionsFrom = (el: HTMLElement): MascotOptions => {
  const position = el.getAttribute("data-position") as MascotPosition | null;
  const scale = parseInt(el.getAttribute("data-scale") ?? "", 10);
  return { position: position || null, scale: Number.isFinite(scale) ? scale : undefined };
};

const scan = (): void => {
  const els = document.querySelectorAll<HTMLElement>("[data-mascot]");
  for (const el of Array.from(els)) {
    if (el.getAttribute("data-mounted")) continue;
    el.setAttribute("data-mounted", "1");
    const id = el.getAttribute("data-mascot") ?? "";
    const inline = window.MASCOTS?.[id];
    if (inline) {
      mount(el, inline, optionsFrom(el));
      continue;
    }
    const src = el.getAttribute("data-src") ?? `/m/${id}.json`;
    fetch(src)
      .then(r => r.json() as Promise<MascotDoc>)
      .then(doc => mount(el, doc, optionsFrom(el)))
      .catch((err: unknown) => console.warn("mascot: could not load", src, err));
  }
};

window.Mascot = {
  mount,
  instances,
  play: name => instances.forEach(m => m.play(name)),
  emit: name => instances.forEach(m => m.emit(name)),
  scan
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
else scan();
