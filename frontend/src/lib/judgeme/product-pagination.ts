type PaginationState = "loading" | "ready" | "error";

/** Keep the provider's fetching/media behaviour, but coordinate its DOM updates
 * with the storefront's sticky header and single document scroll owner. */
export function installProductReviewPagination(
  container: HTMLElement,
  onState: (state: PaginationState) => void,
  reveal: () => void,
  showLoading: () => void = () => {},
) {
  let pending = false;
  let previousPage = "";
  let requestedPage = "";
  let previousReviews = "";
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  const originalMinHeight = container.style.minHeight;
  const page = () => container.querySelector(".jdgm-curt")?.getAttribute("data-page") || "";
  const reviews = () => [...container.querySelectorAll(".jdgm-rev")]
    .map((review) => review.getAttribute("data-review-id") || review.textContent).join("|");
  const settle = (state: "ready" | "error") => {
    pending = false;
    clearTimeout(deadline);
    cancelAnimationFrame(frame);
    container.style.minHeight = originalMinHeight;
    onState(state);
  };
  const click = (event: MouseEvent) => {
    const control = (event.target as Element | null)?.closest?.(".jdgm-paginate__page");
    if (!control || !container.contains(control) || control.classList.contains("jdgm-curt")) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (pending) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const destination = control.getAttribute("data-page");
    if (!destination) return;
    cancelAnimationFrame(frame);
    previousPage = page();
    requestedPage = destination;
    previousReviews = reviews();
    pending = true;
    container.style.minHeight = `${container.getBoundingClientRect().height}px`;
    onState("loading");
    frame = requestAnimationFrame(showLoading);
    // A provider failure must not leave our controls permanently locked.
    deadline = setTimeout(() => settle("error"), 15000);
  };
  const observer = new MutationObserver(() => {
    const nextReviews = reviews();
    if (!pending || page() !== requestedPage || page() === previousPage || !nextReviews || nextReviews === previousReviews) return;
    // Judge.me focuses the first card synchronously after replacing the list.
    // Correct that native scroll only after the new layout and focus have settled.
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!pending || page() !== requestedPage || !reviews() || reviews() === previousReviews) return;
      settle("ready");
      reveal();
    });
  });
  observer.observe(container, { childList: true, subtree: true });
  container.addEventListener("click", click, true);
  return () => {
    pending = false;
    clearTimeout(deadline);
    cancelAnimationFrame(frame);
    observer.disconnect();
    container.removeEventListener("click", click, true);
    container.style.minHeight = originalMinHeight;
  };
}
