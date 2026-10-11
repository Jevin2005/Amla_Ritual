"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useStore } from "@/features/store/store-provider";
import { useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { MediaImage } from "@/shared/ui/media-image";
import { getQuizFlow, resolveQuizResult, setQuizAnswer, type QuizAnswers, type QuizQuestion } from "./guided-quiz";
import { createQuizNavigation, type QuizNavigation } from "./ritual-navigation";
import styles from "./ritual-finder.module.css";

type QuizState = { answers: QuizAnswers; cursor: number; showResult: boolean };
type RitualFinderProps = {
  onProgress?: (progress: { questionNumber: number; complete: boolean }) => void;
};

export function RitualFinder({ onProgress }: RitualFinderProps) {
  const [state, setState] = useState<QuizState>({ answers: {}, cursor: 0, showResult: false });
  const [busy, setBusy] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const { products, source, content, track } = useStore();
  const reducedMotion = useReducedMotion();
  const motionActive = content.motionSettings.enabled && content.motionSettings.intensity > 0 && !reducedMotion;
  const stageRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<QuizNavigation | null>(null);
  const motionRef = useRef(motionActive);
  const quizId = useId();
  const flow = useMemo(() => getQuizFlow(state.answers), [state.answers]);
  const question = flow.questions[state.cursor];
  const complete = state.showResult && flow.complete && Boolean(flow.outcome);
  const result = useMemo(() => flow.outcome ? resolveQuizResult(flow.outcome, products, source) : null, [flow.outcome, products, source]);
  const selection = question ? state.answers[question.id] || [] : [];
  const validSelection = selection.length > 0 && selection.every((value) => question?.options.some((option) => option.value === value));

  useEffect(() => {
    motionRef.current = motionActive;
    if (!motionActive) navigatorRef.current?.finishMotion();
  }, [motionActive]);

  useEffect(() => {
    const navigator = createQuizNavigation({
      getStage: () => stageRef.current,
      motionEnabled: () => motionRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onBusyChange: setBusy,
      afterCommit: () => {
        const heading = stageRef.current?.querySelector<HTMLElement>("[data-quiz-focus]");
        if (!heading) return;
        heading.focus({ preventScroll: true });
        const bounds = heading.getBoundingClientRect();
        const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 88;
        if (bounds.top < headerHeight + 16 || bounds.bottom > window.innerHeight - 48) {
          heading.scrollIntoView({ block: "start", behavior: "instant" });
        }
      },
    });
    navigatorRef.current = navigator;
    return () => { navigator.dispose(); navigatorRef.current = null; };
  }, []);

  function navigate(next: QuizState, nextDirection: "forward" | "back") {
    if (!navigatorRef.current || navigatorRef.current.busy) return;
    setDirection(nextDirection);
    void navigatorRef.current.navigate(() => {
      // Collapse the mobile introduction in the same layout commit, before
      // measuring the new heading for focus and scroll positioning.
      flushSync(() => {
        setState(next);
        onProgress?.({ questionNumber: next.cursor + 1, complete: next.showResult });
      });
      if (next.showResult) track("quiz_completed", { placement: "build_your_ritual" });
    }, nextDirection, next.showResult);
  }

  function choose(currentQuestion: QuizQuestion, value: string) {
    if (navigatorRef.current?.busy) return;
    setState((current) => {
      const selected = current.answers[currentQuestion.id] || [];
      const option = currentQuestion.options.find((item) => item.value === value);
      const values = !currentQuestion.multiple || option?.exclusive
        ? selected.includes(value) && currentQuestion.multiple ? [] : [value]
        : selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected.filter((item) => !currentQuestion.options.find((entry) => entry.value === item)?.exclusive), value];
      return { ...current, answers: setQuizAnswer(current.answers, currentQuestion.id, values), showResult: false };
    });
  }

  function continueQuiz(event: FormEvent) {
    event.preventDefault();
    if (!validSelection || busy || navigatorRef.current?.busy) return;
    if (state.cursor + 1 < flow.questions.length) {
      navigate({ ...state, cursor: state.cursor + 1 }, "forward");
    } else if (flow.complete) {
      navigate({ ...state, showResult: true }, "forward");
    }
  }

  return (
    <div className={styles.finder} data-motion={motionActive ? "on" : "off"} data-busy={busy}>
      <div className={styles.header}>
        <p className={styles.stepLabel}>{complete ? "Your ritual" : `Question ${state.cursor + 1}`}</p>
        <p className={styles.stage}>{complete ? "A considered next step" : question?.label}</p>
      </div>
      <div ref={stageRef} className={styles.stageFrame} data-direction={direction} aria-busy={busy}>
        {!complete && question ? (
          <form key={question.id} className={styles.questionPanel} onSubmit={continueQuiz}>
            <h3 className={styles.questionHeading} id={`${quizId}-question`} tabIndex={-1} data-quiz-focus>{question.question}</h3>
            <p className={styles.questionHelper} id={`${quizId}-helper`}>{question.helper}</p>
            <fieldset className={styles.fieldset} disabled={busy} aria-describedby={`${quizId}-helper`}>
              <legend className={styles.srOnly}>{question.question}</legend>
              <div className={styles.options}>
                {question.options.map((option, index) => (
                  <label className={styles.option} key={option.value}>
                    <input className={styles.control} type={question.multiple ? "checkbox" : "radio"}
                      name={`${quizId}-${question.id}`} value={option.value} checked={selection.includes(option.value)}
                      onChange={() => choose(question, option.value)}
                      aria-labelledby={`${quizId}-${question.id}-option-${index}`}
                      aria-describedby={option.description ? `${quizId}-${question.id}-description-${index}` : undefined} />
                    <span className={styles.indicator} aria-hidden="true" />
                    <span className={styles.optionCopy}>
                      <span className={styles.optionLabel} id={`${quizId}-${question.id}-option-${index}`}>{option.label}</span>
                      {option.description && <span className={styles.optionDescription} id={`${quizId}-${question.id}-description-${index}`}>{option.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.footer}>
              {state.cursor > 0 ? (
                <button type="button" className={styles.backButton} disabled={busy} onClick={() => navigate({ ...state, cursor: state.cursor - 1 }, "back")}><span aria-hidden="true">←</span> Back</button>
              ) : <span className={styles.navigationHint}>Choose an answer to continue</span>}
              <button type="submit" className={styles.primaryButton} disabled={busy || !validSelection}>Continue <span aria-hidden="true">→</span></button>
            </div>
          </form>
        ) : complete && result ? (
          <div className={styles.result} data-result-kind={result.kind} data-result-reveal={motionActive}>
            <p className={styles.resultEyebrow}>{result.kind === "candidate" ? "Chosen around your answers" : "Before your next step"}</p>
            <h3 className={styles.resultTitle} style={{ "--reveal-order": 1 } as CSSProperties} tabIndex={-1} data-quiz-focus>{result.title}</h3>
            <p className={styles.resultDescription} style={{ "--reveal-order": 2 } as CSSProperties}>{result.description}</p>
            {result.items.length > 0 && <section className={styles.suggestions} aria-labelledby={`${quizId}-suggestions`}>
              <div className={styles.suggestionsHeader}>
                <h4 className={styles.suggestionsTitle} id={`${quizId}-suggestions`}>Suggested products</h4>
                <span className={styles.matchCount}>{result.items.length} {result.items.length === 1 ? "product" : "products"}</span>
              </div>
              <ol className={styles.resultProducts} role="list">
              {result.items.map(({ product, role, reason }, index) => {
                const image = product.featuredImage || product.images?.[0];
                return (
                  <li className={styles.resultProduct} key={product.id || product.slug}>
                    <div className={styles.productImage}>
                      {image ? <MediaImage src={image.url} alt={image.altText || product.name} fill sizes="(max-width: 767px) 300px, (max-width: 1023px) 280px, 300px" className={styles.image} /> : <span className={styles.imagePlaceholder}>NatureMist<br />{role}</span>}
                    </div>
                    <div className={styles.resultCopy}>
                      <p className={styles.productRole}>{result.items.length > 1 ? `Step ${index + 1} · ` : ""}{role === "Condition" ? "Conditioning mask" : role === "Cleanse" ? "Botanical wash" : "Indigo colour stage"}</p>
                      <h5 className={styles.productName} style={{ "--reveal-order": 1 } as CSSProperties}><Link href={`/shop/${product.slug}${result.kind === "conditional" ? "#product-directions" : ""}`} className={styles.productNameLink}>{product.name}</Link></h5>
                      <div className={styles.matchReasons} style={{ "--reveal-order": 2 } as CSSProperties}>
                        <p className={styles.reasonLabel}>Why this fits your answers</p>
                        <p>{reason}</p>
                      </div>
                      <div className={styles.productLinks}>
                        {result.kind === "candidate" && <Link href={`/shop/${product.slug}`} className={styles.productLink} aria-label={`View ${product.name}`}>View product <span aria-hidden="true">↗</span></Link>}
                        <Link href={`/shop/${product.slug}#product-directions`} className={styles.directionsLink} aria-label={`View ${product.name} directions`}>Read directions <span aria-hidden="true">↗</span></Link>
                      </div>
                    </div>
                  </li>
                );
              })}
              </ol>
            </section>}
            {result.items.length > 0 && <p className={styles.resultNote}>{result.items.length > 1 ? "Use these as separate care steps, with the mask before the wash. " : ""}Follow each product’s current pack directions, including its patch and strand checks.</p>}
            {source === "preview" && result.items.length > 0 && <p className={styles.resultNote}>Preview suggestions. Confirm the current product and its directions before deciding.</p>}
            <div className={styles.resultActions}>
              <button type="button" className={styles.primaryButton} disabled={busy} onClick={() => navigate({ ...state, cursor: 0, showResult: false }, "back")}><span aria-hidden="true">←</span> Edit my answers</button>
              <button type="button" className={styles.textButton} disabled={busy} onClick={() => navigate({ answers: {}, cursor: 0, showResult: false }, "back")}>Start over</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
