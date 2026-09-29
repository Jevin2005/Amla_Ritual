"use client";

import { useEffect, useRef } from "react";
import { isJudgemeConfigured } from "@/lib/judgeme/config";

type JudgemeAllReviewsWidgetProps = {
  className?: string;
};

export function JudgemeAllReviewsWidget({
  className = "",
}: JudgemeAllReviewsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
        console.warn("[Judge.me All Reviews Widget] Deferred init:", err);
      }
    }

    init();
    const timer1 = setTimeout(init, 300);
    const timer2 = setTimeout(init, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={`judgeme-all-reviews-widget-container ${className}`}
      ref={containerRef}
    >
      <div
        className="jdgm-widget jdgm-all-reviews-widget"
        data-from-snippet="true"
        data-auto-install="false"
      />
    </div>
  );
}
