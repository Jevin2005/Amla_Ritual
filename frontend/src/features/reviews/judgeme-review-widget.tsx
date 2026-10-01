"use client";

import { useEffect } from "react";
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

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [numericId, productHandle, enabled]);

  if (!enabled) return null;

  const processedHtml = initialHtml
    ? initialHtml.replace(/<style class=['"]jdgm-temp-hiding-style['"]>[\s\S]*?<\/style>/gi, "")
    : null;

  return (
    <div className={`judgeme-review-widget-container ${className}`}>
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
