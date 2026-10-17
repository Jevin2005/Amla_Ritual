"use client";

import { useEffect, useState } from "react";

// Critical media starts on the next frame; optional effects wait for idle time.
export function useDeferredMedia(enabled: boolean, delay = 1200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || ready) return;
    if (delay === 0) {
      const frame = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(frame);
    }
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
