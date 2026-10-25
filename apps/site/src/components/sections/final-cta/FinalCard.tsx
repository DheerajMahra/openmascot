"use client";

import type { ReactNode } from "react";

import { useRef } from "react";

import { FloatingPills } from "./FloatingPills";
import { PixelClouds } from "./PixelClouds";

/** The send-off card itself: a gridded sky whose specks and stickers move as it scrolls by. */
export const FinalCard = ({ children }: { children: ReactNode }) => {
  const card = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={card}
      className="relative isolate flex flex-col items-center gap-5.5 overflow-hidden rounded-final border border-hairline bg-sky sky-lines px-gutter pt-final-top pb-52.5 text-center shadow-stage xl:pb-final-bottom"
    >
      <PixelClouds cardRef={card} />
      {children}
      <FloatingPills cardRef={card} />
    </div>
  );
};
