import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Join class names, letting later Tailwind classes win over conflicting earlier ones. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
