import type { RefObject } from "react";

import { useEffect, useState } from "react";

export interface DeviceSize {
  width: number;
  height: number;
}

/** The element's on-screen size in device pixels, or null until it is first measured. */
export const useDeviceSize = (ref: RefObject<HTMLElement | null>): DeviceSize | null => {
  const [size, setSize] = useState<DeviceSize | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      // Safari has no device-pixel box; derive it from the CSS box there.
      const device = entry.devicePixelContentBoxSize?.[0];
      const css = entry.contentBoxSize[0];
      const width = device?.inlineSize ?? Math.round((css?.inlineSize ?? 0) * devicePixelRatio);
      const height = device?.blockSize ?? Math.round((css?.blockSize ?? 0) * devicePixelRatio);
      setSize(prev => (prev?.width === width && prev.height === height ? prev : { width, height }));
    });
    try {
      // Also fires when only the pixel ratio changes, such as on browser zoom.
      observer.observe(el, { box: "device-pixel-content-box" });
    } catch {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ref]);

  return size;
};
