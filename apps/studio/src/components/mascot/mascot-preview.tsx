"use client";

import type { MascotDoc, MascotPlayer as MascotPlayerType } from "@openmascot/embed";
import type { RefObject } from "react";

import { MascotPlayer } from "@openmascot/embed";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** Document to play. Later changes are pushed to the running player. */
  doc: MascotDoc;
  scale?: number;
  /** Wire click, hover and interval triggers from the doc. */
  triggers?: boolean;
  /** Receives the live player so a parent can call play() or showFrame(). */
  playerRef?: RefObject<MascotPlayerType | null>;
  className?: string;
}

/** Mounts the real embed runtime so the studio previews exactly what a site will show. */
export const MascotPreview = ({ doc, scale = 8, triggers = true, playerRef, className }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<MascotPlayerType | null>(null);
  // The doc at mount time. The second effect keeps the player current after that.
  const [initialDoc] = useState(doc);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const player = new MascotPlayer(el, initialDoc, { scale, triggers, reducedMotion: false });
    localRef.current = player;
    if (playerRef) playerRef.current = player;
    return () => {
      player.destroy();
      localRef.current = null;
      if (playerRef) playerRef.current = null;
    };
  }, [initialDoc, scale, triggers, playerRef]);

  useEffect(() => {
    localRef.current?.setDoc(doc);
  }, [doc]);

  return <div ref={hostRef} className={className} />;
};
