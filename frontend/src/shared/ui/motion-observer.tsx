"use client";

import { useEffect } from "react";
import { useStore } from "@/features/store/store-provider";

const revealSelector =
  "main > section:not(:first-child), main > article, main .grid > article:not([data-reveal-ignore]), main [data-motion-reveal]";

function collectRevealElements(root: ParentNode) {
  const elements = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(revealSelector)) elements.add(root);
  for (const element of root.querySelectorAll<HTMLElement>(revealSelector)) elements.add(element);
  // Reveal the individual cards/images rather than transforming their section too.
  return [...elements].filter((element) => !element.hasAttribute("data-reveal-ignore") && !element.querySelector(revealSelector));
}

export function MotionObserver() {
  const { content: { motionSettings } } = useStore();
  useEffect(() => {
    const body = document.body;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactScreen = window.matchMedia("(max-width: 680px)");
    const pending = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    const queuedRoots = new Set<ParentNode>();
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let disposed = false;

    const reveal = (element: HTMLElement, animate = false) => {
      pending.delete(element);
      observer?.unobserve(element);
      element.dataset.reveal = "revealed";
      if (!animate || !motionSettings.enabled || reducedMotion.matches || document.hidden || !element.animate) return;

      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const delay = Math.min(Math.max(0, siblings.indexOf(element)), 3) * (compactScreen.matches ? 35 : 65);
      const image = element.dataset.motionReveal === "image";
      const keyframes: Keyframe[] = image && !compactScreen.matches
        ? [{ opacity: 0.4, clipPath: "inset(8% 0 8% 0)" }, { opacity: 1, clipPath: "inset(0% 0 0% 0)" }]
        : [{ opacity: 0, transform: `translate3d(0, ${compactScreen.matches ? 12 : 26}px, 0)` }, { opacity: 1, transform: "none" }];
      const animation = element.animate(keyframes, {
        duration: (compactScreen.matches ? 480 : image ? 950 : 760) * motionSettings.duration,
        delay: delay * motionSettings.duration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      });
      animations.set(element, animation);
      const clear = () => {
        if (animations.get(element) === animation) animations.delete(element);
      };
      animation.onfinish = clear;
      animation.oncancel = clear;
    };

    const revealAll = () => {
      for (const element of [...pending]) reveal(element);
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
    };

    const register = (root: ParentNode) => {
      for (const element of collectRevealElements(root)) {
        if (!element.isConnected || element.dataset.reveal) continue;
        for (const ancestor of [...pending]) {
          if (ancestor.contains(element)) reveal(ancestor);
        }
        for (const [ancestor, animation] of animations) {
          if (ancestor.contains(element)) animation.cancel();
        }
        const bounds = element.getBoundingClientRect();
        // Content in or above the viewport stays visible, including during hydration.
        if (!motionSettings.enabled || reducedMotion.matches || document.hidden || !observer || bounds.top < window.innerHeight || element.contains(document.activeElement)) {
          reveal(element);
          continue;
        }
        element.dataset.reveal = "pending";
        pending.add(element);
        observer.observe(element);
      }
    };

    const scheduleRegister = (root: ParentNode) => {
      queuedRoots.add(root);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (disposed) return;
        // Unobserve detached content after route changes or catalog filtering.
        for (const element of pending) {
          if (!element.isConnected) {
            observer?.unobserve(element);
            pending.delete(element);
          }
        }
        for (const [element, animation] of animations) {
          if (!element.isConnected) {
            animation.cancel();
            animations.delete(element);
          }
        }
        for (const queuedRoot of queuedRoots) register(queuedRoot);
        queuedRoots.clear();
      });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement, true);
        }
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    }

    body.dataset.motionReady = "true";
    // Defer past React's synchronous hydration pass — rAF fires before hydration
    // commits and writing data-reveal="pending" causes a hydration mismatch.
    const initTimer = setTimeout(() => scheduleRegister(document), 0);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) scheduleRegister(node);
        }
        if (record.removedNodes.length) scheduleRegister(record.target as ParentNode);
      }
    });
    mutations.observe(body, { childList: true, subtree: true });

    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      for (const element of [...pending]) {
        if (element.contains(event.target)) reveal(element);
      }
      for (const [element, animation] of animations) {
        if (element.contains(event.target)) animation.cancel();
      }
    };
    const onPreferenceChange = () => {
      if (reducedMotion.matches) revealAll();
      else scheduleRegister(document);
    };
    const onVisibilityChange = () => {
      if (document.hidden) revealAll();
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onPreferenceChange);

    return () => {
      disposed = true;
      clearTimeout(initTimer);
      cancelAnimationFrame(frame);
      mutations.disconnect();
      revealAll();
      observer?.disconnect();
      queuedRoots.clear();
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onPreferenceChange);
      delete body.dataset.motionReady;
    };
  }, [motionSettings.enabled, motionSettings.duration]);

  return null;
}
