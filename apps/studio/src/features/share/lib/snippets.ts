import type { MascotDoc } from "openmascot";

import { parseTrigger } from "openmascot";

/** The ways to put a mascot on a page, in the order the share step offers them. */
export const EMBED_TARGETS = [
  { id: "react", label: "React" },
  { id: "html", label: "Vanilla" }
] as const;

export type EmbedTarget = (typeof EMBED_TARGETS)[number]["id"];

/** A file base ("my-buddy") as a JS identifier ("myBuddy") for the JSON import. */
export const importName = (base: string): string => {
  const name = base.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return /^[a-z]/.test(name) ? name : "mascot";
};

/** The first Mascot.emit() event the mascot answers, to show how page code fires it. */
export const firstCustomEvent = (doc: MascotDoc): string | null => {
  for (const key of Object.keys(doc.triggers ?? {})) {
    const parsed = parseTrigger(key);
    if (parsed?.type === "custom") return parsed.name;
  }
  return null;
};

/** The npm package, and the CDN copy of its script-tag build for HTML pages. */
export const PACKAGE = "openmascot";
export const CDN_SCRIPT = `https://cdn.jsdelivr.net/npm/${PACKAGE}@0`;

const react = (base: string, event: string | null): string => {
  const doc = importName(base);
  const lines = [
    `import { ${event ? "Mascot, emit" : "Mascot"} } from "${PACKAGE}/react";`,
    `import ${doc} from "./${base}.json";`,
    "",
    `<Mascot doc={${doc}} position="bottom-right" />`
  ];
  if (event) lines.push("", `// From your code, e.g. after a save:`, `emit("${event}");`);
  return lines.join("\n");
};

const html = (base: string, event: string | null): string => {
  const lines = [
    `<script src="${CDN_SCRIPT}" defer></script>`,
    `<open-mascot src="/${base}.json" position="bottom-right"></open-mascot>`
  ];
  if (event) {
    lines.push("", `<!-- From your code: -->`, `<script>Mascot.emit("${event}");</script>`);
  }
  return lines.join("\n");
};

/** The install command for a target, or null when there's nothing to install. */
export const installFor = (target: EmbedTarget): string | null =>
  target === "react" ? `npm install ${PACKAGE}` : null;

/** The code to paste for one target. */
export const snippetFor = (target: EmbedTarget, base: string, doc: MascotDoc): string => {
  const event = firstCustomEvent(doc);
  return target === "react" ? react(base, event) : html(base, event);
};
