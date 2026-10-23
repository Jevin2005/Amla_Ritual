"use client";

import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { defaultIngredientClarity } from "@/domain/ingredient-poster";
import { IngredientPoster } from "@/features/poster/ingredient-poster";
import { IngredientSlideshow } from "@/features/poster/ingredient-slideshow";
import { useStore } from "@/features/store/store-provider";
import { MagneticLink } from "@/shared/ui/magnetic-link";
import { BrandMark } from "@/widgets/site-chrome/brand-mark";
import { useCompactViewport, useFinePointer } from "@/shared/hooks/use-motion-preferences";
import styles from "./ingredient-clarity.module.css";

function StepCaption({ number, title, children }: { number: string; title: string; children: string }) {
  return (
    <figcaption className={styles.caption} data-motion-reveal>
      <span className={styles.number} aria-hidden="true">{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </figcaption>
  );
}

export function IngredientClarity() {
  const { content } = useStore();
  const compactViewport = useCompactViewport();
  const finePointer = useFinePointer();
  const media = content.ingredientClarity;
  const settings = media.settings;
  const posterSettings = useMemo(() => ({
    ...content.ritualPosterSettings,
    // Touch devices use the image fade without decoding 18 WebGL textures.
    gooey: content.ritualPosterSettings.gooey && !compactViewport && finePointer,
    config: {
      // Give every photo the same unhurried organic reveal.
      // Explicit Shopify effect settings still take precedence.
      durationOut: { value: 2.4 },
      durationIn: { value: .6 },
      ...content.ritualPosterSettings.config,
    },
  }), [content.ritualPosterSettings, compactViewport, finePointer]);
  const posterProps = { settings: posterSettings, pace: settings.transitionPace, variant: "editorial" as const };
  const galleries = [media.plantImages, media.preparationImages, media.lifestyleImages];
  const sequenceKey = JSON.stringify(galleries.map((images) => images.map((image) => image.url)));

  if (!settings.enabled) return null;

  return (
    <IngredientSlideshow key={sequenceKey} settings={content.ritualPosterSettings} hasSlides={galleries.some((images) => images.length > 1)}>
    <section id="ingredient-standards" aria-labelledby="purity-title" className={styles.section} style={{
      "--clarity-ink": settings.inkColor,
      "--clarity-paper": settings.paperColor,
      "--clarity-clay": settings.accentColor,
      "--clarity-panel": settings.panelColor,
      "--clarity-panel-text": settings.panelTextColor,
    } as CSSProperties}>
      {media.background && (
        <Image src={media.background.url} alt="" fill sizes="100vw" className={`${styles.background} ${media.mobileBackground ? styles.desktopBackground : ""}`} />
      )}
      {media.mobileBackground && (
        <Image src={media.mobileBackground.url} alt="" fill sizes="100vw" className={`${styles.background} ${styles.mobileBackground}`} />
      )}

      <div className={styles.composition}>
        {settings.showBotanical && media.botanical && <>
          <div className={`${styles.botanical} ${styles.botanicalTop}`} aria-hidden="true">
            <Image src={media.botanical.url} alt="" fill sizes="(max-width: 760px) 38vw, 240px" />
          </div>
          <div className={`${styles.botanical} ${styles.botanicalBottom}`} aria-hidden="true">
            <Image src={media.botanical.url} alt="" fill sizes="(max-width: 760px) 24vw, 170px" />
          </div>
        </>}

        <header className={styles.heading}>
          <div className={styles.wordmark} data-motion-reveal>
            {settings.wordmark.trim().toLowerCase() === "naturemist" ? <BrandMark /> : settings.wordmark}
          </div>
          <p className={styles.eyebrow} data-motion-reveal>{settings.eyebrow}</p>
          <h2 id="purity-title" data-motion-reveal>
            <span className="line-reveal-wrap"><span className="line-reveal-text">{settings.heading}</span></span>
            <span className="line-reveal-wrap"><em className="line-reveal-text">{settings.headingEmphasis}</em></span>
          </h2>
        </header>

        <figure className={styles.plant}>
          <div className={styles.plantPhoto}>
            <div className={styles.plantPhotoMedia}>
              <IngredientPoster {...posterProps} images={media.plantImages} fallback={defaultIngredientClarity.plantImages[0]} label={settings.plantTitle} sizes="(max-width: 760px) 92vw, 50vw" />
            </div>
          </div>
          <StepCaption number="01" title={settings.plantTitle}>{settings.plantText}</StepCaption>
        </figure>

        <figure className={styles.preparation}>
          <div className={styles.preparationPhoto}>
            <IngredientPoster {...posterProps} images={media.preparationImages} fallback={defaultIngredientClarity.preparationImages[0]} label={settings.preparationTitle} sizes="(max-width: 760px) 60vw, 26vw" />
          </div>
          <StepCaption number="02" title={settings.preparationTitle}>{settings.preparationText}</StepCaption>
        </figure>

        <div className={styles.honesty}>
          <figure className={styles.lifestyle}>
            <div className={styles.lifestylePhoto}>
              <IngredientPoster {...posterProps} images={media.lifestyleImages} fallback={defaultIngredientClarity.lifestyleImages[0]} label={settings.lifestyleTitle} sizes="(max-width: 760px) 82vw, 28vw" />
            </div>
            <StepCaption number="03" title={settings.lifestyleTitle}>{settings.lifestyleText}</StepCaption>
          </figure>
          {settings.buttonEnabled && <div className={styles.ctaWrap} data-motion-reveal>
            <MagneticLink className={styles.cta} href={settings.buttonHref}>
              <span>{settings.buttonLabel}</span><span className={styles.arrow} aria-hidden="true">⟶</span>
            </MagneticLink>
          </div>}
        </div>
      </div>
    </section>
    </IngredientSlideshow>
  );
}
