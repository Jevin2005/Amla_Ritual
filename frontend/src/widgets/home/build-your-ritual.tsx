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
        <div className={styles.grid}>
          <div className={styles.intro}>
            <div className={styles.botanicalShadow} aria-hidden="true" />
            <p className={styles.eyebrow}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19.5 4.5c-7-1-14 2-14 8.5 0 3 2 5 5 5 6.5 0 9-6.5 9-13.5Z" />
                <path d="m4.5 20 10-10M9 15v-4m0 4h4" />
              </svg>
              A ritual, made for you
            </p>
            <h2 className={styles.heading} id="builder-title">
              Find your <em>ritual.</em>
            </h2>
            <p className={styles.body}>
              A hair pack, herbal wash or colour step. Share your routine preferences and explore the botanicals that fit.
            </p>
            <ol className={styles.introSteps} aria-label="How the ritual finder works" role="list">
              <li><span aria-hidden="true">01</span> Share your goal</li>
              <li><span aria-hidden="true">02</span> Shape your routine</li>
              <li><span aria-hidden="true">03</span> Discover your match</li>
            </ol>
            <div className={styles.botanicalArt} aria-hidden="true" />
            <p className={styles.note}>A few questions. Your own way to care.</p>
          </div>
          <div className={styles.quiz}>
            <RitualFinder onProgress={handleProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}
