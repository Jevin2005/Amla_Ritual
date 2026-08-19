"use client";

import { useEffect } from "react";

const revealSelector =
  "main > section:not(:first-child), main > article, main .grid > article:not([data-reveal-ignore])";

function collectRevealElements(root: ParentNode) {
  const elements: HTMLElement[] = [];

  if (root instanceof HTMLElement && root.matches(revealSelector)) {
    elements.push(root);
  }

  elements.push(...root.querySelectorAll<HTMLElement>(revealSelector));

  return elements;
}

function revealImmediately(root: ParentNode = document) {
  for (const element of collectRevealElements(root)) {
    element.dataset.reveal = "revealed";
    element.style.removeProperty("--reveal-delay");
  }
}

export function MotionObserver() {
  useEffect(() => {
    const body = document.body;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let shouldReduceMotion = reducedMotion.matches;

    body.dataset.motionReady = "true";

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealImmediately();

      return () => {
        delete body.dataset.motionReady;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const element = entry.target as HTMLElement;
          element.dataset.reveal = "revealed";
          observer.unobserve(element);
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    const register = (root: ParentNode) => {
      const candidates = collectRevealElements(root);

      if (shouldReduceMotion) {
        revealImmediately(root);
        return;
      }

      for (const element of candidates) {
        if (element.dataset.reveal) continue;

        const siblings = element.parentElement
          ? Array.from(element.parentElement.children).filter(
              (sibling): sibling is HTMLElement => sibling instanceof HTMLElement,
            )
          : [];
        const siblingIndex = Math.max(0, siblings.indexOf(element));

        element.dataset.reveal = "pending";
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(siblingIndex, 3) * 55}ms`,
        );
        observer.observe(element);
      }
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) register(node);
        }
      }
    });

    mutations.observe(body, { childList: true, subtree: true });

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      shouldReduceMotion = true;
      revealImmediately();
      observer.disconnect();
    };

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      mutations.disconnect();
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      delete body.dataset.motionReady;
    };
  }, []);

  return null;
}
