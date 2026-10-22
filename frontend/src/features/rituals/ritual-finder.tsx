"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { matchesProductSlug } from "@/domain/catalog/canonical-slug";
import { useStore } from "@/features/store/store-provider";
import { useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { MediaImage } from "@/shared/ui/media-image";
import { scrollPageTo } from "@/shared/ui/page-scroll";
import { getQuizFlow, resolveQuizBrowseItems, resolveQuizResult, setQuizAnswer, type QuizAnswers, type QuizQuestion } from "./guided-quiz";
import { createQuizNavigation, type QuizNavigation } from "./ritual-navigation";
import styles from "./ritual-finder.module.css";

type QuizState = { answers: QuizAnswers; cursor: number; showResult: boolean };
type RitualFinderProps = {
  onProgress?: (progress: { questionNumber: number; complete: boolean }) => void;
};

const botanicalArtworks = ["amla", "reetha", "shikakai", "hibiscus", "bhringraj", "indigo"];

function GoalIcon({ goal }: { goal: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {goal === "cleanse" && <><path d="M16 4c-3.3 4.5-8 9.5-8 15a8 8 0 0 0 16 0c0-5.5-4.7-10.5-8-15Z" /><path d="M12 19a4 4 0 0 0 4 4" /></>}
      {goal === "softness" && <><path d="m16 5 2.7 8.3L27 16l-8.3 2.7L16 27l-2.7-8.3L5 16l8.3-2.7L16 5Z" /><path d="M25 5v5m-2.5-2.5h5M6 25v3m-1.5-1.5h3" /></>}
      {goal === "scalp" && <><path d="M25 5C13 3 6 10 7 19c.5 4 3.2 6.5 7.2 6C23 24 27 15 25 5Z" /><path d="M5 28 20 12m-7 7v-7m0 7h7" /></>}
      {goal === "skin" && <><path d="M8 7c0 8 1 16 8 20 7-4 8-12 8-20M8 7c4-3 12-3 16 0M11 13h2m6 0h2M14 21c1.3.8 2.7.8 4 0" /><path d="M16 13v4h2" /></>}
      {goal === "colour" && <><path d="M16 5c-2.5 4-7.5 9.5-7.5 15a7.5 7.5 0 0 0 15 0C23.5 14.5 18.5 9 16 5Z" /><path d="M8.7 18.5c5-3 9.5 4.5 14.6 1.5M12 23c1.2 1.2 2.4 1.7 4 1.7" /></>}
    </svg>
  );
}

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
  const flow = useMemo(() => getQuizFlow(state.answers, { products, source }), [state.answers, products, source]);
  const question = flow.questions[state.cursor];
  const complete = state.showResult && flow.complete && Boolean(flow.outcome);
  const result = useMemo(() => flow.outcome ? resolveQuizResult(flow.outcome, products, source) : null, [flow.outcome, products, source]);
  const browseItems = useMemo(() => resolveQuizBrowseItems(state.answers, products, source), [state.answers, products, source]);
  const browsingOnly = Boolean(result && result.items.length === 0);
  const displayedItems = browsingOnly ? browseItems : result?.items ?? [];
  const skinRitual = state.answers.goal?.[0] === "skin";
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
          scrollPageTo(heading, { immediate: true });
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
      return { ...current, answers: setQuizAnswer(current.answers, currentQuestion.id, values, { products, source }), showResult: false };
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
    <div className={styles.finder} data-motion={motionActive ? "on" : "off"} data-busy={busy} data-current-question={complete ? "result" : question?.id}>
      <div className={styles.header}>
        <span className={styles.stepNumber} aria-hidden="true">{complete ? <svg viewBox="0 0 24 24" fill="none"><path d={browsingOnly ? "M6 12h12m-5-5 5 5-5 5" : "m6 12 4 4 8-8"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> : String(state.cursor + 1).padStart(2, "0")}</span>
        <div className={styles.stageCopy}>
          <p className={styles.stepLabel}>{complete ? browsingOnly ? "Your discovery" : "Your ritual" : `Question ${state.cursor + 1}`}</p>
          <p className={styles.stage}>{complete ? browsingOnly ? "Meet the botanicals" : "A considered next step" : question?.label}</p>
        </div>
        <span className={styles.headerRule} aria-hidden="true" />
      </div>
      <div ref={stageRef} className={styles.stageFrame} data-direction={direction} aria-busy={busy}>
        {!complete && question ? (
          <form key={question.id} className={styles.questionPanel} onSubmit={continueQuiz}>
            <h3 className={styles.questionHeading} id={`${quizId}-question`} tabIndex={-1} data-quiz-focus>{question.question}</h3>
            <p className={styles.questionHelper} id={`${quizId}-helper`}>{question.helper}</p>
            <fieldset className={styles.fieldset} disabled={busy} aria-describedby={`${quizId}-helper`}>
              <legend className={styles.srOnly}>{question.question}</legend>
              <div className={`${styles.options} ${question.id === "goal" ? styles.goalOptions : ""}`}>
                {question.options.map((option, index) => (
                  <label className={styles.option} key={option.value}>
                    <input className={styles.control} type={question.multiple ? "checkbox" : "radio"}
                      name={`${quizId}-${question.id}`} value={option.value} checked={selection.includes(option.value)}
                      onChange={() => choose(question, option.value)}
                      aria-labelledby={`${quizId}-${question.id}-option-${index}`}
                      aria-describedby={option.description ? `${quizId}-${question.id}-description-${index}` : undefined} />
                    {question.id === "goal" && <span className={styles.goalIcon}><GoalIcon goal={option.value} /></span>}
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
              <button type="submit" className={styles.primaryButton} disabled={busy || !validSelection}>{flow.complete && state.cursor === flow.questions.length - 1 ? flow.outcome && ["candidate", "conditional"].includes(flow.outcome.kind) ? "See my ritual" : skinRitual ? "Read skin-use guidance" : "Explore products" : "Continue"} <span aria-hidden="true">→</span></button>
            </div>
          </form>
        ) : complete && result ? (
          <div className={styles.result} data-result-kind={result.kind} data-browsing-only={browsingOnly} data-result-reveal={motionActive}>
            <p className={styles.resultEyebrow}>{browsingOnly ? "Explore the collection" : "Chosen around your answers"}</p>
            <h3 className={styles.resultTitle} style={{ "--reveal-order": 1 } as CSSProperties} tabIndex={-1} data-quiz-focus>{result.title}</h3>
            <p className={styles.resultDescription} style={{ "--reveal-order": 2 } as CSSProperties}>{result.description}</p>
            {displayedItems.length > 0 && <section className={styles.suggestions} aria-labelledby={`${quizId}-suggestions`}>
              <div className={styles.suggestionsHeader}>
                <h4 className={styles.suggestionsTitle} id={`${quizId}-suggestions`}>{browsingOnly ? "Botanicals to explore" : skinRitual && displayedItems.length > 1 ? "Skin-care options to compare" : "Suggested products"}</h4>
                <span className={styles.matchCount}>{displayedItems.length} {displayedItems.length === 1 ? "product" : "products"}</span>
              </div>
              {browsingOnly && <p className={styles.browseContext}>{state.answers.goal?.[0] === "colour" ? "Traditional hair-pack ingredients for browsing; these do not provide your requested colour result." : "For browsing: ingredients, intended uses and product details."}</p>}
              <ol className={styles.resultProducts} role="list">
                {displayedItems.map(({ product, role, reason }) => {
                  const image = product.featuredImage || product.images?.[0];
                  const botanical = botanicalArtworks.find((name) => matchesProductSlug(`${name}-powder`, product));
                  const fallbackImage = botanical ? `/images/specimen-collection/${botanical}.webp` : undefined;
                  const imageSource = image?.url || fallbackImage;
                  return (
                    <li className={styles.resultProduct} key={product.id || product.slug}>
                      <div className={styles.productImage}>
                        {imageSource ? <MediaImage src={imageSource} fallbackSrc={fallbackImage} alt={product.name} fill sizes="(max-width: 767px) 260px, (max-width: 1023px) 280px, 300px" className={styles.image} /> : <span className={styles.imagePlaceholder}>NatureMist<br />{role}</span>}
                      </div>
                      <div className={styles.resultCopy}>
                        <p className={styles.productRole}>{role === "Skin" ? "Rinse-off skin mask" : role === "Pack" ? "Traditional hair pack" : role === "Condition" ? "Conditioning mask" : role === "Cleanse" ? "Botanical wash" : "Indigo colour stage"}</p>
                        <h5 className={styles.productName} style={{ "--reveal-order": 1 } as CSSProperties}><Link href={`/shop/${product.slug}${result.kind === "conditional" ? "#product-directions" : ""}`} className={styles.productNameLink}>{product.name}</Link></h5>
                        <div className={styles.matchReasons} style={{ "--reveal-order": 2 } as CSSProperties}>
                          <p className={styles.reasonLabel}>{browsingOnly ? "About this botanical" : "Why this fits your answers"}</p>
                          <p>{reason}</p>
                        </div>
                        <div className={styles.productLinks}>
                          <Link href={`/shop/${product.slug}`} className={styles.productLink} aria-label={`${result.kind === "candidate" ? "Shop" : "Explore"} ${product.name}`}>{result.kind === "candidate" ? "Shop" : "Explore"} {product.name} <span aria-hidden="true">↗</span></Link>
                          <Link href={`/shop/${product.slug}#product-directions`} className={styles.directionsLink} aria-label={`View ${product.name} directions`}>Read directions <span aria-hidden="true">↗</span></Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>}
            {browsingOnly && <Link href="/shop" className={styles.directionsLink}>Browse the full collection <span aria-hidden="true">↗</span></Link>}
            {result.items.length > 0 && <p className={styles.resultNote}>{skinRitual ? `${result.items.length > 1 ? "These are alternatives; choose one powder to start. " : ""}Follow the current skin-use directions and patch-test guidance. Hair-care directions do not apply to skin.` : `${result.items.length > 1 ? "Use these as separate care steps in the order specified by the product directions. " : ""}Follow each product’s current pack directions, including its patch and strand checks.`}</p>}
            {source === "preview" && displayedItems.length > 0 && <p className={styles.resultNote}>Preview collection. See the product page for current details.</p>}
            <div className={styles.resultActions}>
              <button type="button" className={styles.backButton} disabled={busy} onClick={() => navigate({ ...state, cursor: 0, showResult: false }, "back")}><span aria-hidden="true">←</span> Edit my answers</button>
              <button type="button" className={styles.textButton} disabled={busy} onClick={() => navigate({ answers: {}, cursor: 0, showResult: false }, "back")}>Start over</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
