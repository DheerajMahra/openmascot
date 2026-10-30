"use client";

import type { EmbedTarget } from "@/features/share/lib/snippets";
import type { MascotDoc } from "openmascot";
import type { ReactNode } from "react";

import { useState } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { Pill } from "@/components/ui/pill";
import { SectionLabel } from "@/components/ui/section-label";
import { EMBED_TARGETS, installFor, snippetFor } from "@/features/share/lib/snippets";

const File = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-ink">{children}</span>
);

/** Where the mascot file goes for each target. */
const Note = ({ target, base }: { target: EmbedTarget; base: string }) =>
  target === "react" ? (
    <>
      Put <File>{base}.json</File> next to your component.
    </>
  ) : (
    <>
      Put <File>{base}.json</File> next to your page. The script loads from jsDelivr.
    </>
  );

/** One pill per kind of site: what to install, the code to paste, and where the file goes. */
export const EmbedSnippet = ({ base, doc }: { base: string; doc: MascotDoc }) => {
  const [target, setTarget] = useState<EmbedTarget>("react");
  const label = EMBED_TARGETS.find(t => t.id === target)?.label;
  const install = installFor(target);

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Put it on a page</SectionLabel>
      <div className="flex flex-wrap items-center gap-2">
        {EMBED_TARGETS.map(t => (
          <Pill key={t.id} active={t.id === target} onClick={() => setTarget(t.id)}>
            {t.label}
          </Pill>
        ))}
      </div>
      {install && <CodeBlock code={install} label="Install command" className="max-w-[640px]" />}
      <CodeBlock
        code={snippetFor(target, base, doc)}
        label={`${label} embed snippet`}
        className="max-w-[640px]"
      />
      <span className="max-w-[640px] text-[13px] leading-relaxed text-muted">
        <Note target={target} base={base} />
      </span>
    </div>
  );
};
