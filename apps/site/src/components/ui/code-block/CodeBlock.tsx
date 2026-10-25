import { cn } from "@/lib/utils";

export type CodeTokenKind = "tag" | "attr" | "value" | "punct";

export interface CodeToken {
  kind: CodeTokenKind;
  text: string;
}

const KIND_CLASS: Record<CodeTokenKind, string> = {
  tag: "text-clay",
  attr: "text-leaf",
  value: "text-gold",
  punct: "text-code-punct"
};

interface CodeBlockProps {
  lines: CodeToken[][];
  /** Show only the first this-many characters, for a snippet that types itself. Default: all. */
  shown?: number;
  /** A blinking block caret after the last shown character. */
  caret?: boolean;
  className?: string;
}

/** Cut the lines down to the first `shown` characters, keeping each token's color. */
const visibleLines = (lines: CodeToken[][], shown: number): CodeToken[][] => {
  let left = shown;
  const out: CodeToken[][] = [];
  for (const line of lines) {
    if (left <= 0) break;
    const kept: CodeToken[] = [];
    for (const token of line) {
      if (left <= 0) break;
      kept.push({ kind: token.kind, text: token.text.slice(0, left) });
      left -= token.text.length;
    }
    out.push(kept);
  }
  return out;
};

export const codeLength = (lines: CodeToken[][]): number =>
  lines.reduce((n, line) => n + line.reduce((m, t) => m + t.text.length, 0), 0);

/** A dark snippet with syntax colors. */
export const CodeBlock = ({ lines, shown, caret, className }: CodeBlockProps) => (
  <pre
    className={cn(
      "m-0 w-full max-w-full min-w-0 overflow-hidden rounded-xl bg-stage font-mono whitespace-pre-wrap text-code-fg shadow-code wrap-anywhere",
      className
    )}
  >
    {visibleLines(lines, shown ?? codeLength(lines)).map((line, i) => (
      <span key={i}>
        {i > 0 && "\n"}
        {line.map((token, j) => (
          <span key={j} className={KIND_CLASS[token.kind]}>
            {token.text}
          </span>
        ))}
      </span>
    ))}
    {caret && (
      <span
        aria-hidden
        className="inline-block h-3.5 w-1.75 animate-blink bg-code-fg align-text-bottom motion-reduce:animate-none"
      />
    )}
  </pre>
);
