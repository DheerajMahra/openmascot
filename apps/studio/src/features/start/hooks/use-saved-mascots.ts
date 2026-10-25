"use client";

import type { SavedMascot } from "@/lib/mascot-repository";

import { useEffect, useState } from "react";

import { mascotRepository } from "@/lib/local-mascot-repository";
import { useMascotDispatch } from "@/lib/mascot-store";

/** This browser's saved mascots, newest first (null until read), and a way to delete one. */
export const useSavedMascots = () => {
  const [mascots, setMascots] = useState<SavedMascot[] | null>(null);
  const dispatch = useMascotDispatch();

  useEffect(() => {
    let cancelled = false;
    void mascotRepository.list().then(list => {
      if (!cancelled) setMascots(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (id: string) => {
    await mascotRepository.remove(id);
    // If the editor still holds it, close it so a later edit can't save it back.
    dispatch({ type: "close", id });
    setMascots(await mascotRepository.list());
  };

  return { mascots, remove };
};
