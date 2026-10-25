"use client";

import type { LivePreviewProps } from "@/components/editor/live-preview";

import { LivePreview } from "@/components/editor/live-preview";
import { EditorPreviewPanel } from "@/components/layout/editor-shell";

/** Right column of Make and Animate: the live preview, with Next pinned to its foot. */
export const LivePreviewPanel = (props: LivePreviewProps) => (
  <EditorPreviewPanel aria-label="Live preview">
    <LivePreview {...props} />
  </EditorPreviewPanel>
);
