"use client";

import { useEffect, useRef, useSyncExternalStore, type PointerEvent } from "react";
import { usePageVisible, useReducedMotion } from "./use-motion-preferences";
import { useStore } from "@/features/store/store-provider";

const pointerQuery = "(hover: hover) and (pointer: fine)";
function subscribePointer(callback: () => void) {
  const media = window.matchMedia(pointerQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** Shares bounded cursor coordinates; CSS owns each effect's distance and easing. */
export function usePointerMotion<T extends HTMLElement>(enabled = true) {
  const { content: { motionSettings } } = useStore();
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const reducedMotion = useReducedMotion();
  const visible = usePageVisible();
  const finePointer = useSyncExternalStore(subscribePointer, () => window.matchMedia(pointerQuery).matches, () => false);
  const active = enabled && motionSettings.enabled && motionSettings.cursor && motionSettings.intensity > 0 && finePointer && !reducedMotion && visible;

  const reset = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    ref.current?.style.removeProperty("--pointer-x");
    ref.current?.style.removeProperty("--pointer-y");
  };

  useEffect(() => {
    const element = ref.current;
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      element?.style.removeProperty("--pointer-x");
      element?.style.removeProperty("--pointer-y");
    };
  }, [active]);

  const onPointerMove = (event: PointerEvent<T>) => {
    if (!active || event.pointerType !== "mouse" || event.buttons || event.currentTarget.matches(":focus-visible")) return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty("--pointer-x", (x * motionSettings.intensity).toFixed(3));
      element.style.setProperty("--pointer-y", (y * motionSettings.intensity).toFixed(3));
      frame.current = 0;
    });
  };

  return { ref, "data-pointer-motion": active, onPointerMove, onPointerLeave: reset, onPointerDown: reset, onFocus: reset };
}
