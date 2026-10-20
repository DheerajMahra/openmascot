"use client";

import { useRef } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

/** Dark code sample with a Copy button. If the clipboard is blocked, the code is selected instead. */
export const CodeBlock = ({
  code,
  label,
  className
}: {
  code: string;
  label: string;
  className?: string;
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  const onCopy = async () => {
    const ok = await copy(code);
    if (!ok && preRef.current) window.getSelection()?.selectAllChildren(preRef.current);
  };

  return (
    <div
      className={cn(
        "relative overflow-x-auto rounded-lg bg-ink px-4.5 py-4 font-mono text-[13px] leading-relaxed text-code-fg",
        className
      )}
    >
      <pre ref={preRef} aria-label={label} className="m-0 whitespace-pre">
        {code}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2.5 right-2.5 cursor-pointer rounded-md border border-muted bg-ink px-2.5 py-1 text-xs text-code-fg hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
};
