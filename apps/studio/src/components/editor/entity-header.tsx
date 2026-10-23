import type { FormEvent, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from "react";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
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
  ref?: Ref<HTMLButtonElement>;
  disabled?: boolean;
  onClick: () => void;
}

export const RenameAction = (props: ActionProps) => (
  // The pencil and trash explain themselves; only a disabled one needs to say why.
  <IconButton size="sm" variant="muted" tooltip={props.disabled ? "top" : undefined} {...props}>
    <PencilIcon size={13} />
  </IconButton>
);

interface DeleteActionProps {
  label: string;
  disabled?: boolean;
  /** Asked before anything is deleted: what goes, and what happens to things that used it. */
  confirm: { title: string; description: string };
  onDelete: () => void;
}

/** Trash button that asks in an alert dialog before deleting. */
export const DeleteAction = ({ label, disabled, confirm, onDelete }: DeleteActionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        size="sm"
        variant="muted"
        tooltip={disabled ? "top" : undefined}
        label={label}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="enabled:hover:border-danger enabled:hover:text-danger"
      >
        <Trash2Icon size={13} />
      </IconButton>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface RenameFormProps {
  kind: string;
  name: string;
  /** Returns why the draft can't be saved, or null when it can. */
  validate: (draft: string) => string | null;
  onSave: (draft: string) => void;
  onCancel: () => void;
}

/** Takes the title's place while renaming: the name in a text box with Save on its right. Esc cancels. */
export const EntityHeaderRenameForm = ({
  kind,
  name,
  validate,
  onSave,
  onCancel
}: RenameFormProps) => {
  const [draft, setDraft] = useState(name);
  const errorId = useId();
  const input = useRef<HTMLInputElement>(null);

  // The user asked to rename, so take them straight to the name, selected and ready to type over.
  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);
  const error = draft === name ? null : validate(draft);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft === name) onCancel();
    else if (!error) onSave(draft);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2.5">
      <SectionLabel>{kind}</SectionLabel>
      <span aria-hidden="true" className="text-xs text-stage-text">
        ·
      </span>
      <Input
        type="text"
        name="name"
        autoComplete="off"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        ref={input}
        aria-label={`${kind} name`}
        aria-invalid={error !== null}
        aria-describedby={error ? errorId : undefined}
        className="h-7 w-48 py-0 font-mono"
      />
      <Button type="submit" variant="primary" className="h-7 py-0" disabled={error !== null}>
        Save
      </Button>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-warning">
          {error}
        </span>
      )}
    </form>
  );
};
