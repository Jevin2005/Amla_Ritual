import type { MotionSettings } from "@/domain/motion";

const pointerQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

/** The HTML stays visible; only newly entering, below-fold content receives an animation. */
export function observeBenefitsEntrance(section: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [...section.querySelectorAll<HTMLElement>("[data-benefit-reveal]")];
  const animations = new Map<HTMLElement, Animation>();
  const duration = Number.isFinite(settings.duration) ? Math.max(.6, Math.min(1.5, settings.duration)) : 1;
  let observer: IntersectionObserver | undefined;
  let disposed = false;

  const reveal = (target: HTMLElement, delay = 0, animate = false) => {
    observer?.unobserve(target);
    const wasPending = target.dataset.benefitRevealState === "pending";
    target.dataset.benefitRevealState = "done";
    if (!animate || !wasPending || reduced.matches || document.hidden || !target.animate) return;

    const header = target.dataset.benefitReveal === "header";
    const animation = target.animate([
      { opacity: 0, transform: `translate3d(0, ${header ? 12 : 16}px, 0)` },
      { opacity: 1, transform: "none" },
    ], {
      duration: (header ? 450 : 550) * duration,
      delay,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "backwards",
    });
    animations.set(target, animation);
    const clear = () => animations.delete(target);
    animation.onfinish = clear;
    animation.oncancel = clear;
  };

  const finish = () => {
    targets.forEach((target) => reveal(target));
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };

  if (settings.enabled && !reduced.matches && !document.hidden && "IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      if (disposed) return;
      let cardIndex = 0;
      entries.filter((entry) => entry.isIntersecting)
        .sort((left, right) => targets.indexOf(left.target as HTMLElement) - targets.indexOf(right.target as HTMLElement))
        .forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (target.dataset.benefitRevealState !== "pending") return;
          // An observer callback can arrive after a fast scroll has already passed a card.
          const bounds = target.getBoundingClientRect();
          const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
          const delay = visible && target.dataset.benefitReveal === "card" ? cardIndex++ * 60 : 0;
          reveal(target, delay, visible);
        });
    }, { threshold: 0 });
    targets.forEach((target) => {
      if (target.dataset.benefitRevealState === "done" || target.getBoundingClientRect().top < window.innerHeight || target.contains(document.activeElement)) {
        reveal(target);
      } else {
        target.dataset.benefitRevealState = "pending";
        observer?.observe(target);
      }
    });
  } else {
    finish();
  }

  const onFocus = (event: FocusEvent) => {
    targets.forEach((target) => {
      if (event.target instanceof Node && target.contains(event.target)) {
        reveal(target);
        animations.get(target)?.cancel();
        animations.delete(target);
      }
    });
  };
  const onPreference = () => { if (reduced.matches) finish(); };
  const onVisibility = () => { if (document.hidden) finish(); };
  section.addEventListener("focusin", onFocus);
  reduced.addEventListener("change", onPreference);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    disposed = true;
    observer?.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    targets.forEach((target) => {
      if (target.dataset.benefitRevealState === "pending") delete target.dataset.benefitRevealState;
    });
    section.removeEventListener("focusin", onFocus);
    reduced.removeEventListener("change", onPreference);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

/** Pointer depth belongs to the image wrapper, separate from hover lift and card entrance. */
export function installBenefitsPointer(section: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia(pointerQuery);
  const cleanup: Array<() => void> = [];
  const resets: Array<() => void> = [];
  const intensity = Number.isFinite(settings.intensity) ? Math.max(0, Math.min(1, settings.intensity)) : 0;
  const sectionBounds = section.getBoundingClientRect();
  let visible = sectionBounds.bottom > 0 && sectionBounds.top < window.innerHeight;
  let disposed = false;
  const canMove = () => !disposed && settings.enabled && settings.cursor && intensity > 0 &&
    window.innerWidth >= 768 && fine.matches && !reduced.matches && !document.hidden && visible;

  section.querySelectorAll<HTMLElement>("[data-benefit-card]").forEach((card) => {
    const depth = card.querySelector<HTMLElement>("[data-benefit-depth]");
    if (!depth) return;
    let bounds: DOMRect;
    let x = 0;
    let y = 0;
    let frame = 0;
    let active = false;

    const reset = () => {
      active = false;
      cancelAnimationFrame(frame);
      frame = 0;
      depth.style.removeProperty("--specimen-x");
      depth.style.removeProperty("--specimen-y");
      depth.style.removeProperty("--specimen-tilt");
    };
    const update = (event: PointerEvent) => {
      if (!active || !canMove() || event.pointerType === "touch" || event.buttons) return;
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        if (!active || !canMove()) { reset(); return; }
        depth.style.setProperty("--specimen-x", `${(x * 3 * intensity).toFixed(2)}px`);
        depth.style.setProperty("--specimen-y", `${(y * 3 * intensity).toFixed(2)}px`);
        depth.style.setProperty("--specimen-tilt", `${(x * 1.5 * intensity).toFixed(2)}deg`);
      });
    };
    const enter = (event: PointerEvent) => {
      if (!canMove() || event.pointerType === "touch" || event.buttons) return;
      bounds = card.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      active = true;
      update(event);
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", update);
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
    card.addEventListener("pointerdown", reset);
    card.addEventListener("focusin", reset);
    resets.push(reset);
    cleanup.push(() => {
      reset();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", update);
      card.removeEventListener("pointerleave", reset);
      card.removeEventListener("pointercancel", reset);
      card.removeEventListener("pointerdown", reset);
      card.removeEventListener("focusin", reset);
    });
  });

  const resetAll = () => resets.forEach((reset) => reset());
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    if (disposed) return;
    visible = entry.isIntersecting;
    if (!visible) resetAll();
  }) : undefined;
  observer?.observe(section);
  window.addEventListener("scroll", resetAll, { passive: true });
  window.addEventListener("resize", resetAll);
  window.addEventListener("blur", resetAll);
  document.addEventListener("visibilitychange", resetAll);
  reduced.addEventListener("change", resetAll);
  fine.addEventListener("change", resetAll);
  return () => {
    disposed = true;
    observer?.disconnect();
    cleanup.forEach((dispose) => dispose());
    window.removeEventListener("scroll", resetAll);
    window.removeEventListener("resize", resetAll);
    window.removeEventListener("blur", resetAll);
    document.removeEventListener("visibilitychange", resetAll);
    reduced.removeEventListener("change", resetAll);
    fine.removeEventListener("change", resetAll);
  };
}
