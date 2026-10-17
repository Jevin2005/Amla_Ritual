import Lenis from "lenis";
import { registerPageScroller, scrollPageTo } from "./page-scroll";

/** One document scroller. Touch and nested controls keep their native gestures. */
export function installLenisScroll(view: Window) {
  const doc = view.document;
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  let lenis: Lenis | null = null;
  let unregister: (() => void) | undefined;
  let frame = 0;
  let clock = 0;
  let previousTime = 0;
  let blocked = false;
  let disposed = false;

  const interrupt = () => {
    view.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (lenis) {
      const stopped = lenis.isStopped;
      // Public stop/start cancels inertia and resyncs to the actual position.
      lenis.stop();
      if (!stopped) lenis.start();
    }
  };
  const draw = (time: number) => {
    frame = 0;
    if (!lenis || disposed || blocked) return;
    // Advance only while needed; the first frame after an idle/hidden tab
    // must not inherit minutes of elapsed time and jump to the destination.
    clock += previousTime ? Math.min(64, Math.max(0, time - previousTime)) : 1000 / 60;
    previousTime = time;
    lenis.raf(clock);
    if (lenis.isScrolling === "smooth") requestDraw();
    else previousTime = 0;
  };
  function requestDraw() {
    if (!frame && lenis && !disposed && !blocked) frame = view.requestAnimationFrame(draw);
  }
  const syncLock = () => {
    // Existing menus and media dialogs lock BODY, not Lenis's HTML wrapper.
    // Observe those changes once instead of reading computed styles per wheel.
    blocked = doc.hidden || /^(hidden|clip)$/.test(view.getComputedStyle(doc.body).overflowY);
    if (blocked) {
      interrupt();
      lenis?.stop();
    } else {
      lenis?.start();
    }
  };
  const destroyScroller = () => {
    interrupt();
    unregister?.();
    unregister = undefined;
    lenis?.destroy();
    lenis = null;
  };
  const configure = () => {
    destroyScroller();
    if (disposed || reduced.matches) return;
    lenis = new Lenis({
      wrapper: view,
      content: doc.documentElement,
      autoRaf: false,
      autoResize: true,
      smoothWheel: true,
      lerp: 0.16,
      wheelMultiplier: 1,
      // Native touch momentum avoids main-thread gesture lag on mobile,
      // and preserves pinch zoom, jar swipes and horizontal snap galleries.
      syncTouch: false,
      allowNestedScroll: true,
      anchors: false,
      prevent: (node) => node.matches('dialog, [role="dialog"], input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-native-scroll]'),
      virtualScroll: ({ event, deltaX, deltaY }) => {
        if (event.defaultPrevented || (event.type === "wheel" && !event.cancelable)
          || event.ctrlKey || event.metaKey || event.shiftKey
          || !Number.isFinite(deltaX) || !Number.isFinite(deltaY)
          || Math.abs(deltaX) > Math.abs(deltaY)) {
          interrupt();
          return false;
        }
        return true;
      },
    });
    lenis.on("virtual-scroll", ({ event }) => {
      if (event.type === "wheel") requestDraw();
    });
    unregister = registerPageScroller((top, immediate) => {
      if (!lenis || blocked) return;
      interrupt();
      // Content may have changed in the same React commit as this request.
      lenis.resize();
      lenis.scrollTo(top, { immediate });
      if (!immediate) requestDraw();
    });
    syncLock();
  };

  const anchorClick = (event: MouseEvent) => {
    if (!lenis || blocked || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.("a[href]");
    if (!link || link.hasAttribute("download") || (link.getAttribute("target") && link.getAttribute("target") !== "_self")) return;
    const url = new URL(link.getAttribute("href")!, view.location.href);
    if (url.origin !== view.location.origin || url.pathname !== view.location.pathname
      || url.search !== view.location.search || !url.hash) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = doc.getElementById(id);
    if (!target) return;
    event.preventDefault();
    // Preserve deep links and keyboard focus, including the skip-to-content link.
    if (view.location.hash !== url.hash) view.history.pushState(view.history.state, "", url.hash);
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
    target.focus({ preventScroll: true });
    scrollPageTo(target);
  };
  const restore = () => {
    interrupt();
    lenis?.resize();
    syncLock();
  };
  const observer = new MutationObserver(syncLock);
  observer.observe(doc.body, { attributes: true, attributeFilter: ["class", "style"] });
  // Capture cancellation runs before a React click can start a new page scroll.
  // The bubbling anchor handler leaves custom/prevented hero navigation alone.
  view.addEventListener("click", interrupt, { capture: true, passive: true });
  view.addEventListener("click", anchorClick);
  const interruptions = ["pointerdown", "touchstart", "keydown", "blur", "pagehide", "popstate", "hashchange"] as const;
  for (const name of interruptions) view.addEventListener(name, interrupt, { passive: true });
  view.addEventListener("pageshow", restore);
  view.addEventListener("resize", restore, { passive: true });
  doc.addEventListener("visibilitychange", restore);
  reduced.addEventListener("change", configure);
  configure();

  return () => {
    disposed = true;
    destroyScroller();
    observer.disconnect();
    view.removeEventListener("click", interrupt, true);
    view.removeEventListener("click", anchorClick);
    for (const name of interruptions) view.removeEventListener(name, interrupt);
    view.removeEventListener("pageshow", restore);
    view.removeEventListener("resize", restore);
    doc.removeEventListener("visibilitychange", restore);
    reduced.removeEventListener("change", configure);
  };
}
