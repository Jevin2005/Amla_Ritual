"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./botanical-book-turn.module.css";

type BotanicalBookTurnProps = {
  direction: 1 | -1;
  /** Total duration of the complete page turn, in milliseconds. */
  duration: number;
  outgoingLeft: ReactNode;
  outgoingRight: ReactNode;
  incomingLeft: ReactNode;
  incomingRight: ReactNode;
  onComplete: () => void;
};

export function BotanicalBookTurn({
  direction,
  duration,
  outgoingLeft,
  outgoingRight,
  incomingLeft,
  incomingRight,
  onComplete,
}: BotanicalBookTurnProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingShadeRef = useRef<HTMLDivElement>(null);
  const incomingShadeRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completionSentRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const outgoing = outgoingRef.current;
    const incoming = incomingRef.current;
    const outgoingShade = outgoingShadeRef.current;
    const incomingShade = incomingShadeRef.current;
    const shadow = shadowRef.current;
    if (!overlay || !outgoing || !incoming || !outgoingShade || !incomingShade || !shadow) return;

    let disposed = false;
    let completed = false;
    let observedSize: { width: number; height: number } | null = null;
    let readinessTimeout: number | undefined;
    let releaseReadinessWait: (() => void) | undefined;
    const animations: Animation[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const turnDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

    function complete() {
      if (disposed || completed || completionSentRef.current) return;
      completed = true;
      completionSentRef.current = true;
      window.clearTimeout(readinessTimeout);
      releaseReadinessWait?.();
      // A resize or interrupted animation still settles on the incoming spread.
      // Keep its final frame until the parent commits and removes this overlay.
      for (const animation of animations) {
        try {
          animation.finish();
        } catch {
          animation.cancel();
        }
      }
      onCompleteRef.current();
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      if (event.matches) complete();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") complete();
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (!observedSize) {
        observedSize = { width, height };
        return;
      }
      if (Math.abs(width - observedSize.width) > .5 || Math.abs(height - observedSize.height) > .5) complete();
    });
    observer.observe(overlay);
    window.addEventListener("resize", complete);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reduceMotion.addEventListener("change", handleMotionChange);

    async function prepareTurn() {
      if (turnDuration === 0 || reduceMotion.matches || document.visibilityState === "hidden" || typeof outgoing!.animate !== "function") {
        complete();
        return;
      }

      const images = Array.from(overlay!.querySelectorAll("img"));
      const decoded = await Promise.race([
        Promise.all(images.map((image) =>
          Promise.resolve().then(() => image.decode()).catch(() => undefined),
        )).then(() => true),
        new Promise<boolean>((resolve) => {
          releaseReadinessWait = () => resolve(false);
          readinessTimeout = window.setTimeout(releaseReadinessWait, 1000);
        }),
      ]);
      window.clearTimeout(readinessTimeout);
      releaseReadinessWait = undefined;
      if (disposed || completed || completionSentRef.current) return;
      // The live spread remains visible underneath during preparation. If a
      // snapshot cannot load promptly, settle directly rather than turn blank paper.
      if (!decoded || images.some((image) => !image.complete || image.naturalWidth === 0) || reduceMotion.matches || document.hidden) {
        complete();
        return;
      }

      // A single physical leaf cannot cover both the 44% and 56% pages without
      // stretching. Switch its two correctly sized faces only while edge-on.
      const outgoingEdge = direction === 1 ? "rotateY(-90deg)" : "rotateY(90deg)";
      const incomingEdge = direction === 1 ? "rotateY(90deg)" : "rotateY(-90deg)";
      const timing: KeyframeAnimationOptions = { duration: turnDuration, fill: "both", easing: "linear" };

      try {
        animations.push(outgoing!.animate([
          { transform: "rotateY(0deg)", offset: 0, easing: "cubic-bezier(.42, 0, .8, .55)" },
          { transform: outgoingEdge, offset: .5 },
          { transform: outgoingEdge, offset: 1 },
        ], timing));
        animations.push(incoming!.animate([
          { transform: incomingEdge, offset: 0 },
          { transform: incomingEdge, offset: .5, easing: "cubic-bezier(.2, .45, .58, 1)" },
          { transform: "rotateY(0deg)", offset: 1 },
        ], timing));
        animations.push(outgoingShade!.animate([
          { opacity: 0, offset: 0 },
          { opacity: .23, offset: .25 },
          { opacity: .62, offset: .5 },
          { opacity: .62, offset: 1 },
        ], timing));
        animations.push(incomingShade!.animate([
          { opacity: .62, offset: 0 },
          { opacity: .62, offset: .5 },
          { opacity: .2, offset: .76 },
          { opacity: 0, offset: 1 },
        ], timing));
        animations.push(shadow!.animate([
          { opacity: 0, transform: "scaleX(.12)", offset: 0 },
          { opacity: .22, transform: "scaleX(.65)", offset: .24 },
          { opacity: .42, transform: "scaleX(1)", offset: .5 },
          { opacity: .2, transform: "scaleX(.65)", offset: .76 },
          { opacity: 0, transform: "scaleX(.12)", offset: 1 },
        ], timing));

        // Pin all effects to the same timeline instant, including their midpoint.
        const startTime = document.timeline.currentTime;
        if (startTime !== null) {
          for (const animation of animations) animation.startTime = startTime;
        }
        overlay!.style.visibility = "visible";
        void Promise.all(animations.map((animation) => animation.finished)).then(complete, complete);
      } catch {
        complete();
      }
    }

    void prepareTurn();

    return () => {
      disposed = true;
      window.clearTimeout(readinessTimeout);
      releaseReadinessWait?.();
      overlay.style.visibility = "hidden";
      observer.disconnect();
      window.removeEventListener("resize", complete);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reduceMotion.removeEventListener("change", handleMotionChange);
      for (const animation of animations) animation.cancel();
    };
  }, [direction, duration]);

  const next = direction === 1;

  return (
    <div ref={overlayRef} className={styles.overlay} data-direction={next ? "next" : "previous"} aria-hidden="true" inert>
      <div className={`${styles.page} ${styles.left} ${styles.underlay}`}>
        <div className={styles.pageContent}>{next ? outgoingLeft : incomingLeft}</div>
      </div>
      <div className={`${styles.page} ${styles.right} ${styles.underlay}`}>
        <div className={styles.pageContent}>{next ? incomingRight : outgoingRight}</div>
      </div>
      <div ref={shadowRef} className={`${styles.castShadow} ${next ? styles.left : styles.right}`} />
      <div ref={outgoingRef} className={`${styles.page} ${styles.face} ${styles.outgoing} ${next ? styles.right : styles.left}`}>
        <div className={styles.pageContent}>{next ? outgoingRight : outgoingLeft}</div>
        <div ref={outgoingShadeRef} className={styles.faceShade} />
      </div>
      <div ref={incomingRef} className={`${styles.page} ${styles.face} ${styles.incoming} ${next ? styles.left : styles.right}`}>
        <div className={styles.pageContent}>{next ? incomingLeft : incomingRight}</div>
        <div ref={incomingShadeRef} className={styles.faceShade} />
      </div>
    </div>
  );
}
