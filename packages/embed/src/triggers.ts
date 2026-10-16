export type ParsedTrigger =
  | { type: "idle" | "load" | "click" | "hover" }
  | { type: "interval"; seconds: number }
  | { type: "custom"; name: string };

/** The one place trigger keys ("click", "interval:30", "custom:win") are decoded. */
export const parseTrigger = (key: string): ParsedTrigger | null => {
  if (key === "idle" || key === "load" || key === "click" || key === "hover") return { type: key };
  if (key.startsWith("interval:"))
    return { type: "interval", seconds: parseFloat(key.slice(9)) || 5 };
  if (key.startsWith("custom:")) return { type: "custom", name: key.slice(7) };
  return null;
};

/** What a trigger needs from the player. */
export interface TriggerHost {
  el: HTMLElement;
  play(name: string): boolean;
  isBusy(): boolean;
}

/** An event source that starts one sequence. Owns its listeners and cleans them up. */
export abstract class Trigger {
  constructor(
    protected readonly host: TriggerHost,
    protected readonly sequence: string
  ) {}

  abstract attach(): void;
  abstract detach(): void;
}

class ClickTrigger extends Trigger {
  private onClick = () => void this.host.play(this.sequence);

  attach(): void {
    this.host.el.addEventListener("click", this.onClick);
    this.host.el.style.cursor = "pointer";
  }

  detach(): void {
    this.host.el.removeEventListener("click", this.onClick);
    this.host.el.style.cursor = "";
  }
}

/** Hover does not interrupt a move that is already playing. */
class HoverTrigger extends Trigger {
  private onEnter = () => {
    if (!this.host.isBusy()) this.host.play(this.sequence);
  };

  attach(): void {
    this.host.el.addEventListener("mouseenter", this.onEnter);
  }

  detach(): void {
    this.host.el.removeEventListener("mouseenter", this.onEnter);
  }
}

class IntervalTrigger extends Trigger {
  private id: ReturnType<typeof setInterval> | null = null;

  constructor(
    host: TriggerHost,
    sequence: string,
    private readonly seconds: number
  ) {
    super(host, sequence);
  }

  attach(): void {
    this.id = setInterval(() => {
      if (!this.host.isBusy()) this.host.play(this.sequence);
    }, this.seconds * 1000);
  }

  detach(): void {
    if (this.id !== null) clearInterval(this.id);
    this.id = null;
  }
}

/** Builds triggers from a doc's trigger map. `idle`, `load` and `custom:*` are handled by the player. */
export class TriggerManager {
  private triggers: Trigger[] = [];

  constructor(
    private readonly host: TriggerHost,
    map: Record<string, string>
  ) {
    for (const [key, sequence] of Object.entries(map)) {
      const parsed = parseTrigger(key);
      if (parsed?.type === "click") this.triggers.push(new ClickTrigger(host, sequence));
      else if (parsed?.type === "hover") this.triggers.push(new HoverTrigger(host, sequence));
      else if (parsed?.type === "interval") {
        this.triggers.push(new IntervalTrigger(host, sequence, parsed.seconds));
      }
    }
  }

  attach(): void {
    this.host.el.style.cursor = "";
    for (const t of this.triggers) t.attach();
  }

  detach(): void {
    for (const t of this.triggers) t.detach();
  }
}
