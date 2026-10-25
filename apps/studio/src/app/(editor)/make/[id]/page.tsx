import { MakeScreen } from "@/features/make/make-screen";

// The mascot id is only known per request and the screen renders in the browser, so there is no
// static shell to check for instant navigation.
export const instant = false;

export default function MakePage() {
  return <MakeScreen />;
}
