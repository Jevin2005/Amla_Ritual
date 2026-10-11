/** Smooth the document's wheel input without replacing native touch, keyboard,
 * anchor navigation or scrolling inside a drawer. No perpetual animation loop. */
export function installWheelScroll(view: Window) {
  const doc = view.document;
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = view.matchMedia("(pointer: fine)");
  let frame = 0;
  let target = view.scrollY;
  let written = view.scrollY;
  let position = view.scrollY;
  let previousTime = 0;
  let direction = 0;

  const stop = () => {
    view.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    direction = 0;
    target = written = position = view.scrollY;
  };
  const limit = (value: number) => Math.max(0, Math.min(value,
    Math.max(0, doc.documentElement.scrollHeight - view.innerHeight)));
  const locked = () => [doc.body, doc.documentElement].some((element) =>
    /^(hidden|clip)$/.test(view.getComputedStyle(element).overflowY));

  const draw = (time: number) => {
    frame = 0;
    if (doc.hidden || reduced.matches || !pointer.matches || locked() || Math.abs(view.scrollY - written) > 2) {
      stop();
      return;
    }
    target = limit(target);
    const elapsed = previousTime ? Math.min(40, time - previousTime) : 16.67;
    previousTime = time;
    const remaining = target - position;
    const next = Math.abs(remaining) < 0.75 ? target
      : position + remaining * (1 - Math.exp(-elapsed / 110));
    // Instant avoids compounding this easing with CSS scroll-behavior: smooth.
    view.scrollTo({ top: next, left: view.scrollX, behavior: "instant" });
    position = next;
    written = view.scrollY;
    if (next !== target) frame = view.requestAnimationFrame(draw);
    else stop();
  };

  const wheel = (event: WheelEvent) => {
    if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
      || !Number.isFinite(event.deltaY) || event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)
      || reduced.matches || !pointer.matches || doc.hidden || locked()) {
      stop();
      return;
    }
    // Preserve nested scrollers even at their edges (including overscroll-contain).
    for (const item of event.composedPath()) {
      if (item === doc.body || item === doc.documentElement) break;
      const element = item as HTMLElement;
      if (element.nodeType !== 1) continue;
      if (element.matches('input, textarea, select, [contenteditable="true"], [role="dialog"], [data-native-scroll]')
        || (/^(auto|scroll)$/.test(view.getComputedStyle(element).overflowY)
          && element.scrollHeight > element.clientHeight + 1)) {
        stop();
        return;
      }
    }
    const nextDirection = Math.sign(event.deltaY);
    // A reversal starts here, never at an old destination further down the page.
    if (!frame || nextDirection !== direction || Math.abs(view.scrollY - written) > 2) stop();
    direction = nextDirection;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.innerHeight : 1;
    const distance = event.deltaY * unit * 0.85;
    const maxPending = Math.min(420, view.innerHeight * 0.5);
    target = limit(Math.max(view.scrollY - maxPending, Math.min(view.scrollY + maxPending, target + distance)));
    if (Math.abs(target - view.scrollY) < 0.75) { stop(); return; }
    event.preventDefault();
    if (!frame) frame = view.requestAnimationFrame(draw);
  };

  const interruptEvents = ["pointerdown", "touchstart", "keydown", "click", "resize", "blur", "pageshow", "pagehide", "popstate", "hashchange"] as const;
  view.addEventListener("wheel", wheel, { passive: false });
  for (const name of interruptEvents) view.addEventListener(name, stop, { passive: true });
  doc.addEventListener("visibilitychange", stop);
  reduced.addEventListener("change", stop);
  pointer.addEventListener("change", stop);
  return () => {
    stop();
    view.removeEventListener("wheel", wheel);
    for (const name of interruptEvents) view.removeEventListener(name, stop);
    doc.removeEventListener("visibilitychange", stop);
    reduced.removeEventListener("change", stop);
    pointer.removeEventListener("change", stop);
  };
}
