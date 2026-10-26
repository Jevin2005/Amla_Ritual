"use client";

import { useEffect, useRef, useState } from "react";
import { extractNumericProductId, isJudgemeConfigured } from "@/lib/judgeme/config";
import { installProductReviewPagination } from "@/lib/judgeme/product-pagination";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { scrollPageTo } from "@/shared/ui/page-scroll";
import { ReviewPageLoader } from "./review-page-loader";

type JudgemeReviewWidgetProps = {
  productId?: string | null;
  productTitle: string;
  productHandle: string;
  initialHtml?: string | null;
  className?: string;
};

export function JudgemeReviewWidget({
  productId,
  productTitle,
  productHandle,
  initialHtml,
  className = "",
}: JudgemeReviewWidgetProps) {
  const numericId = extractNumericProductId(productId);
  const enabled = isJudgemeConfigured();
  const hydrated = useHydrated();
  const containerRef = useRef<HTMLDivElement>(null);
  const [paginationState, setPaginationState] = useState<"loading" | "ready" | "error">("ready");

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !hydrated || !container) return;
    return installProductReviewPagination(container, setPaginationState, () => {
      container.focus({ preventScroll: true });
      scrollPageTo(container, { immediate: true });
    }, () => scrollPageTo(container, { immediate: true }));
  }, [numericId, productHandle, enabled, hydrated]);

  useEffect(() => {
    if (!enabled || !hydrated) return;

    function init() {
      try {
        if (
          typeof window !== "undefined" &&
          typeof window.jdgm?.initializeWidgets === "function" &&
          typeof (window.jdgm as Record<string, unknown>)._addEmptyWidgetHeader === "function"
        ) {
          window.jdgm.initializeWidgets();
        }
      } catch (err) {
        console.warn("[Judge.me Review Widget] Deferred init:", err);
      }
    }

    init();
    window.addEventListener("judgeme:ready", init);
    const timer1 = setTimeout(init, 250);
    const timer2 = setTimeout(init, 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("judgeme:ready", init);
    };
  }, [numericId, productHandle, enabled, hydrated]);

  if (!enabled) return null;
  if (!hydrated) return <div className={`judgeme-review-widget-container ${className}`} aria-busy="true"><p className="text-sm text-[var(--muted)]">Loading customer reviews…</p></div>;

  const processedHtml = initialHtml
    ? initialHtml.replace(/<style class=['"]jdgm-temp-hiding-style['"]>[\s\S]*?<\/style>/gi, "")
    : null;

  return (
    <div className={`judgeme-review-widget-container ${className}`}>
      <div role="status" aria-live="polite" aria-atomic="true" className="product-review-page-status">
        {paginationState === "loading" && <span className="sr-only">Loading customer reviews…</span>}
        {paginationState === "error" && <>
          Reviews are taking longer to load. <button type="button" onClick={() => window.location.reload()} className="underline underline-offset-4">Refresh reviews</button>
        </>}
      </div>
      <div ref={containerRef} tabIndex={-1} role="region" aria-label={`Reviews for ${productTitle}`} aria-busy={paginationState === "loading"} className="product-review-pages">
      {paginationState === "loading" && <ReviewPageLoader />}
      {processedHtml ? (
        <div
          key={numericId || productHandle}
          className="jdgm-widget jdgm-review-widget jdgm-outside-widget"
          data-id={numericId || undefined}
          data-product-title={productTitle}
          data-product-handle={productHandle}
          data-auto-install="false"
          data-not-scroll-to="true"
          inert={paginationState === "loading"}
          aria-hidden={paginationState === "loading" || undefined}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      ) : (
        <div
          key={numericId || productHandle}
          className="jdgm-widget jdgm-review-widget jdgm-outside-widget"
          data-id={numericId || undefined}
          data-product-title={productTitle}
          data-product-handle={productHandle}
          data-auto-install="false"
          data-not-scroll-to="true"
          inert={paginationState === "loading"}
          aria-hidden={paginationState === "loading" || undefined}
        />
      )}
      </div>
    </div>
  );
}
