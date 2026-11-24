"use client";

import type { MascotDoc, MascotPlayer as MascotPlayerType } from "openmascot";
import type { RefObject } from "react";

import { MascotPlayer } from "openmascot";
import { useEffect, useRef } from "react";

interface Props {
  /** Document to play. Later changes, triggers included, are pushed to the running player. */
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
  // The latest doc. Edits reach the running player through setDoc (second effect); a player
  // rebuilt for a new scale or trigger setting starts from this, not from the doc it first had.
  const latestDoc = useRef(doc);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const player = new MascotPlayer(el, latestDoc.current, {
      scale,
      triggers,
      reducedMotion: false
    });
    localRef.current = player;
    if (playerRef) playerRef.current = player;
    return () => {
      player.destroy();
      localRef.current = null;
      if (playerRef) playerRef.current = null;
    };
  }, [scale, triggers, playerRef]);

  useEffect(() => {
    latestDoc.current = doc;
    localRef.current?.setDoc(doc);
  }, [doc]);

  return <div ref={hostRef} className={className} />;
};
