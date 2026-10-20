import { useEffect } from "react";

import { useMascot } from "@/lib/mascot-store";

const TYPING = ["INPUT", "TEXTAREA", "SELECT"];

/** ⌘Z / Ctrl+Z undoes, with Shift redoes, unless the user is typing in a field. */
export const useUndoShortcuts = () => {
  const { dispatch } = useMascot();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && TYPING.includes(target.tagName)) return;
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);
};
