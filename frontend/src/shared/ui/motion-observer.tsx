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
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;
    let hydrationFrame = 0;
    let paintFrame = 0;
    let registerFrame = 0;
    let registerPaintFrame = 0;
    let disposed = false;
    const queuedRoots = new Set<ParentNode>();

    const register = (root: ParentNode) => {
      const candidates = collectRevealElements(root);

      if (shouldReduceMotion || !observer) {
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

    const scheduleRegister = (root: ParentNode) => {
      queuedRoots.add(root);
      if (registerFrame || registerPaintFrame) return;

      registerFrame = window.requestAnimationFrame(() => {
        registerFrame = 0;
        registerPaintFrame = window.requestAnimationFrame(() => {
          registerPaintFrame = 0;
          if (disposed) return;

          const roots = Array.from(queuedRoots);
          queuedRoots.clear();
          for (const queuedRoot of roots) register(queuedRoot);
        });
      });
    };

    const start = () => {
      if (disposed) return;

      body.dataset.motionReady = "true";

      if (shouldReduceMotion || !("IntersectionObserver" in window)) {
        revealImmediately();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            const element = entry.target as HTMLElement;
            element.dataset.reveal = "revealed";
            observer?.unobserve(element);
          }
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.08,
        },
      );

      register(document);

      mutations = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node instanceof HTMLElement) scheduleRegister(node);
          }
        }
      });

      mutations.observe(body, { childList: true, subtree: true });
    };

    const startAfterHydration = () => {
      hydrationFrame = window.requestAnimationFrame(() => {
        hydrationFrame = 0;
        paintFrame = window.requestAnimationFrame(() => {
          paintFrame = 0;
          start();
        });
      });
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      shouldReduceMotion = true;
      if (body.dataset.motionReady !== "true") return;
      revealImmediately();
      observer?.disconnect();
    };

    if (document.readyState === "complete") {
      startAfterHydration();
    } else {
      window.addEventListener("load", startAfterHydration, { once: true });
    }

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      disposed = true;
      window.removeEventListener("load", startAfterHydration);
      window.cancelAnimationFrame(hydrationFrame);
      window.cancelAnimationFrame(paintFrame);
      window.cancelAnimationFrame(registerFrame);
      window.cancelAnimationFrame(registerPaintFrame);
      queuedRoots.clear();
      mutations?.disconnect();
      observer?.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      delete body.dataset.motionReady;
    };
  }, []);

  return null;
}
