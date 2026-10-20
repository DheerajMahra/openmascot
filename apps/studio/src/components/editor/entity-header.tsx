import type { HTMLAttributes, ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/lib/utils";

/**
 * Title row above the thing being edited: "POSE · default ✎ 🗑 … meta".
 *
 *   <EntityHeader>
 *     <EntityHeaderTitle kind="Pose" name={poseName} />
 *     <EntityHeaderActions>…</EntityHeaderActions>
 *     <EntityHeaderMeta>…</EntityHeaderMeta>
 *   </EntityHeader>
 */
export const EntityHeader = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex min-h-7 flex-wrap items-center gap-2.5", className)} {...rest} />
);

export const EntityHeaderTitle = ({ kind, name }: { kind: string; name: string }) => (
  <>
    <SectionLabel>{kind}</SectionLabel>
    <span aria-hidden="true" className="text-xs text-stage-text">
      ·
    </span>
    <span className="font-mono text-sm font-semibold">{name}</span>
  </>
);

export const EntityHeaderActions = ({ children }: { children: ReactNode }) => (
  <span className="ml-0.5 flex gap-1">{children}</span>
);

export const EntityHeaderMeta = ({ children }: { children: ReactNode }) => (
  <span className="ml-auto font-mono text-xs text-muted">{children}</span>
);

interface ActionProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const RenameAction = (props: ActionProps) => (
  <IconButton size="sm" variant="muted" {...props}>
    <PencilIcon width={13} height={13} />
  </IconButton>
);

export const DeleteAction = (props: ActionProps) => (
  <IconButton size="sm" variant="muted" {...props}>
    <TrashIcon width={13} height={13} />
  </IconButton>
);
