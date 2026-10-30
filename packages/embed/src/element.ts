import type { MascotDoc, MascotPosition } from "./types";

import { MascotPlayer } from "./player";

export const MASCOT_TAG = "open-mascot";

/** Which mascots a page-level call reaches. Without `to`, every mascot on the page. */
export interface MascotTarget {
  /** Matches the element's `name` attribute. */
  to?: string;
}

/** The styles the player writes on its host for a corner mascot. */
const CORNER_STYLES = ["position", "zIndex", "bottom", "left", "right"] as const;

// On the server there is no HTMLElement; the class still has to evaluate so imports don't throw.
const Base = (typeof HTMLElement === "undefined" ? Object : HTMLElement) as typeof HTMLElement;

/**
 * `<open-mascot>`: a mascot that mounts itself when it enters the page and cleans up when it
 * leaves. Give it a `doc` property (the JSON as an object) or a `src` attribute (a URL to it).
 *
 *   <open-mascot src="/moss.json" position="bottom-right" scale="5" name="guide"></open-mascot>
 */
export class MascotElement extends Base {
  static observedAttributes = ["src", "scale", "position", "triggers"];

  private mounted: MascotPlayer | null = null;
  private docValue: MascotDoc | null = null;
  private fetched: { src: string; doc: MascotDoc } | null = null;
  /** Bumped on every unmount so a fetch that lands late is dropped. */
  private loads = 0;
  /** Between connect and disconnect. Attribute callbacks during an upgrade come before it. */
  private live = false;

  /** The live player, or null while loading or off the page. */
  get player(): MascotPlayer | null {
    return this.mounted;
  }

  /** The mascot JSON as an object. Takes precedence over `src`. */
  get doc(): MascotDoc | null {
    return this.docValue;
  }

  set doc(doc: MascotDoc | null) {
    if (doc === this.docValue) return;
    this.docValue = doc;
    this.remount();
  }

  get src(): string | null {
    return this.getAttribute("src");
  }

  set src(src: string | null) {
    this.reflect("src", src);
  }

  /** Screen pixels per mascot cell. Default 4. */
  get scale(): number {
    const scale = parseInt(this.getAttribute("scale") ?? "", 10);
    return Number.isFinite(scale) && scale > 0 ? scale : 4;
  }

  set scale(scale: number) {
    this.setAttribute("scale", String(scale));
  }

  /** Fixed corner placement. Unset renders inline where the element sits. */
  get position(): MascotPosition | null {
    const position = this.getAttribute("position");
    return position === "bottom-left" || position === "bottom-right" ? position : null;
  }

  set position(position: MascotPosition | null) {
    this.reflect("position", position);
  }

  /** Wire the doc's triggers (load, click, hover, intervals). `triggers="off"` turns them off. */
  get triggers(): boolean {
    return this.getAttribute("triggers") !== "off";
  }

  set triggers(on: boolean) {
    this.reflect("triggers", on ? null : "off");
  }

  connectedCallback(): void {
    // A doc assigned before the element was defined is an own property hiding the setter.
    if (Object.prototype.hasOwnProperty.call(this, "doc")) {
      const doc = this.doc;
      delete (this as { doc?: MascotDoc | null }).doc;
      this.docValue = doc;
    }
    this.live = true;
    this.remount();
  }

  disconnectedCallback(): void {
    this.live = false;
    this.unmount();
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (old === value || !this.live) return;
    if (name === "scale" && this.mounted) this.mounted.setScale(this.scale);
    else if (name !== "src" || !this.docValue) this.remount();
  }

  /** Play a move by name. False if it doesn't exist or the mascot hasn't loaded. */
  play(name: string): boolean {
    return this.mounted?.play(name) ?? false;
  }

  /** Fire the doc's `custom:<name>` trigger. */
  emit(name: string): boolean {
    return this.mounted?.emit(name) ?? false;
  }

  pause(): void {
    this.mounted?.pause();
  }

  resume(): void {
    this.mounted?.resume();
  }

  private remount(): void {
    this.unmount();
    if (!this.isConnected) return;
    if (this.docValue) return this.start(this.docValue);

    const src = this.src;
    if (!src) return;
    if (this.fetched?.src === src) return this.start(this.fetched.doc);

    const load = this.loads;
    fetch(src)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MascotDoc>;
      })
      .then(doc => {
        this.fetched = { src, doc };
        if (load === this.loads) this.start(doc);
      })
      .catch((err: unknown) => console.warn("mascot: could not load", src, err));
  }

  private start(doc: MascotDoc): void {
    this.mounted = new MascotPlayer(this, doc, {
      scale: this.scale,
      position: this.position,
      triggers: this.triggers
    });
  }

  private unmount(): void {
    this.loads++;
    if (!this.mounted) return;
    this.mounted.destroy();
    this.mounted = null;
    for (const prop of CORNER_STYLES) this.style[prop] = "";
  }

  private reflect(name: string, value: string | null): void {
    if (value === null) this.removeAttribute(name);
    else this.setAttribute(name, value);
  }
}

/** Register `<open-mascot>`. Safe to call more than once, and a no-op on the server. */
export const defineMascotElement = (): void => {
  if (typeof customElements === "undefined" || customElements.get(MASCOT_TAG)) return;
  customElements.define(MASCOT_TAG, MascotElement);
  // :where() keeps this at zero specificity, so any page style wins.
  const style = document.createElement("style");
  style.textContent = `:where(${MASCOT_TAG}){display:inline-block;line-height:0}`;
  document.head.append(style);
};

const mascots = (to?: string): MascotElement[] => {
  if (typeof document === "undefined") return [];
  const all = Array.from(document.querySelectorAll<MascotElement>(MASCOT_TAG));
  return to === undefined ? all : all.filter(el => el.getAttribute("name") === to);
};

/** Fire `custom:<name>` on every mascot on the page, or on the ones named `to`. */
export const emit = (name: string, target: MascotTarget = {}): boolean =>
  mascots(target.to)
    .map(el => el.emit?.(name) ?? false)
    .some(Boolean);

/** Play a move on every mascot on the page, or on the ones named `to`. */
export const play = (name: string, target: MascotTarget = {}): boolean =>
  mascots(target.to)
    .map(el => el.play?.(name) ?? false)
    .some(Boolean);
