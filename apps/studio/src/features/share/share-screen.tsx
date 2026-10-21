"use client";

import { TryMovesPreview } from "@/components/editor/try-moves-preview";
import { EditorColumns } from "@/components/layout/editor-shell";
import { DownloadOptions } from "@/features/share/components/download-options";
import { EmbedSnippet } from "@/features/share/components/embed-snippet";
import { MascotSummary } from "@/features/share/components/mascot-summary";
import { fileBase } from "@/features/share/lib/download";
import { useMascotDoc } from "@/lib/mascot-store";

/** Step 3: summary, downloads, and the embed snippet, with the live preview alongside. */
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
        </section>
      }
      preview={
        <TryMovesPreview
          hint="This is exactly what your site will show. Try each move before you download."
          emptyHint="No moves yet. Add some on Animate."
        />
      }
    />
  );
};
