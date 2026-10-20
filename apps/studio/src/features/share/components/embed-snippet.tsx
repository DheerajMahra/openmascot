import { CodeBlock } from "@/components/ui/code-block";
import { SectionLabel } from "@/components/ui/section-label";

const snippetFor = (base: string) =>
  `<script src="embed.js" defer></script>\n<div data-mascot="${base}" data-src="/${base}.json" data-position="bottom-right"></div>`;

/** The two lines to paste into a page, with where the files go. */
export const EmbedSnippet = ({ base }: { base: string }) => (
  <div className="flex flex-col gap-2.5">
    <SectionLabel>Put it on a page</SectionLabel>
    <CodeBlock code={snippetFor(base)} label="Embed snippet" className="max-w-[640px]" />
    <span className="max-w-[640px] text-[13px] leading-relaxed text-muted">
      Put <span className="font-mono text-ink">{base}.json</span> and{" "}
      <span className="font-mono text-ink">embed.js</span> next to your page. Hosting comes in a
      later version.
    </span>
  </div>
);
