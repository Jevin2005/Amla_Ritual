import type { MotionSettings } from "@/domain/motion";

const pointerQuery = "(hover: hover) and (pointer: fine)";

/** Never hide content that has already painted in the viewport during hydration. */
export function observeBenefitsEntrance(section: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [...section.querySelectorAll<HTMLElement>("[data-benefit-reveal]")];
  const animations = new Map<HTMLElement, Animation>();
  let observer: IntersectionObserver | undefined;

  const reveal = (target: HTMLElement, delay = 0, animate = false) => {
    observer?.unobserve(target);
    const wasPending = target.dataset.benefitReveal === "pending";
    target.dataset.benefitReveal = "done";
    if (!animate || !wasPending || reduced.matches || !target.animate) return;

    const divider = target.hasAttribute("data-benefits-divider");
    const animation = target.animate([
      { opacity: 0, transform: divider ? "scaleX(0)" : "translate3d(0, 18px, 0)" },
      { opacity: 1, transform: "none" },
    ], { duration: 620 * settings.duration, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
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
      const entering = entries.filter((entry) => entry.isIntersecting)
        .sort((left, right) => targets.indexOf(left.target as HTMLElement) - targets.indexOf(right.target as HTMLElement));
      entering.forEach((entry, index) => reveal(entry.target as HTMLElement, Math.min(index * 70, 210), true));
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    targets.forEach((target) => {
      if (target.dataset.benefitReveal === "done" || target.getBoundingClientRect().top < window.innerHeight || target.contains(document.activeElement)) {
        reveal(target);
      } else {
        target.dataset.benefitReveal = "pending";
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
    observer?.disconnect();
    animations.forEach((animation) => animation.cancel());
    targets.forEach((target) => {
      if (target.dataset.benefitReveal === "pending") target.dataset.benefitReveal = "";
    });
    section.removeEventListener("focusin", onFocus);
    reduced.removeEventListener("change", onPreference);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export function installBenefitsPointer(section: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia(pointerQuery);
  const cleanup: Array<() => void> = [];
  const resets: Array<() => void> = [];
  const canMove = () => settings.enabled && settings.cursor && settings.intensity > 0 &&
    fine.matches && !reduced.matches && !document.hidden;

  section.querySelectorAll<HTMLElement>("[data-benefit-row]").forEach((row) => {
    const preview = row.querySelector<HTMLElement>("[data-benefit-preview]");
    const details = row.querySelector<HTMLElement>("[data-benefit-details]");
    const image = preview?.querySelector<HTMLImageElement>("img");
    if (!preview || !image) return;
    let bounds: DOMRect;
    let titleLimit = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let tilt = 0;
    let frame = 0;
    let lastTime = 0;
    let active = false;

    const paint = () => {
      preview.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${tilt.toFixed(2)}deg)`;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!active || !canMove()) return;
      const delta = Math.min(time - lastTime, 48);
      lastTime = time;
      const ease = 1 - Math.exp(-delta / 90);
      const horizontalDistance = targetX - currentX;
      currentX += horizontalDistance * ease;
      currentY += (targetY - currentY) * ease;
      // Time-based easing feels the same at 60/120 Hz, and tilt settles at rest.
      const targetTilt = Math.max(-8, Math.min(8, horizontalDistance * .08 * settings.intensity));
      tilt += (targetTilt - tilt) * ease;
      paint();
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) + Math.abs(tilt) > .1) {
        frame = requestAnimationFrame(tick);
      }
    };
    const schedule = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const updateTarget = (event: MouseEvent) => {
      // Keep the preview in the title column, clear of the description and action.
      const gutter = Math.min(132, bounds.width / 2);
      targetX = Math.max(gutter, Math.min(titleLimit, event.clientX - bounds.left));
      targetY = Math.max(36, Math.min(bounds.height - 36, event.clientY - bounds.top));
    };
    const showWhenReady = () => {
      if (active && canMove() && image.complete && image.naturalWidth > 0) row.dataset.previewVisible = "true";
    };
    const enter = (event: MouseEvent) => {
      if (!canMove() || window.innerWidth <= 800) return;
      bounds = row.getBoundingClientRect();
      const descriptionStart = details ? details.getBoundingClientRect().left - bounds.left : bounds.width;
      titleLimit = Math.max(Math.min(132, bounds.width / 2), descriptionStart - 140);
      active = true;
      updateTarget(event);
      currentX = targetX;
      currentY = targetY;
      tilt = 0;
      paint();
      showWhenReady();
    };
    const move = (event: MouseEvent) => {
      if (!active || !canMove() || event.buttons) return;
      updateTarget(event);
      schedule();
    };
    const leave = () => {
      active = false;
      cancelAnimationFrame(frame);
      frame = 0;
      delete row.dataset.previewVisible;
    };
    row.addEventListener("mouseenter", enter);
    row.addEventListener("mousemove", move);
    row.addEventListener("mouseleave", leave);
    row.addEventListener("mousedown", leave);
    row.addEventListener("focusin", leave);
    image.addEventListener("load", showWhenReady);
    resets.push(leave);
    cleanup.push(() => {
      leave();
      preview.style.removeProperty("transform");
      row.removeEventListener("mouseenter", enter);
      row.removeEventListener("mousemove", move);
      row.removeEventListener("mouseleave", leave);
      row.removeEventListener("mousedown", leave);
      row.removeEventListener("focusin", leave);
      image.removeEventListener("load", showWhenReady);
    });
  });

  const button = section.querySelector<HTMLElement>("[data-benefits-button]");
  const surface = section.querySelector<HTMLElement>("[data-benefits-button-surface]");
  if (button && surface) {
    let frame = 0;
    let x = 0;
    let y = 0;
    let bounds: DOMRect;
    const enter = () => { bounds = button.getBoundingClientRect(); };
    const move = (event: MouseEvent) => {
      if (!canMove() || !bounds || button.matches(":focus-visible") || event.buttons) return;
      x = Math.max(-8, Math.min(8, (event.clientX - bounds.left - bounds.width / 2) * .16));
      y = Math.max(-5, Math.min(5, (event.clientY - bounds.top - bounds.height / 2) * .2));
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        surface.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.style.removeProperty("transform");
    };
    button.addEventListener("mouseenter", enter);
    button.addEventListener("mousemove", move);
    button.addEventListener("mouseleave", reset);
    button.addEventListener("focusin", reset);
    button.addEventListener("mousedown", reset);
    resets.push(reset);
    cleanup.push(() => {
      reset();
      button.removeEventListener("mouseenter", enter);
      button.removeEventListener("mousemove", move);
      button.removeEventListener("mouseleave", reset);
      button.removeEventListener("focusin", reset);
      button.removeEventListener("mousedown", reset);
    });
  }

  const resetAll = () => resets.forEach((reset) => reset());
  window.addEventListener("scroll", resetAll, { passive: true });
  window.addEventListener("resize", resetAll);
  window.addEventListener("blur", resetAll);
  document.addEventListener("visibilitychange", resetAll);
  reduced.addEventListener("change", resetAll);
  fine.addEventListener("change", resetAll);
  return () => {
    cleanup.forEach((dispose) => dispose());
    window.removeEventListener("scroll", resetAll);
    window.removeEventListener("resize", resetAll);
    window.removeEventListener("blur", resetAll);
    document.removeEventListener("visibilitychange", resetAll);
    reduced.removeEventListener("change", resetAll);
    fine.removeEventListener("change", resetAll);
  };
}
