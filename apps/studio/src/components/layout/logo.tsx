"use client";

import Link from "next/link";

import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { useMascot } from "@/lib/mascot-store";

/** Wordmark with the current mascot standing in for the logo. */
export const Logo = () => {
  const { state } = useMascot();
  return (
    <Link href="/" className="flex items-center gap-2.5 font-mono text-[15px] font-semibold">
      <span className="flex h-4 w-6 items-end justify-center">
        <MascotThumb doc={state.doc} width={24} />
      </span>
      OpenMascot
    </Link>
  );
};
