import { ShareScreen } from "@/features/share/share-screen";

// The mascot id is only known per request and the screen renders in the browser, so there is no
// static shell to check for instant navigation.
export const instant = false;

export default function SharePage() {
  return <ShareScreen />;
}
