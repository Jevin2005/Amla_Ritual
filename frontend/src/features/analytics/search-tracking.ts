"use client";

import { useEffect, useRef } from "react";
import { safeSearchTerm } from "./ecommerce";
import { trackSearchView, type SearchViewDelivery } from "./runtime";

const READY_EVENTS = ["naturemist:analytics-ready", "visitorConsentCollected", "consentTrackingApiLoaded", "shopifyCustomerPrivacyApiLoaded", "naturemist:consent"];

/** Measure only the currently displayed, settled search; never publish raw free text. */
export function useSearchTracking(query: string, vocabulary: Parameters<typeof safeSearchTerm>[1], resultCount: number, enabled: boolean) {
  const currentSearch = useRef<{ key: string; complete: boolean; delivery: SearchViewDelivery }>({ key: "", complete: false, delivery: {} });
  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (!term) { currentSearch.current = { key: "", complete: false, delivery: {} }; return; }
    const key = `${term}:${resultCount}`;
    if (currentSearch.current.key !== key) currentSearch.current = { key, complete: false, delivery: {} };
    if (!enabled) return;
    const search = currentSearch.current;
    let settled = false;
    const record = () => {
      if (!settled || search.complete) return;
      search.complete = trackSearchView({ search_term: safeSearchTerm(term, vocabulary), result_count: resultCount }, search.delivery);
    };
    const timer = window.setTimeout(() => { settled = true; record(); }, 600);
    for (const event of READY_EVENTS) document.addEventListener(event, record);
    return () => {
      window.clearTimeout(timer);
      for (const event of READY_EVENTS) document.removeEventListener(event, record);
    };
  }, [query, vocabulary, resultCount, enabled]);
}
