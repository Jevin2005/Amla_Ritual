"use client";

import { useEffect } from "react";
import { extractNumericProductId, isJudgemeConfigured } from "@/lib/judgeme/config";

type JudgemePreviewBadgeProps = {
  productId?: string | null;
  initialHtml?: string | null;
  className?: string;
};

export function JudgemePreviewBadge({
  productId,
  initialHtml,
  className = "",
}: JudgemePreviewBadgeProps) {
  const numericId = extractNumericProductId(productId);
  const enabled = isJudgemeConfigured();

  useEffect(() => {
    if (!enabled || !numericId) return;

    function init() {
      try {
        if (typeof window !== "undefined") {
          const jdgm = window.jdgm as Record<string, unknown> | undefined;
          if (typeof jdgm?.loadBadgesInContainer === "function") {
            (jdgm.loadBadgesInContainer as () => void)();
          } else if (
            typeof jdgm?.initializeWidgets === "function" &&
            typeof jdgm?._addEmptyWidgetHeader === "function"
          ) {
            (jdgm.initializeWidgets as () => void)();
          }
        }
      } catch (err) {
        console.warn("[Judge.me Preview Badge] Deferred init:", err);
      }
    }

    init();
    const timer = setTimeout(init, 300);
    return () => clearTimeout(timer);
  }, [numericId, enabled]);

  if (!enabled || !numericId) return null;

  return (
    <div className={`judgeme-preview-badge-container inline-block ${className}`}>
      {initialHtml ? (
        <div
          className="jdgm-widget jdgm-preview-badge"
          data-id={numericId}
          data-template="manual-installation"
          data-auto-install="false"
          dangerouslySetInnerHTML={{
            __html: initialHtml.replace(/style=['"]display:\s*none['"]/gi, "style='display:inline-flex'"),
          }}
        />
      ) : (
        <div
          className="jdgm-widget jdgm-preview-badge"
          data-id={numericId}
          data-template="manual-installation"
          data-auto-install="false"
        />
      )}
    </div>
  );
}
