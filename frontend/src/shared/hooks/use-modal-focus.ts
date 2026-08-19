"use client";

import { useEffect, type RefObject } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(node: HTMLElement) {
  return Array.from(node.querySelectorAll<HTMLElement>(focusableSelector));
}

export function useModalFocus(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const preferredFocus = node?.querySelector<HTMLElement>("[data-autofocus]");
    const initialFocusables = node ? getFocusableElements(node) : [];
    (preferredFocus || initialFocusables[0])?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const focusables = getFocusableElements(node);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const focusedElement = document.activeElement;
      const focusIsOutside = !node.contains(focusedElement);

      if (event.shiftKey && (focusedElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focusedElement === last || focusIsOutside)) {
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
