"use client";

import Link from "next/link";

import { MascotThumb } from "@/components/mascot-thumb";
import { useMascot } from "@/lib/mascot-store";

const LogoMark = () => {
  const { state } = useMascot();
  return <MascotThumb doc={state.doc} width={24} />;
};

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2.5 font-mono text-[15px] font-semibold">
    <span className="flex h-4 w-6 items-end justify-center">
      <LogoMark />
    </span>
    OpenMascot
  </Link>
);

/** Editor header: just the logo. Changes are saved automatically. */
export const AppHeader = () => (
  <header className="flex h-14 items-center gap-4 border-b border-line px-6">
    <Logo />
  </header>
);
