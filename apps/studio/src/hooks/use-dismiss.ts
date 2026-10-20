import type { RefObject } from "react";

import { useEffect } from "react";

/** While `active`, call `onDismiss` on a pointer press outside `ref` or on Escape. */
export const useDismiss = (
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void
) => {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, active, onDismiss]);
};
