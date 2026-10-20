"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

import { createContext, use, useId, useRef, useState } from "react";

import { Slot } from "@/components/ui/slot";
import { useDismiss } from "@/hooks/use-dismiss";
import { cn } from "@/lib/utils";

interface MenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
}

const MenuContext = createContext<MenuState | null>(null);

const useMenu = (): MenuState => {
  const ctx = use(MenuContext);
  if (!ctx) throw new Error("DropdownMenu parts must be rendered inside <DropdownMenu>.");
  return ctx;
};

/** Owns the open state; closes on an outside press or Escape. */
export const DropdownMenu = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  useDismiss(rootRef, open, () => setOpen(false));

  return (
    <MenuContext value={{ open, setOpen, contentId }}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </MenuContext>
  );
};

/** Wraps the element that toggles the menu, usually an IconButton. */
export const DropdownMenuTrigger = ({ children }: { children: ReactNode }) => {
  const { open, setOpen, contentId } = useMenu();
  return (
    <Slot
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={open ? contentId : undefined}
      onClick={() => setOpen(!open)}
    >
      {children}
    </Slot>
  );
};

export const DropdownMenuContent = ({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => {
  const { open, contentId } = useMenu();
  if (!open) return null;
  return (
    <div
      id={contentId}
      role="menu"
      aria-label={label}
      className={cn(
        "absolute z-10 flex w-52 flex-col rounded-lg border border-line bg-paper p-1.5 text-[13px] shadow-[0_6px_20px_rgba(29,26,23,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
};

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left whitespace-nowrap hover:bg-paper-2";

type ItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> & {
  /** Runs on click, then the menu closes. */
  onSelect: () => void;
  destructive?: boolean;
};

export const DropdownMenuItem = ({ onSelect, destructive, className, ...rest }: ItemProps) => {
  const { setOpen } = useMenu();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect();
        setOpen(false);
      }}
      className={cn(
        itemClass,
        "border-0 bg-transparent text-[13px] disabled:cursor-not-allowed disabled:text-stage-text",
        destructive ? "text-clay-deep" : "text-ink",
        className
      )}
      {...rest}
    />
  );
};

type CheckboxItemProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
};

/** A toggle that stays open on change, so several options can be flipped in a row. */
export const DropdownMenuCheckboxItem = ({
  checked,
  onCheckedChange,
  children,
  className,
  ...rest
}: CheckboxItemProps) => (
  <label className={cn(itemClass, className)}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
      {...rest}
    />
    {children}
  </label>
);

export const DropdownMenuSeparator = () => (
  <span aria-hidden="true" className="mx-1.5 my-1 h-px bg-line-2" />
);
