import type { MotionSettings } from "@/domain/motion";

/** One entrance for the section; only the decorative corner keeps moving. */
export function installRitualSectionMotion(panel: HTMLElement, settings: MotionSettings) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 1024px)");
  let observer: IntersectionObserver | undefined;
  let siteMotionObserver: MutationObserver | undefined;
  let entrance: Animation | undefined;
  let inView = false;

  const motionAllowed = () => settings.enabled && settings.intensity > 0 && !reduced.matches
    && document.documentElement.dataset.siteMotion !== "off" && !document.hidden;

  const cancelEntrance = () => {
    entrance?.cancel();
    entrance = undefined;
  };

  const reveal = (animate = false) => {
    const pending = panel.dataset.ritualReveal === "pending";
    panel.dataset.ritualReveal = "done";
    if (!animate || !pending || !motionAllowed() || !panel.animate) {
      cancelEntrance();
      return;
    }
    entrance = panel.animate([
      { opacity: 0, transform: "translate3d(0, 16px, 0)" },
      { opacity: 1, transform: "none" },
    ], {
      duration: 520,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards",
    });
    entrance.onfinish = () => { entrance = undefined; };
    entrance.oncancel = () => { entrance = undefined; };
  };

  const updateMotion = () => {
    panel.dataset.ambient = String(inView && desktop.matches && motionAllowed());
    if (!motionAllowed()) reveal();
  };

  if ("IntersectionObserver" in window) {
    const bounds = panel.getBoundingClientRect();
    // Never hide content that was already painted on a restored page or has focus.
    if (panel.dataset.ritualReveal === "done" || bounds.top < window.innerHeight
      || panel.contains(document.activeElement) || !motionAllowed()) {
      reveal();
    } else {
      panel.dataset.ritualReveal = "pending";
    }
    observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      inView = entry.isIntersecting;
      if (inView && panel.dataset.ritualReveal === "pending") reveal(true);
      updateMotion();
    }, { threshold: 0 });
    observer.observe(panel);
  } else {
    reveal();
  }

  const focus = () => reveal();
  panel.addEventListener("focusin", focus);
  document.addEventListener("visibilitychange", updateMotion);
  reduced.addEventListener("change", updateMotion);
  desktop.addEventListener("change", updateMotion);
  if ("MutationObserver" in window) {
    siteMotionObserver = new MutationObserver(updateMotion);
    siteMotionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-site-motion"] });
  }
  updateMotion();

  return () => {
    observer?.disconnect();
    siteMotionObserver?.disconnect();
    cancelEntrance();
    if (panel.dataset.ritualReveal === "pending") delete panel.dataset.ritualReveal;
    delete panel.dataset.ambient;
    panel.removeEventListener("focusin", focus);
    document.removeEventListener("visibilitychange", updateMotion);
    reduced.removeEventListener("change", updateMotion);
    desktop.removeEventListener("change", updateMotion);
  };
}
