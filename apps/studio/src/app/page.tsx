import type { Metadata } from "next";

import { StartScreen } from "@/features/start/start-screen";

/** The one studio page worth a search result; the editor screens opt out in their layout. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function StartPage() {
  return <StartScreen />;
}
