"use client";

import { useEffect, type RefObject } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalFocus(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = node?.querySelectorAll<HTMLElement>(focusableSelector);
    const preferredFocus = node?.querySelector<HTMLElement>("[data-autofocus]");
    (preferredFocus || focusables?.[0])?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
      previousFocus?.focus();
    };
  }, [active, onClose, ref]);
}
