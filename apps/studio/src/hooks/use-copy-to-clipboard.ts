import { useEffect, useState } from "react";

/** Copy text to the clipboard; `copied` stays true for `resetMs` afterwards. Resolves false on failure. */
export const useCopyToClipboard = (resetMs = 1500) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), resetMs);
    return () => clearTimeout(id);
  }, [copied, resetMs]);

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      return true;
    } catch {
      return false;
    }
  };

  return { copied, copy };
};
