import { PoseStrip } from "@/components/mascot/pose-strip/PoseStrip";
import { MOSS } from "@/lib/mascots";

export const PosesArt = () => (
  <PoseStrip doc={MOSS} poses={["default", "wink", "tall", "squish"]} scale={2.25} />
);
