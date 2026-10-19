import { NAVIGATION_START } from "./shared/ui/page-loading";

// Called for Link, router.push/replace and browser back/forward by both runtimes.
export function onRouterTransitionStart(url: string) {
  window.dispatchEvent(new CustomEvent(NAVIGATION_START, { detail: url }));
}
