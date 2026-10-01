"use client";

import { useEffect } from "react";
import { extractNumericProductId, isJudgemeConfigured } from "@/lib/judgeme/config";
import { useHydrated } from "@/shared/hooks/use-hydrated";

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
      {processedHtml ? (
        <div
          key={numericId || productHandle}
          className="jdgm-widget jdgm-review-widget"
          data-id={numericId || undefined}
          data-product-title={productTitle}
          data-product-handle={productHandle}
          data-auto-install="false"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      ) : (
        <div
          key={numericId || productHandle}
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
