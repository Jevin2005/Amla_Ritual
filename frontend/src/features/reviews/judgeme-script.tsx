"use client";

import Script from "next/script";
import { useState } from "react";
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
  const enabled = isJudgemeConfigured();
  const shopDomain = getJudgemeShopDomain();
  const publicToken = getJudgemePublicToken();
  const [configured, setConfigured] = useState(false);

  function initializeWidgets() {
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
    window.dispatchEvent(new Event("judgeme:ready"));
  }

  if (!enabled) return null;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.judge.me/judgeme_widget_v2.css"
        precedence="judgeme"
      />
      <Script
        id="judgeme-init"
        strategy="afterInteractive"
        onReady={() => setConfigured(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.jdgm = window.jdgm || {};
            window.jdgm.SHOP_DOMAIN = ${JSON.stringify(shopDomain)};
            window.jdgm.PLATFORM = 'shopify';
            ${publicToken ? `window.jdgm.PUBLIC_TOKEN = ${JSON.stringify(publicToken)};` : ""}
            window.jdgmSettings = window.jdgmSettings || ${JSON.stringify(defaultJudgemeSettings)};
            var jdgmSettings = window.jdgmSettings;
          `.replace(/</g, "\\u003c"),
        }}
      />
      {configured && <Script
        id="judgeme-widget-js"
        src="https://cdn.judge.me/judgeme_widget_v2.js"
        strategy="afterInteractive"
        onReady={initializeWidgets}
      />}
    </>
  );
}
