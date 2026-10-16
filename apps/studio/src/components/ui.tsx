import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Small uppercase monospace section label. */
export const Label = ({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={`flex h-7 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted ${className}`}
  >
    {children}
  </span>
);

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

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  dashed?: boolean;
};

export const Pill = ({ active, dashed, className = "", children, ...rest }: PillProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={[
      "cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[13px] transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      active
        ? "border-ink bg-ink text-white"
        : dashed
          ? "border-dashed border-stage-text bg-paper text-muted hover:border-clay"
          : "border-line bg-paper text-ink hover:border-clay",
      className
    ].join(" ")}
    {...rest}
  >
    {children}
  </button>
);

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "dashed";
};

export const Btn = ({ variant = "secondary", className = "", children, ...rest }: BtnProps) => (
  <button
    type="button"
    className={[
      "cursor-pointer rounded-md border px-3.5 py-2 text-[13px] transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      "disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" &&
        "border-ink bg-ink text-white hover:border-clay-deep hover:bg-clay-deep",
      variant === "secondary" && "border-line bg-paper text-ink hover:border-clay",
      variant === "dashed" &&
        "border-dashed border-stage-text bg-paper text-muted hover:border-clay",
      className
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </button>
);

type IconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  label: string;
  size?: "sm" | "md";
};

export const IconBtn = ({
  active,
  label,
  size = "md",
  className = "",
  children,
  ...rest
}: IconBtnProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={[
      "flex cursor-pointer items-center justify-center rounded-md border p-0 transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      "disabled:cursor-not-allowed disabled:text-stage-text",
      size === "md" ? "h-10 w-10" : "h-6 w-6",
      active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-clay",
      className
    ].join(" ")}
    {...rest}
  >
    {children}
  </button>
);

export const inputClass =
  "rounded-md border border-line bg-paper px-2.5 py-1.5 text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clay";

/** Dark stage the mascot sits on. */
export const Stage = ({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex items-end justify-center rounded-[10px] bg-stage p-6 ${className}`}>
    {children}
  </div>
);

/** "Mascot name" field that sits at the top of the left sidebar. Its heading row matches Label's height. */
export const NameField = ({
  value,
  onChange
}: {
  value: string;
  onChange: (name: string) => void;
}) => (
  <label htmlFor="mascot-name" className="flex flex-col">
    <Label>Mascot name</Label>
    <input
      id="mascot-name"
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </label>
);
