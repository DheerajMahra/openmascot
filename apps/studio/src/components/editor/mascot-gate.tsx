"use client";

import type { ReactNode } from "react";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { MissingMascot } from "@/components/editor/missing-mascot";
import { mascotRepository } from "@/lib/local-mascot-repository";
import { showsMascot, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { isStartFrom, startDoc } from "@/lib/samples";

/**
 * Opens the mascot named by the URL: the saved one, a new draft when `?from=` names a starting
 * point, or the missing screen. Renders nothing until then, so another mascot never shows through.
 * A mascot already open under this id stays as it is, which keeps undo history across steps.
 */
const Gate = ({ children }: { children: ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const fromParam = useSearchParams().get("from");
  const from = isStartFrom(fromParam) ? fromParam : null;
  const dispatch = useMascotDispatch();
  const shown = useMascotSelector(s => showsMascot(s, id));
  const missing = useMascotSelector(s => s.status === "missing" && s.missingId === id);

  useEffect(() => {
    if (shown || missing) return;
    let cancelled = false;
    void mascotRepository.get(id).then(saved => {
      if (cancelled) return;
      if (saved) dispatch({ type: "open-saved", doc: saved.doc });
      else if (from) dispatch({ type: "open-draft", doc: startDoc(from, id), from });
      else dispatch({ type: "open-missing", id });
    });
    return () => {
      cancelled = true;
    };
  }, [id, from, shown, missing, dispatch]);

  if (missing) return <MissingMascot />;
  return shown ? children : null;
};

/** Search params are only known in the browser, so the gate sits in its own Suspense boundary. */
export const MascotGate = ({ children }: { children: ReactNode }) => (
  <Suspense>
    <Gate>{children}</Gate>
  </Suspense>
);
