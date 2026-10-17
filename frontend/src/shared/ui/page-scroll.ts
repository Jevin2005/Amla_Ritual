type PageScroller = (top: number, immediate: boolean) => void;
type PageScrollOptions = { immediate?: boolean; block?: "start" | "center" };

let activeScroller: { drive: PageScroller } | null = null;

/** Register the document scroll owner without coupling callers to its library. */
export function registerPageScroller(drive: PageScroller): () => void {
  const registration = { drive };
  activeScroller = registration;
  return () => {
    if (activeScroller === registration) activeScroller = null;
  };
}

const pixels = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Scroll the document; nested galleries and panels retain their native APIs. */
export function scrollPageTo(target: number | HTMLElement | null, options: PageScrollOptions = {}): void {
  if (typeof window === "undefined" || target === null) return;
  const root = window.document?.documentElement;
  let top: number;
  if (typeof target === "number") {
    top = target;
  } else {
    if (!target || typeof target.getBoundingClientRect !== "function") return;
    const bounds = target.getBoundingClientRect();
    if (!Number.isFinite(bounds.top) || !Number.isFinite(window.scrollY)) return;
    const padding = root ? pixels(window.getComputedStyle(root).scrollPaddingTop) : 0;
    const margin = pixels(window.getComputedStyle(target).scrollMarginTop);
    top = window.scrollY + bounds.top - padding - margin;
    if (options.block === "center") {
      if (!Number.isFinite(bounds.height) || !Number.isFinite(window.innerHeight)) return;
      // Center the margin-expanded target within the padding-inset viewport.
      top += (bounds.height + margin - (window.innerHeight - padding)) / 2;
    }
  }
  if (!Number.isFinite(top)) return;
  top = Math.max(0, top);
  const immediate = Boolean(options.immediate || root?.dataset?.siteMotion === "off"
    || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  if (activeScroller) activeScroller.drive(top, immediate);
  else window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}
