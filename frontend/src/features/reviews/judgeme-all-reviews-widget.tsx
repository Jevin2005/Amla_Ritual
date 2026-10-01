"use client";

import { useEffect, useRef, useState } from "react";
import { ReviewPagination } from "./review-pagination";
import { useStore } from "@/features/store/store-provider";
import type { JudgemeAllReviewsPage, JudgemeReviewType } from "@/lib/judgeme/all-reviews";

type VendorCollection = {
  add: (element: HTMLElement) => VendorCollection;
  not: (element: HTMLElement) => VendorCollection;
  find: (selector: string) => VendorCollection;
};

type VendorMedia = {
  $?: (element: HTMLElement) => VendorCollection;
  caches?: { $widgetWithReviews?: VendorCollection };
  customizeReviews?: () => void;
  setupMediaGallery?: (collection: VendorCollection) => void;
  _setupVideoPlayers?: (collection: VendorCollection) => void;
};

type JudgemeAllReviewsWidgetProps = {
  initialPage?: JudgemeAllReviewsPage | null;
  className?: string;
};

export function JudgemeAllReviewsWidget({
  initialPage = null,
  className = "",
}: JudgemeAllReviewsWidgetProps) {
  const { products } = useStore();
  const [current, setCurrent] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialPage ? "" : "Reviews could not be loaded. Please try again.");
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const retryRef = useRef({ page: 1, reviewType: "product-reviews" as JudgemeReviewType });

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !current?.html) return;
    let attempts = 0;
    let registered = false;

    // Product names and legacy Shopify handles resolve against the current
    // catalogue, so the footer opens the product the customer reviewed.
    for (const card of element.querySelectorAll<HTMLElement>(".jdgm-rev")) {
      const info = card.querySelector<HTMLElement>(".jdgm-rev__prod-info-wrapper");
      const existingLink = info?.querySelector<HTMLElement>(".jdgm-rev__prod-link");
      const title = (card.dataset.reviewProductName || card.dataset.productTitle
        || info?.querySelector(".review-product-name, .jdgm-rev__prod-title")?.textContent
        || existingLink?.textContent || "").trim();
      const handle = (card.dataset.productUrl || "").match(/\/products\/([^/?#]+)/)?.[1];
      const product = products.find((item) => item.name.toLowerCase() === title.toLowerCase())
        || (handle ? products.find((item) => item.shopifyHandle === handle) : undefined);
      const href = product ? `/shop/${product.slug}` : existingLink?.getAttribute("href");
      if (!info && !product) continue;
      card.dataset.reviewProductName = product?.name || title;

      const footer = info || document.createElement("div");
      footer.className = "jdgm-rev__prod-info-wrapper";
      const link = document.createElement(href ? "a" : "span");
      link.className = "jdgm-rev__prod-link";
      if (href) {
        link.setAttribute("href", href);
        link.setAttribute("aria-label", `View product: ${product?.name || title}`);
      }
      const name = document.createElement("span");
      name.className = "review-product-name";
      name.textContent = product?.name || title;
      link.append(name);
      if (href) {
        const action = document.createElement("span");
        action.className = "review-product-action";
        action.textContent = "View product";
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = " ↗";
        action.append(arrow);
        link.append(action);
      }
      footer.replaceChildren(link);
      card.append(footer);
    }

    // Reuse the provider's photo lightbox and video players, while React owns
    // numbered pages. The native AllReviewsPage constructor appends every page.
    const initializeMedia = () => {
      const vendor = window.jdgm as VendorMedia | undefined;
      if (!vendor?.$ || !vendor.customizeReviews || !vendor.setupMediaGallery || !vendor.caches) return false;
      const collection = vendor.$(element);
      if (vendor.caches.$widgetWithReviews) {
        vendor.caches.$widgetWithReviews = vendor.caches.$widgetWithReviews.add(element);
        registered = true;
      }
      vendor.customizeReviews();
      vendor.setupMediaGallery(collection);
      vendor._setupVideoPlayers?.(collection.find(".jdgm-vid-player"));
      return true;
    };

    let timer: ReturnType<typeof setInterval> | undefined;
    if (!initializeMedia()) {
      timer = setInterval(() => {
        attempts += 1;
        if (initializeMedia() || attempts >= 60) clearInterval(timer);
      }, 250);
    }
    return () => {
      clearInterval(timer);
      const vendor = window.jdgm as VendorMedia | undefined;
      if (registered && vendor?.caches?.$widgetWithReviews) {
        vendor.caches.$widgetWithReviews = vendor.caches.$widgetWithReviews.not(element);
      }
    };
  }, [current, products]);

  async function loadPage(page: number, reviewType: JudgemeReviewType) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    retryRef.current = { page, reviewType };
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/reviews/all?page=${page}&type=${reviewType}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Unable to load reviews");
      const nextPage = await response.json() as JudgemeAllReviewsPage;
      if (controller.signal.aborted) return;
      setCurrent(nextPage);
      requestAnimationFrame(() => {
        containerRef.current?.focus({ preventScroll: true });
        containerRef.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
      });
    } catch {
      if (!controller.signal.aborted) setError("Reviews could not be loaded. Please try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  const reviewType = current?.reviewType || "product-reviews";
  const total = reviewType === "product-reviews" ? current?.productReviewCount : current?.shopReviewCount;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`judgeme-all-reviews-widget-container scroll-mt-28 outline-none ${className}`}
      aria-label="Customer reviews"
      aria-busy={loading}
    >
      {current && current.shopReviewCount > 0 && (
        <div className="mx-auto mb-7 flex w-fit max-w-full gap-2" role="group" aria-label="Review type">
          {([
            ["product-reviews", "Product reviews", current.productReviewCount],
            ["shop-reviews", "Store reviews", current.shopReviewCount],
          ] as const).map(([type, label, count]) => (
            <button
              key={type}
              type="button"
              disabled={loading}
              aria-pressed={reviewType === type}
              aria-controls="judgeme-all-review-cards"
              onClick={() => void loadPage(1, type)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 py-2 text-[0.69rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:opacity-60 sm:gap-3 sm:px-5 sm:text-[0.73rem] ${reviewType === type ? "border-[var(--forest)] bg-[var(--forest)] text-[#fffdf8]" : "border-[#deded1] bg-[#fffdf7] text-[#6c7165] hover:border-[var(--forest)] hover:text-[var(--forest)]"}`}
            >
              {label}
              <span className={`text-[0.65rem] tabular-nums ${reviewType === type ? "text-[#e0d5bd]" : "text-[#8e8d80]"}`}>{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className={loading ? "mb-4 text-xs tracking-wide text-[#817052]" : "sr-only"} role="status" aria-live="polite">
        {loading ? "Loading reviews…" : ""}
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#ded8cb] bg-[#fffdf8] px-4 py-3" role="alert">
          <p className="m-0 text-sm text-[var(--muted)]">{error}</p>
          <button type="button" onClick={() => void loadPage(retryRef.current.page, retryRef.current.reviewType)} className="min-h-11 rounded-full border border-[#ded8cb] px-4 py-2 text-xs font-semibold text-[var(--forest)] transition-colors hover:bg-[#eeeadf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]">
            Try again
          </button>
        </div>
      )}

      {current && (
        <>
          <div
            key={`${current.reviewType}-${current.page}`}
            ref={contentRef}
            id="judgeme-all-review-cards"
            className="jdgm-widget jdgm-all-reviews__body grid grid-cols-1 items-start gap-5 md:grid-cols-2"
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
          {total === 0 && (
            <p className="py-8 text-center text-sm text-[var(--muted)]">No {reviewType === "shop-reviews" ? "store" : "product"} reviews have been published yet.</p>
          )}
          <fieldset disabled={loading} className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">Review pages</legend>
            <ReviewPagination
              page={current.page}
              totalItems={total || 0}
              pageSize={6}
              label={reviewType === "shop-reviews" ? "Store reviews" : "Product reviews"}
              controlsId="judgeme-all-review-cards"
              onPageChange={(page) => void loadPage(page, reviewType)}
            />
          </fieldset>
        </>
      )}
    </div>
  );
}
