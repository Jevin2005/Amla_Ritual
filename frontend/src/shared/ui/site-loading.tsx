"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingIndicator } from "./loading-indicator";
import { installPageLoading, NAVIGATION_COMMIT, type LoadingPhase } from "./page-loading";
import styles from "./site-loading.module.css";

function NavigationCommit() {
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.toString();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(NAVIGATION_COMMIT, { detail: pathname + (search ? `?${search}` : "") }));
  }, [pathname, search]);
  return null;
}

export function SiteLoading() {
  const [phase, setPhase] = useState<LoadingPhase>("startup");
  useEffect(() => installPageLoading(window, setPhase), []);
  useEffect(() => {
    if (phase !== "startup") return;
    const content = document.getElementById("site-content");
    if (!content) return;
    const previousInert = content.inert;
    content.inert = true;
    return () => { content.inert = previousInert; };
  }, [phase]);

  return <>
    <Suspense fallback={null}><NavigationCommit /></Suspense>
    <noscript><style>{"#site-startup-loader{display:none!important}img[aria-busy=true]{background:none!important;animation:none!important}"}</style></noscript>
    {phase === "startup" && <div id="site-startup-loader" className={styles.startup}>
      <div className={styles.brand}>NatureMist<span>Botanical rituals</span></div>
      <div className={styles.startupContent}>
        <span className={styles.eyebrow}>Rooted in nature</span>
        <h2 className={styles.heading}>A moment for<br /><em>your ritual.</em></h2>
        <LoadingIndicator label="Preparing your botanical world…" />
      </div>
      <div className={styles.signature} aria-hidden="true"><span />Nature, at your own pace.<span /></div>
    </div>}
    {phase === "navigation" && <div className={styles.navigation} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.navigationTrack} aria-hidden="true" />
      <span className={styles.navigationLabel}>Opening your next chapter…</span>
    </div>}
  </>;
}
