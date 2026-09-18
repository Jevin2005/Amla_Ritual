import type { MotionSettings } from "@/domain/motion";

export function installRitualSectionMotion(panel: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const targets = [...panel.querySelectorAll<HTMLElement>("[data-ritual-reveal]")];
  const spotlight = panel.querySelector<HTMLElement>("[data-ritual-spotlight]");
  const animations = new Map<HTMLElement, Animation>();
  let entrances: IntersectionObserver | undefined;
  let visibility: IntersectionObserver | undefined;
  let inView = false;
  let frame = 0;
  let bounds: DOMRect | undefined;
  let x = 0;
  let y = 0;

  const canMove = () => settings.enabled && settings.cursor && settings.intensity > 0 && !reduced.matches && fine.matches && !document.hidden;
  const reveal = (target: HTMLElement, animate = false) => {
    entrances?.unobserve(target);
    const pending = target.dataset.ritualReveal === "pending";
    target.dataset.ritualReveal = "done";
    if (!animate || !pending || reduced.matches || !target.animate) return;
    const compact = window.innerWidth <= 680;
    const targetIndex = targets.indexOf(target);
    const animation = target.animate([
      { opacity: 0, transform: `translate3d(0, ${compact ? 12 : 28}px, 0)` },
      { opacity: 1, transform: "none" },
    ], {
      duration: (compact ? 480 : 760) * settings.duration,
      // Phone content enters separately as it scrolls into view, so avoid long waits.
      delay: compact ? Math.min(targetIndex * 30, 90) : targetIndex * 120,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "backwards",
    });
    animations.set(target, animation);
    const clear = () => animations.delete(target);
    animation.onfinish = clear;
    animation.oncancel = clear;
  };
  const finishEntrances = () => {
    targets.forEach((target) => reveal(target));
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };
  const resetSpotlight = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    bounds = undefined;
    delete panel.dataset.spotlight;
  };
  const updateMotion = () => {
    panel.dataset.ambient = String(inView && settings.enabled && !reduced.matches && !document.hidden);
    if (!canMove()) resetSpotlight();
    if (reduced.matches || document.hidden) finishEntrances();
  };

  if ("IntersectionObserver" in window) {
    visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
      if (!inView) resetSpotlight();
    });
    visibility.observe(panel);
    if (settings.enabled && !reduced.matches && !document.hidden) {
      entrances = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target as HTMLElement, true); });
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
      targets.forEach((target) => {
        // Content already on screen stays visible on cold loads and scroll restoration.
        if (target.dataset.ritualReveal === "done" || target.getBoundingClientRect().top < window.innerHeight || target.contains(document.activeElement)) {
          reveal(target);
        } else {
          target.dataset.ritualReveal = "pending";
          entrances?.observe(target);
        }
      });
    } else finishEntrances();
  } else {
    inView = true;
    finishEntrances();
  }
  updateMotion();

  const enter = () => { if (canMove()) bounds = panel.getBoundingClientRect(); };
  const move = (event: MouseEvent) => {
    if (!canMove() || !spotlight || event.buttons) return;
    bounds ??= panel.getBoundingClientRect();
    x = event.clientX - bounds.left - 190;
    y = event.clientY - bounds.top - 190;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      spotlight.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      panel.dataset.spotlight = "true";
    });
  };
  const focus = (event: FocusEvent) => {
    targets.forEach((target) => {
      if (event.target instanceof Node && target.contains(event.target)) {
        reveal(target);
        animations.get(target)?.cancel();
        animations.delete(target);
      }
    });
  };

  panel.addEventListener("mouseenter", enter);
  panel.addEventListener("mousemove", move);
  panel.addEventListener("mouseleave", resetSpotlight);
  panel.addEventListener("focusin", focus);
  window.addEventListener("scroll", resetSpotlight, { passive: true });
  window.addEventListener("resize", resetSpotlight);
  window.addEventListener("blur", resetSpotlight);
  document.addEventListener("visibilitychange", updateMotion);
  reduced.addEventListener("change", updateMotion);
  fine.addEventListener("change", updateMotion);

  return () => {
    resetSpotlight();
    entrances?.disconnect();
    visibility?.disconnect();
    animations.forEach((animation) => animation.cancel());
    targets.forEach((target) => {
      if (target.dataset.ritualReveal === "pending") target.dataset.ritualReveal = "";
    });
    delete panel.dataset.ambient;
    panel.removeEventListener("mouseenter", enter);
    panel.removeEventListener("mousemove", move);
    panel.removeEventListener("mouseleave", resetSpotlight);
    panel.removeEventListener("focusin", focus);
    window.removeEventListener("scroll", resetSpotlight);
    window.removeEventListener("resize", resetSpotlight);
    window.removeEventListener("blur", resetSpotlight);
    document.removeEventListener("visibilitychange", updateMotion);
    reduced.removeEventListener("change", updateMotion);
    fine.removeEventListener("change", updateMotion);
  };
}
