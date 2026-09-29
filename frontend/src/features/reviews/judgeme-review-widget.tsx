"use client";

import { useEffect, useRef } from "react";
import { extractNumericProductId, isJudgemeConfigured } from "@/lib/judgeme/config";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const numericId = extractNumericProductId(productId);
  const enabled = isJudgemeConfigured();

  useEffect(() => {
    if (!enabled) return;

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
    const timer1 = setTimeout(init, 250);
    const timer2 = setTimeout(init, 750);

    // Amazon/Flipkart-style deep-link handler
    // If URL has ?write_review=true, #customer-reviews, or ?email=buyer@example.com
    const handleDeepLink = () => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      const shouldWriteReview =
        url.searchParams.get("write_review") === "true" ||
        url.searchParams.get("review") === "true" ||
        url.hash === "#customer-reviews";
      const buyerEmail = url.searchParams.get("email");

      if (shouldWriteReview) {
        // Smooth scroll to reviews section
        const widgetContainer = containerRef.current;
        if (widgetContainer) {
          widgetContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Auto-expand "Write a review" form
        setTimeout(() => {
          const writeBtn = containerRef.current?.querySelector<HTMLElement>(
            ".jdgm-write-rev-btn",
          );
          if (writeBtn && !containerRef.current?.querySelector(".jdgm-form-wrapper:not([style*='display: none'])")) {
            writeBtn.click();
          }

          // Pre-fill original buyer email if provided in deep-link
          if (buyerEmail) {
            const emailInput = containerRef.current?.querySelector<HTMLInputElement>(
              "input[name='reviewer_email'], input.jdgm-form__reviewer-email, .jdgm-form-wrapper input[type='email']",
            );
            if (emailInput && !emailInput.value) {
              emailInput.value = buyerEmail;
              emailInput.dispatchEvent(new Event("input", { bubbles: true }));
              emailInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }, 800);
      }
    };

    const linkTimer = setTimeout(handleDeepLink, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(linkTimer);
    };
  }, [numericId, productHandle, enabled]);

  if (!enabled) return null;

  const processedHtml = initialHtml
    ? initialHtml.replace(/<style class=['"]jdgm-temp-hiding-style['"]>[\s\S]*?<\/style>/gi, "")
    : null;

  return (
    <div className={`judgeme-review-widget-container ${className}`} ref={containerRef}>
      {processedHtml ? (
        <div
          className="jdgm-widget jdgm-review-widget"
          data-id={numericId || undefined}
          data-product-title={productTitle}
          data-product-handle={productHandle}
          data-auto-install="false"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      ) : (
        <div
          className="jdgm-widget jdgm-review-widget"
          data-id={numericId || undefined}
          data-product-title={productTitle}
          data-product-handle={productHandle}
          data-auto-install="false"
        />
      )}
    </div>
  );
}
