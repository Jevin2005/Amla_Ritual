"use client";

import { useEffect, useState } from "react";

// Give decoded, visible images a paint before starting optional heavy work.
export function useDeferredMedia(enabled: boolean, delay = 1200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || ready) return;
    let idle: number | undefined;
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      } else {
        setReady(true);
      }
    }, delay);
    return () => {
      window.clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, [enabled, ready, delay]);
  return ready;
}
