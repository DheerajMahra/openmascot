"use client";

import { LivePreview } from "@/components/editor/live-preview";
import { EditorColumns } from "@/components/layout/editor-shell";
import { Separator } from "@/components/ui/separator";
import { DownloadOptions } from "@/features/share/components/download-options";
import { EmbedSnippet } from "@/features/share/components/embed-snippet";
import { MascotSummary } from "@/features/share/components/mascot-summary";
import { fileBase } from "@/features/share/lib/download";
import { useMascotDoc } from "@/lib/mascot-store";

/** Step 3: one centred page with the summary, downloads, the embed snippet, and the mascot running live. */
export const ShareScreen = () => {
  const doc = useMascotDoc();
  const base = fileBase(doc.name);

  return (
    <EditorColumns
      workspace={
        <section
          aria-label="Export and embed"
          className="mx-auto flex w-full max-w-[680px] min-w-0 flex-col gap-5.5 px-6 py-8"
        >
          <MascotSummary doc={doc} />
          <DownloadOptions base={base} />
          <EmbedSnippet base={base} />
          <Separator className="my-4" />
          <section aria-label="Live preview">
            <LivePreview mode="live" />
          </section>
        </section>
      }
    />
  );
};
