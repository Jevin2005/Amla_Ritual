"use client";

import { useEffect, useRef } from "react";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { useStore } from "@/features/store/store-provider";
import { installRitualSectionMotion } from "./build-your-ritual-motion";
import styles from "./build-your-ritual.module.css";

export function BuildYourRitual() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { content: { motionSettings } } = useStore();

  useEffect(() => {
    if (panelRef.current) return installRitualSectionMotion(panelRef.current, motionSettings);
  }, [motionSettings]);

  return (
    <section className={styles.section} aria-labelledby="builder-title" data-reveal-ignore>
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.spotlight} data-ritual-spotlight aria-hidden="true" />
        <div className={styles.ambient} aria-hidden="true">
          <span className={styles.ringOne} />
          <span className={styles.ringTwo} />
          <span className={styles.disc} />
        </div>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow} data-ritual-reveal>
              <span aria-hidden="true" /> Build your ritual
            </p>
            <h2 className={styles.heading} id="builder-title">
              <span data-ritual-reveal>A botanical starting</span>
              <span data-ritual-reveal>point, <em>chosen with care.</em></span>
            </h2>
            <p className={styles.body} data-ritual-reveal>
              Tell us your ritual goal and how your hair feels today. We&apos;ll suggest a simple place to begin—never a diagnosis or a promise.
            </p>
            <dl className={styles.stats} data-ritual-reveal>
              <div><dt>Questions</dt><dd>2</dd></div>
              <div><dt>To finish</dt><dd>30s</dd></div>
            </dl>
          </div>
          <div className={styles.quiz} data-ritual-reveal>
            <RitualFinder />
          </div>
        </div>
      </div>
    </section>
  );
}
