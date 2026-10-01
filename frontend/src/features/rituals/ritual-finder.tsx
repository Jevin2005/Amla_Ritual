"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useStore } from "@/features/store/store-provider";
import { rankRitualProducts, ritualQuestions, type QuizAnswers } from "./guided-quiz";
import styles from "./ritual-finder.module.css";

type QuizState = { step: number; answers: QuizAnswers };

export function RitualFinder() {
  const [state, setState] = useState<QuizState>({ step: 1, answers: {} });
  const [hasNavigated, setHasNavigated] = useState(false);
  const { products, track, content } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(state.step);
  const quizId = useId();
  const { enabled: motionEnabled, cursor: cursorEnabled, intensity } = content.motionSettings;
  const motionActive = motionEnabled && intensity > 0;
  const { step, answers } = state;
  const question = ritualQuestions[step - 1];
  const complete = step > ritualQuestions.length;

  const ranked = useMemo(() => rankRitualProducts(products, answers), [products, answers]);
  const result = ranked[0];
  const resultImage = result
    ? result.product.featuredImage?.url || result.product.images?.[0]?.url
    : undefined;
  const alternatives = ranked.slice(1).map(({ product }) => product);

  // Keep intentional step changes in reach without stealing focus on hydration.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const question = cardRef.current?.querySelector<HTMLElement>("[data-ritual-question]");
    if (!question) return;
    question.focus({ preventScroll: true });
    const bounds = question.getBoundingClientRect();
    if (bounds.top < 96 || bounds.bottom > window.innerHeight - 32) {
      question.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [step]);

  // Native listeners keep pointer updates out of React's render cycle.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !motionActive) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cleanups: Array<() => void> = [];

    card.querySelectorAll<HTMLElement>("[data-ritual-option]").forEach((option) => {
      const surface = option.querySelector<HTMLElement>("[data-option-surface]");
      if (!surface) return;
      let bounds: DOMRect | null = null;
      let frame = 0;
      let nextX = 0;
      let nextY = 0;
      const ripples = new Set<HTMLElement>();
      const reset = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        bounds = null;
        option.style.removeProperty("--option-rx");
        option.style.removeProperty("--option-ry");
      };
      const enter = () => { bounds = option.getBoundingClientRect(); };
      const move = (event: MouseEvent) => {
        if (reducedMotion.matches || !finePointer.matches || !cursorEnabled || event.buttons || document.hidden) {
          reset();
          return;
        }
        bounds ??= option.getBoundingClientRect();
        nextX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
        nextY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
        if (frame) return;
        frame = requestAnimationFrame(() => {
          option.style.setProperty("--option-rx", `${(-nextY * 6 * Math.min(1, intensity)).toFixed(2)}deg`);
          option.style.setProperty("--option-ry", `${(nextX * 8 * Math.min(1, intensity)).toFixed(2)}deg`);
          frame = 0;
        });
      };
      const ripple = (event: MouseEvent) => {
        // A label forwards a second click to its radio; animate the original only.
        if (reducedMotion.matches || event.detail === 0 || event.target instanceof HTMLInputElement) return;
        const rect = option.getBoundingClientRect();
        const ink = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ink.className = styles.ripple;
        ink.setAttribute("aria-hidden", "true");
        ink.style.width = `${size}px`;
        ink.style.height = `${size}px`;
        ink.style.left = `${event.clientX - rect.left}px`;
        ink.style.top = `${event.clientY - rect.top}px`;
        surface.appendChild(ink);
        ripples.add(ink);
        ink.addEventListener("animationend", () => { ripples.delete(ink); ink.remove(); }, { once: true });
      };
      const mediaChange = () => {
        reset();
        ripples.forEach((ink) => ink.remove());
        ripples.clear();
      };
      option.addEventListener("mouseenter", enter);
      option.addEventListener("mousemove", move);
      option.addEventListener("mouseleave", reset);
      option.addEventListener("click", ripple);
      reducedMotion.addEventListener("change", mediaChange);
      finePointer.addEventListener("change", mediaChange);
      window.addEventListener("scroll", mediaChange, { passive: true, capture: true });
      window.addEventListener("resize", mediaChange, { passive: true });
      window.addEventListener("blur", mediaChange);
      document.addEventListener("visibilitychange", mediaChange);
      cleanups.push(() => {
        mediaChange();
        option.removeEventListener("mouseenter", enter);
        option.removeEventListener("mousemove", move);
        option.removeEventListener("mouseleave", reset);
        option.removeEventListener("click", ripple);
        reducedMotion.removeEventListener("change", mediaChange);
        finePointer.removeEventListener("change", mediaChange);
        window.removeEventListener("scroll", mediaChange, true);
        window.removeEventListener("resize", mediaChange);
        window.removeEventListener("blur", mediaChange);
        document.removeEventListener("visibilitychange", mediaChange);
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [step, motionActive, cursorEnabled, intensity]);

  const goToStep = (nextStep: number) => {
    setHasNavigated(true);
    setState((current) => ({ ...current, step: nextStep }));
  };

  const handleFinish = () => {
    if (!ritualQuestions.every((item) => answers[item.id])) return;
    setHasNavigated(true);
    setState((current) => ({ ...current, step: ritualQuestions.length + 1 }));
    track("quiz_completed", {
      recommendation: result?.product.slug,
      requires_colour_review: result?.requiresColourReview ?? false,
    });
  };

  const reset = () => {
    setHasNavigated(true);
    setState({ step: 1, answers: {} });
  };

  const optionCards: ReactNode[] = [];
  const addOption = (value: string, description: string, selected: boolean, select: () => void, index: number) => {
    optionCards.push(
      <label className={styles.option} key={value} data-ritual-option style={{ "--option-index": index } as CSSProperties}>
        <input
          className={styles.radioInput}
          type="radio"
          name={`${quizId}-${question?.id}`}
          value={value}
          checked={selected}
          onChange={select}
          aria-labelledby={`${quizId}-option-title-${index}`}
          aria-describedby={`${quizId}-option-description-${index}`}
        />
        <span className={styles.optionSurface} data-option-surface>
          <span className={styles.radioCircle} aria-hidden="true"><span /></span>
          <span className={styles.optionCopy}>
            <span className={styles.optionTitle} id={`${quizId}-option-title-${index}`}>{value}</span>
            <span className={styles.optionDescription} id={`${quizId}-option-description-${index}`}>{description}</span>
          </span>
        </span>
      </label>,
    );
  };
  question?.options.forEach((option, index) => addOption(
    option.value, option.copy, answers[question.id] === option.value,
    () => setState((current) => ({ ...current, answers: { ...current.answers, [question.id]: option.value } })), index,
  ));

  return (
    <div className={styles.card} ref={cardRef} data-motion={motionActive ? "on" : "off"}>
      <div className={styles.header}>
        <div className={styles.stepLabel}>
          <span>{complete ? "Your ritual" : `Step ${step} / ${ritualQuestions.length}`}</span>
          <span className={styles.headerDot} aria-hidden="true">·</span>
          <span className={styles.stepName}>{question?.label || "Chosen with care"}</span>
        </div>
        <div className={styles.progress} role="img" aria-label={complete ? "All questions complete" : `Step ${step} of ${ritualQuestions.length}`}>
          {ritualQuestions.map((item, index) => <span key={item.id} className={styles.progressPill}><span data-filled={step > index} /></span>)}
        </div>
      </div>

      <div className={styles.step} key={step} data-enter={hasNavigated}>
        {!complete ? (
          <>
            <fieldset className={styles.fieldset}>
              <legend className={styles.question} tabIndex={-1} data-ritual-question>
                {question.question}
              </legend>
              <div className={styles.options}>{optionCards}</div>
            </fieldset>
            <div className={styles.footer}>
              {step > 1 && <button type="button" className={styles.textButton} onClick={() => goToStep(step - 1)}><span aria-hidden="true">←</span> Back</button>}
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!answers[question.id]}
                onClick={step < ritualQuestions.length ? () => goToStep(step + 1) : handleFinish}
              >
                {step < ritualQuestions.length ? "Continue" : "Find my ritual"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        ) : (
          <div className={styles.result}>
            <p className={styles.resultLabel}>A simple place to begin</p>
            {result ? (
              <div className={styles.resultDetails}>
                <div className={styles.productImage}>
                  {resultImage ? <Image src={resultImage} alt={result.product.featuredImage?.altText || result.product.name} fill sizes="150px" className={styles.image} /> : <span className={styles.imagePlaceholder}>Botanical<br />ritual</span>}
                </div>
                <div className={styles.resultCopy}>
                  <h3 className={styles.resultTitle} tabIndex={-1} data-ritual-question>{result.product.name}</h3>
                  <p className={styles.resultDescription}>{result.guidance || result.product.shortDescription}</p>
                  <ul className={styles.matchReasons}>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                </div>
              </div>
            ) : (
              <div className={styles.emptyResult}>
                <h3 className={styles.resultTitle} tabIndex={-1} data-ritual-question>Your ritual starts here.</h3>
                <p className={styles.resultDescription}>We couldn&apos;t find a product match just now. Explore our ritual guide for a thoughtful place to begin, or try your answers again.</p>
              </div>
            )}
            <ul className={styles.tags} aria-label="Your ritual choices">
              {ritualQuestions.map((item) => <li key={item.id}>{answers[item.id]}</li>)}
            </ul>
            {alternatives.length > 0 && <details className={styles.alternatives}>
              <summary>Other matching botanicals ({alternatives.length})</summary>
              <ul>{alternatives.map((product) => <li key={product.id}><Link href={`/shop/${product.slug}`}>{product.name}</Link></li>)}</ul>
            </details>}
            <div className={styles.resultFooter}>
              <button type="button" className={styles.textButton} onClick={reset}><span aria-hidden="true">↺</span> Start over</button>
              <Link className={styles.primaryButton} href={result ? `/shop/${result.product.slug}` : "/rituals"}>View ritual <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
