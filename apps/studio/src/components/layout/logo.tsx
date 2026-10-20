"use client";

import type { MascotDoc } from "@openmascot/embed";

import Link from "next/link";

import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { useMascotDoc } from "@/lib/mascot-store";

/** Wordmark with a mascot standing in for the logo. */
export const Logo = ({ doc }: { doc: MascotDoc }) => (
  <Link href="/" className="flex items-center gap-2.5 font-mono text-[15px] font-semibold">
    <span className="flex h-4 w-6 items-end justify-center">
      <MascotThumb doc={doc} width={24} />
    </span>
    OpenMascot
  </Link>
);

/** The logo wearing the mascot being edited. */
export const CurrentMascotLogo = () => <Logo doc={useMascotDoc()} />;
