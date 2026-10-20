/** Circled "i" that shows its help text as a tooltip. */
export const InfoTip = ({ text, label }: { text: string; label: string }) => (
  <button
    type="button"
    aria-label={label}
    title={text}
    className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-stage-text bg-paper p-0 text-muted"
  >
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 11v6M12 7h.01" />
    </svg>
  </button>
);
