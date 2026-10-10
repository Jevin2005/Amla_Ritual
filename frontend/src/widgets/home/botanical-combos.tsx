"use client";

import { MediaImage as Image } from "@/shared/ui/media-image";
import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { COMBOS_PER_PAGE, comboProductCount, getBotanicalComboPage, resolveComboProducts, type BotanicalCombo, type BotanicalCombosContent } from "@/domain/botanical-combos";
import { useStore } from "@/features/store/store-provider";
import { useCompactViewport, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { BotanicalBookTurn } from "./botanical-book-turn";
import { ComboPreview } from "./combo-preview";
import styles from "./botanical-combos.module.css";

type PageTurn = {
  id: number;
  from: number;
  to: number;
  direction: 1 | -1;
  duration: number;
};

function Arrow({ backwards = false }: { backwards?: boolean }) {
  return (
    <svg viewBox="0 0 36 20" fill="none" aria-hidden="true" className={styles.arrow} style={backwards ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M1 10h32M24 1l9 9-9 9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Botanical({ className }: { className: string }) {
  return (
    <div className={`${styles.botanical} ${className}`} aria-hidden="true">
      <Image src="/images/ingredient-botanical-v1.png" alt="" fill loading="eager" sizes="(max-width: 900px) 28vw, 230px" />
    </div>
  );
}

function Folio({ index, total }: { index: number; total: number }) {
  return <p className={styles.folio}><span>{String(index + 1).padStart(2, "0")}</span><span className={styles.slash}>/</span>{String(total).padStart(2, "0")}</p>;
}

function PhotoPage({ combo, snapshot = false }: { combo: BotanicalCombo; snapshot?: boolean }) {
  return (
    <figure className={styles.hero}>
      <div className={styles.photoFrame}>
        <div className={styles.heroPhoto}>
          <Image
            key={combo.id}
            src={combo.image.url}
            alt={snapshot ? "" : combo.image.altText}
            aria-hidden={snapshot || undefined}
            loading={snapshot ? "eager" : "lazy"}
            fill
            sizes="(max-width: 900px) 94vw, (max-width: 1600px) 51vw, 820px"
            className={styles.photo}
          />
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionRule} aria-hidden="true" />
        <span className={styles.captionText}>{combo.caption}</span>
        <Botanical className={styles.captionBotanical} />
      </figcaption>
    </figure>
  );
}

function DetailsPage({ content, pageIndex, onPreview }: {
  content: BotanicalCombosContent;
  pageIndex: number;
  onPreview?: (index: number) => void;
}) {
  const { combos, buttonLabel } = content;
  const { combos: pageCombos, startIndex } = getBotanicalComboPage(combos, pageIndex);
  const active = pageCombos[0];
  return (
    <div className={styles.entries}>
      <article className={styles.featured} aria-labelledby={onPreview ? "featured-combo-name" : undefined}>
        <Botanical className={styles.featuredBotanical} />
        <div className={styles.featuredCopy}>
          <Folio index={startIndex} total={combos.length} />
          <h3 id={onPreview ? "featured-combo-name" : undefined}>{active.name}</h3>
          <p className={styles.ingredients}>{active.ingredients}</p>
          <p className={styles.jarCount}>{comboProductCount(active)} jars</p>
        </div>
        {onPreview ? (
          <button type="button" className={`${styles.comboButton} ${styles.primaryButton}`} onClick={() => onPreview(startIndex)} aria-label={`View ${active.name} combo`}>
            {buttonLabel} <Arrow />
          </button>
        ) : <span className={`${styles.comboButton} ${styles.primaryButton}`}>{buttonLabel} <Arrow /></span>}
      </article>

      <div className={styles.otherCombos}>
        {pageCombos.slice(1).map((combo, rowIndex) => (
          <article className={styles.comboRow} key={combo.id}>
            <div className={styles.rowCopy}>
              <Folio index={startIndex + rowIndex + 1} total={combos.length} />
              <h3>{combo.name}</h3>
              <p className={styles.ingredients}>{combo.ingredients}</p>
              <p className={styles.jarCount}>{comboProductCount(combo)} jars</p>
              {onPreview ? (
                <button type="button" className={styles.comboButton} onClick={() => onPreview(startIndex + rowIndex + 1)} aria-label={`View ${combo.name} combo`}>
                  {buttonLabel} <Arrow />
                </button>
              ) : <span className={styles.comboButton}>{buttonLabel} <Arrow /></span>}
            </div>
            {onPreview ? (
              <button type="button" className={styles.thumbnail} onClick={() => onPreview(startIndex + rowIndex + 1)} aria-label={`Preview ${combo.name} combo`}>
                <Image src={combo.image.url} alt={combo.image.altText} fill sizes="(max-width: 900px) 50vw, (max-width: 1600px) 23vw, 360px" />
              </button>
            ) : (
              <span className={styles.thumbnail}>
                <Image src={combo.image.url} alt="" fill loading="eager" sizes="(max-width: 1600px) 23vw, 360px" />
              </span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export function BotanicalCombos() {
  const { content: { botanicalCombos } } = useStore();
  if (!botanicalCombos.enabled || !botanicalCombos.combos.length) return null;
  // A content refresh starts a fresh book, including any in-progress page turn.
  return <ComboBook key={JSON.stringify(botanicalCombos)} content={botanicalCombos} />;
}

function ComboBook({ content }: { content: BotanicalCombosContent }) {
  const { combos } = content;
  const { products, content: { motionSettings } } = useStore();
  const [pageIndex, setPageIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const turnRef = useRef<PageTurn | null>(null);
  const nextTurnIdRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const compactViewport = useCompactViewport();
  const closePreview = useCallback(() => setPreviewIndex(null), []);
  const page = getBotanicalComboPage(combos, pageIndex);
  const dotStart = Math.max(0, Math.min(pageIndex - 2, page.pageCount - 5));
  const visiblePages = Array.from({ length: Math.min(5, page.pageCount) }, (_, index) => dotStart + index);
  const preview = previewIndex === null ? null : combos[previewIndex];
  const finishTurn = useCallback(() => {
    const pending = turnRef.current;
    if (!pending) return;
    turnRef.current = null;
    setPageIndex(pending.to);
    setTurn(null);
  }, []);

  function showPage(index: number, direction: 1 | -1 = index > pageIndex ? 1 : -1) {
    if (turnRef.current || index === pageIndex || index < 0 || index >= page.pageCount) return;
    const animate = content.pageTurnEnabled && motionSettings.enabled && !reducedMotion && !compactViewport &&
      !document.hidden && window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)").matches;
    if (!animate) {
      setPageIndex(index);
      return;
    }
    const nextTurn: PageTurn = { id: ++nextTurnIdRef.current, from: pageIndex, to: index, direction, duration: 1000 * content.pageTurnDuration * motionSettings.duration };
    turnRef.current = nextTurn;
    setTurn(nextTurn);
  }

  function turnPage(direction: 1 | -1) {
    showPage((pageIndex + direction + page.pageCount) % page.pageCount, direction);
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (event.key === "Home") showPage(0, -1);
    else if (event.key === "End") showPage(page.pageCount - 1, 1);
    else turnPage(event.key === "ArrowRight" ? 1 : -1);
  }

  return (
    <section
      id="botanical-combos"
      aria-labelledby="combos-title"
      className={styles.section}
      data-reveal-ignore
      data-motion={motionSettings.enabled ? "enabled" : "disabled"}
      style={{ "--combo-pace": motionSettings.duration } as CSSProperties}
    >
      <div className={styles.inner}>
        <header className={styles.header} data-motion-reveal>
          <p className={styles.eyebrow}>{content.eyebrow}<span aria-hidden="true" /></p>
          <div className={styles.headingRow}>
            <h2 id="combos-title">{content.heading} <span>{content.headingEnding}</span></h2>
            <p className={styles.description}>{content.description}</p>
          </div>
          <Botanical className={styles.headerBotanical} />
        </header>

        <div className={styles.book} data-turning={turn ? turn.direction === 1 ? "next" : "previous" : undefined}>
          <div className={styles.bookStage}>
            <div key={pageIndex} className={styles.spread} inert={Boolean(turn)} aria-hidden={turn ? true : undefined}>
              <PhotoPage combo={page.combos[0]} />
              <DetailsPage content={content} pageIndex={pageIndex} onPreview={setPreviewIndex} />
            </div>
            {turn && <BotanicalBookTurn
              key={turn.id}
              direction={turn.direction}
              duration={motionSettings.enabled && !reducedMotion && !compactViewport ? turn.duration : 0}
              outgoingLeft={<PhotoPage combo={getBotanicalComboPage(combos, turn.from).combos[0]} snapshot />}
              outgoingRight={<DetailsPage content={content} pageIndex={turn.from} />}
              incomingLeft={<PhotoPage combo={getBotanicalComboPage(combos, turn.to).combos[0]} snapshot />}
              incomingRight={<DetailsPage content={content} pageIndex={turn.to} />}
              onComplete={finishTurn}
            />}
          </div>

          <nav className={styles.pagination} aria-label="Browse botanical combo pages" onKeyDown={handleKeys}>
            {page.pageCount > 1 && <button type="button" className={styles.pageArrow} onClick={() => turnPage(-1)} aria-label="Previous combo page" aria-disabled={Boolean(turn)}><Arrow backwards /></button>}
            <span className={styles.pageRule} aria-hidden="true" />
            <span className={styles.pageNumber} aria-hidden="true">{String(pageIndex + 1).padStart(2, "0")}</span>
            <span className={styles.pageTotal} aria-hidden="true">/ <span>{String(page.pageCount).padStart(2, "0")}</span></span>
            {page.pageCount > 1 && <div className={styles.dots}>
              {visiblePages.map((index) => (
                <button key={index} type="button" className={styles.dot} aria-label={`Show page ${index + 1}, combos ${index * COMBOS_PER_PAGE + 1} to ${Math.min((index + 1) * COMBOS_PER_PAGE, combos.length)}`} aria-current={index === pageIndex ? "page" : undefined} aria-disabled={Boolean(turn)} onClick={() => showPage(index)}><span /></button>
              ))}
            </div>}
            <span className={styles.pageRule} aria-hidden="true" />
            {page.pageCount > 1 && <button type="button" className={styles.pageArrow} onClick={() => turnPage(1)} aria-label="Next combo page" aria-disabled={Boolean(turn)}><Arrow /></button>}
          </nav>
          <div className={styles.pageCurl} aria-hidden="true" />
          <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">Page {pageIndex + 1} of {page.pageCount}. Combos {page.startIndex + 1} to {page.startIndex + page.combos.length} of {combos.length}: {page.combos.map((combo) => combo.name).join(", ")}.</p>
        </div>
      </div>
      {preview && <ComboPreview
        title={preview.name}
        ingredientLabel={preview.ingredients}
        image={preview.image.url}
        products={resolveComboProducts(preview, products)}
        expectedProductCount={comboProductCount(preview)}
        onClose={closePreview}
      />}
    </section>
  );
}
