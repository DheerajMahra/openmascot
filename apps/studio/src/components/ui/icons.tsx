import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props
});

export const PencilIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 20l4-1 11-11-3-3L5 16z" />
  </svg>
);

export const EraserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M7 20h13M4 15l9-9 6 6-6 6H8z" />
  </svg>
);

export const FillIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M5 12l7-7 7 7-7 7z M19 16c1 2 0 4-2 4" />
  </svg>
);

export const UndoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3" />
  </svg>
);

export const RedoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M15 14l5-5-5-5M20 9H9a5 5 0 000 10h3" />
  </svg>
);

export const DotsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
    <path d="M6 4l14 8-14 8z" />
  </svg>
);

export const PauseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ArrowUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const ChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ strokeWidth: 2.5, ...props })}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ strokeWidth: 2.5, ...props })}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ strokeWidth: 3, ...props })}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

/** Two columns of dots: a drag handle. */
export const GripIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
    <circle cx="9" cy="5" r="1.8" />
    <circle cx="15" cy="5" r="1.8" />
    <circle cx="9" cy="12" r="1.8" />
    <circle cx="15" cy="12" r="1.8" />
    <circle cx="9" cy="19" r="1.8" />
    <circle cx="15" cy="19" r="1.8" />
  </svg>
);
