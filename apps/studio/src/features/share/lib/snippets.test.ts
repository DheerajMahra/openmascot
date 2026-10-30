import { moss } from "@openmascot/samples";
import { describe, expect, it } from "vitest";

import {
  CDN_SCRIPT,
  firstCustomEvent,
  importName,
  installFor,
  snippetFor
} from "@/features/share/lib/snippets";

const withEvent = { ...moss, triggers: { ...moss.triggers, "custom:success": "hop" } };

describe("importName", () => {
  it("camel-cases a file base into an identifier", () => {
    expect(importName("moss")).toBe("moss");
    expect(importName("my-buddy-2")).toBe("myBuddy2");
  });

  it("falls back when the base can't start an identifier", () => {
    expect(importName("8-bit")).toBe("mascot");
  });
});

describe("firstCustomEvent", () => {
  it("finds the first Mascot.emit() event, or none", () => {
    expect(firstCustomEvent(withEvent)).toBe("success");
    expect(firstCustomEvent(moss)).toBeNull();
  });
});

describe("snippetFor", () => {
  it("imports the JSON and renders <Mascot> for React", () => {
    const code = snippetFor("react", "moss", withEvent);
    expect(code).toContain(`import { Mascot, emit } from "openmascot/react";`);
    expect(code).toContain(`import moss from "./moss.json";`);
    expect(code).toContain(`<Mascot doc={moss} position="bottom-right" />`);
    expect(code).toContain(`emit("success");`);
  });

  it("loads the script from the CDN and points the tag at the JSON for HTML", () => {
    const code = snippetFor("html", "moss", withEvent);
    expect(code).toContain(`<script src="${CDN_SCRIPT}" defer></script>`);
    expect(code).toContain(`<open-mascot src="/moss.json" position="bottom-right"></open-mascot>`);
    expect(code).toContain(`Mascot.emit("success");`);
  });

  it("leaves the emit lines out when the mascot answers no events", () => {
    for (const target of ["react", "html"] as const) {
      expect(snippetFor(target, "moss", moss)).not.toContain("emit");
    }
  });
});

describe("installFor", () => {
  it("installs the package for React only", () => {
    expect(installFor("react")).toBe("npm install openmascot");
    expect(installFor("html")).toBeNull();
  });
});
