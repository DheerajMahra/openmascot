"use client";

import { DownloadOptions } from "@/features/share/components/download-options";
import { EmbedSnippet } from "@/features/share/components/embed-snippet";
import { MascotSummary } from "@/features/share/components/mascot-summary";
import { fileBase } from "@/features/share/lib/download";
import { useMascotDoc } from "@/lib/mascot-store";

/** Step 3: summary, downloads, and the embed snippet. */
export const ShareScreen = () => {
  const doc = useMascotDoc();
  const base = fileBase(doc.name);

  return (
    <section
      aria-label="Export and embed"
      className="mx-auto flex min-w-0 flex-[0_1_680px] flex-col gap-5.5 px-6 py-8"
    >
      <MascotSummary doc={doc} />
      <DownloadOptions base={base} />
      <EmbedSnippet base={base} />
    </section>
  );
};
