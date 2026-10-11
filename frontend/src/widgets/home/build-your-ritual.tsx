"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { useStore } from "@/features/store/store-provider";
import { installRitualSectionMotion } from "./build-your-ritual-motion";
import styles from "./build-your-ritual.module.css";

export function BuildYourRitual() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const { content: { motionSettings } } = useStore();

  useEffect(() => {
    if (panelRef.current) return installRitualSectionMotion(panelRef.current, motionSettings);
  }, [motionSettings]);

  const handleProgress = useCallback((progress: { questionNumber: number; complete: boolean }) => {
    setStarted(progress.questionNumber > 1 || progress.complete);
  }, []);

  return (
    <section id="build-your-ritual" className={styles.section} aria-labelledby="builder-title" data-reveal-ignore>
      <div ref={panelRef} className={styles.panel} data-started={started}>
        <div className={styles.botanicalShadow} aria-hidden="true" />
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19.5 4.5c-7-1-14 2-14 8.5 0 3 2 5 5 5 6.5 0 9-6.5 9-13.5Z" />
                <path d="m4.5 20 10-10M9 15v-4m0 4h4" />
              </svg>
              Build your ritual
            </p>
            <h2 className={styles.heading} id="builder-title">
              <span className={styles.expandedHeading}>A little about you.<br /> <em>A ritual of your own.</em></span>
              <span className={styles.compactHeading}>Find your <em>ritual.</em></span>
            </h2>
            <p className={styles.body}>
              Tell us what you want from your hair-care routine. We&apos;ll help you find a thoughtful botanical place to begin.
            </p>
            <p className={styles.note}>A few questions, shaped by your answers.</p>
            <div className={styles.introRule} aria-hidden="true" />
          </div>
          <div className={styles.quiz}>
            <RitualFinder onProgress={handleProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}
