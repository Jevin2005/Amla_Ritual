export const NAVIGATION_START = "naturemist:navigation-start";
export const NAVIGATION_COMMIT = "naturemist:navigation-commit";

export type LoadingPhase = "startup" | "navigation" | "idle";

/** Hash changes, downloads and external URLs do not start a page load. */
export function getRouteKey(href: string, base: string) {
  try {
    const url = new URL(href, base);
    if (url.origin !== new URL(base).origin || !/^https?:$/.test(url.protocol)) return null;
    const search = url.searchParams.toString();
    return url.pathname + (search ? `?${search}` : "");
  } catch {
    return null;
  }
}

function isVisible(element: Element, view: Window, viewportOnly = false) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 1 || rect.height <= 1) return false;
  if (viewportOnly && (rect.bottom <= 0 || rect.right <= 0 || rect.top >= view.innerHeight || rect.left >= view.innerWidth)) return false;
  // Check ancestors too: future slides and image preloads often have opacity: 0.
  for (let node: Element | null = element; node; node = node.parentElement) {
    const style = view.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  }
  return true;
}

/** One bounded loading cycle at a time, shared by Next and the hosted runtime. */
export function installPageLoading(view: Window, onPhase: (phase: LoadingPhase) => void) {
  const doc = view.document;
  let committed = getRouteKey(view.location.href, view.location.href);
  let generation = 0;
  let active = false;
  let target: string | null = null;
  const superseded = new Set<string>();
  let hasCommitted = true;
  let started = 0;
  let poll = 0;
  let reveal = 0;
  let deadline = 0;
  const decoded = new WeakMap<HTMLImageElement, { source: string; ready: boolean }>();

  const clear = () => {
    view.clearTimeout(poll);
    view.clearTimeout(reveal);
    view.clearTimeout(deadline);
  };
  const finish = () => {
    generation++;
    active = false;
    target = null;
    superseded.clear();
    clear();
    onPhase("idle");
  };
  const ready = () => {
    if (!hasCommitted) return false;
    const content = doc.getElementById("site-content");
    if (!content) return false;
    if ([...content.querySelectorAll("[data-page-pending]")].some((element) => isVisible(element, view))) return false;
    // Media has its own loading states; slow assets should not hide usable content.
    if (Date.now() - started >= 1200) return true;
    // Web fonts have a short grace period; third-party resources never trap browsing.
    if (doc.fonts?.status === "loading" && Date.now() - started < 1000) return false;
    return [...content.querySelectorAll<HTMLImageElement>("img")].filter((image) => isVisible(image, view, true)).map((image) => {
      if (!image.complete) return false;
      if (!image.naturalWidth || !image.decode) return true;
      const source = image.currentSrc || image.src;
      const previous = decoded.get(image);
      if (previous?.source === source) return previous.ready;
      const entry = { source, ready: false };
      decoded.set(image, entry);
      // Both success and failure release the gate; MediaImage owns retries/fallbacks.
      void image.decode().then(() => { entry.ready = true; }, () => { entry.ready = true; });
      return false;
    }).every(Boolean);
  };
  const begin = (startup: boolean) => {
    clear();
    const current = ++generation;
    active = true;
    hasCommitted = startup;
    started = Date.now();
    if (!startup) reveal = view.setTimeout(() => onPhase("navigation"), 140);
    // A failed request, script or asset must never leave an overlay stuck on screen.
    deadline = view.setTimeout(finish, startup ? 2500 : 12000);
    let settled = 0;
    const check = () => {
      if (current !== generation) return;
      // Two settled checks allow streamed content, image fallbacks and layout to commit.
      settled = ready() ? settled + 1 : 0;
      if (settled >= 2) finish();
      else poll = view.setTimeout(check, 80);
    };
    poll = view.setTimeout(check, 0);
  };
  const onStart = (event: Event) => {
    const key = getRouteKey((event as CustomEvent<string>).detail, view.location.href);
    if (!key) return;
    if (key === committed) {
      if (active && !hasCommitted) finish();
      return;
    }
    if (active && target && target !== key) superseded.add(target);
    superseded.delete(key);
    target = key;
    begin(false);
  };
  const onCommit = (event: Event) => {
    const key = getRouteKey((event as CustomEvent<string>).detail, view.location.href);
    // Ignore an obsolete effect from a route superseded by another transition.
    if (!key || key !== getRouteKey(view.location.href, view.location.href)) return;
    // Accept redirects, but never let an older navigation complete a newer one.
    if (superseded.has(key)) return;
    if (!active && committed !== key) begin(false);
    committed = key;
    hasCommitted = true;
  };
  const onRestore = (event: PageTransitionEvent) => {
    if (event.persisted) {
      committed = getRouteKey(view.location.href, view.location.href);
      finish();
    }
  };

  view.addEventListener(NAVIGATION_START, onStart);
  view.addEventListener(NAVIGATION_COMMIT, onCommit);
  view.addEventListener("pageshow", onRestore);
  begin(true);
  return () => {
    generation++;
    clear();
    view.removeEventListener(NAVIGATION_START, onStart);
    view.removeEventListener(NAVIGATION_COMMIT, onCommit);
    view.removeEventListener("pageshow", onRestore);
  };
}
