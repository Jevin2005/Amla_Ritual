"use client";

import Script from "next/script";
import { useEffect } from "react";
import {
  getJudgemePublicToken,
  getJudgemeShopDomain,
  isJudgemeConfigured,
} from "@/lib/judgeme/config";
import defaultJudgemeSettings from "@/lib/judgeme/judgeme-settings.json";

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN?: string;
      PLATFORM?: string;
      PUBLIC_TOKEN?: string;
      initializeWidgets?: () => void;
      [key: string]: unknown;
    };
    jdgmSettings?: Record<string, unknown>;
  }
}

export function JudgemeScript() {
  if (!isJudgemeConfigured()) return null;

  const shopDomain = getJudgemeShopDomain();
  const publicToken = getJudgemePublicToken();

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.jdgm?.initializeWidgets === "function" &&
        typeof (window.jdgm as Record<string, unknown>)._addEmptyWidgetHeader === "function"
      ) {
        window.jdgm.initializeWidgets();
      }
    } catch (err) {
      console.warn("[Judge.me] Deferred initialization:", err);
    }
  }, []);

  return (
    <>
      <Script
        id="judgeme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.jdgm = window.jdgm || {};
            window.jdgm.SHOP_DOMAIN = ${JSON.stringify(shopDomain)};
            window.jdgm.PLATFORM = 'shopify';
            ${publicToken ? `window.jdgm.PUBLIC_TOKEN = ${JSON.stringify(publicToken)};` : ""}
            window.jdgmSettings = window.jdgmSettings || ${JSON.stringify(defaultJudgemeSettings)};
            var jdgmSettings = window.jdgmSettings;
            if (!window.jdgm._addEmptyWidgetHeader) {
              window.jdgm._addEmptyWidgetHeader = function() {};
            }
            if (!window.jdgm._customizeReviewWidget) {
              window.jdgm._customizeReviewWidget = function() {};
            }
          `,
        }}
      />
      <Script
        id="judgeme-widget-js"
        src="https://cdn.judge.me/widget_v2.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            if (
              typeof window !== "undefined" &&
              typeof window.jdgm?.initializeWidgets === "function" &&
              typeof (window.jdgm as Record<string, unknown>)._addEmptyWidgetHeader === "function"
            ) {
              window.jdgm.initializeWidgets();
            }
          } catch (err) {
            console.warn("[Judge.me] onLoad initialization:", err);
          }
        }}
      />
    </>
  );
}
