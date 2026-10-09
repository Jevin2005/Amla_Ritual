"use client";

import Image from "next/image";
import { useId, useMemo, type CSSProperties } from "react";
import { defaultIngredientClarity } from "@/domain/ingredient-poster";
import { IngredientPoster } from "@/features/poster/ingredient-poster";
import { IngredientSlideshow } from "@/features/poster/ingredient-slideshow";
import { useStore } from "@/features/store/store-provider";
import { MagneticLink } from "@/shared/ui/magnetic-link";
import styles from "./ingredient-clarity.module.css";

// Organic cutout for the mobile plant photo.
const plantCurve = "M 0 .48 C 0 .31 .12 .21 .34 .18 C .5 .158 .66 .2 .68 0 C .86 0 1 .17 1 .42 V 1 H 0 Z";

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
  const plantClipId = `ingredient-plant-${useId().replace(/:/g, "")}`;
  const media = content.ingredientClarity;
  const posterSettings = useMemo(() => ({
    ...content.ritualPosterSettings,
    config: {
      // Give every photo the same unhurried organic reveal.
      // Explicit Shopify effect settings still take precedence.
      durationOut: { value: 2.4 },
      durationIn: { value: .6 },
      ...content.ritualPosterSettings.config,
    },
  }), [content.ritualPosterSettings]);
  const posterProps = { settings: posterSettings, pace: 2, variant: "editorial" as const };
  const galleries = [media.plantImages, media.preparationImages, media.lifestyleImages];
  const sequenceKey = JSON.stringify(galleries.map((images) => images.map((image) => image.url)));

  return (
    <IngredientSlideshow key={sequenceKey} settings={content.ritualPosterSettings} hasSlides={galleries.some((images) => images.length > 1)}>
    <section id="ingredient-standards" aria-labelledby="purity-title" className={styles.section}>
      <svg className={styles.curveDefinitions} aria-hidden="true" focusable="false" width="0" height="0">
        <defs><clipPath id={plantClipId} clipPathUnits="objectBoundingBox"><path d={plantCurve} /></clipPath></defs>
      </svg>
      {media.background && (
        <Image src={media.background.url} alt="" fill sizes="100vw" className={`${styles.background} ${media.mobileBackground ? styles.desktopBackground : ""}`} />
      )}
      {media.mobileBackground && (
        <Image src={media.mobileBackground.url} alt="" fill sizes="100vw" className={`${styles.background} ${styles.mobileBackground}`} />
      )}

      <div className={styles.composition}>
        {media.botanical && <>
          <div className={`${styles.botanical} ${styles.botanicalTop}`} aria-hidden="true">
            <Image src={media.botanical.url} alt="" fill sizes="(max-width: 760px) 38vw, 240px" />
          </div>
          <div className={`${styles.botanical} ${styles.botanicalBottom}`} aria-hidden="true">
            <Image src={media.botanical.url} alt="" fill sizes="(max-width: 760px) 24vw, 170px" />
          </div>
        </>}

        <header className={styles.heading}>
          <p className={styles.wordmark} data-motion-reveal>NatureMist</p>
          <p className={styles.eyebrow} data-motion-reveal>Notes on botanical care</p>
          <h2 id="purity-title" data-motion-reveal>
            <span className="line-reveal-wrap"><span className="line-reveal-text">A thoughtful ritual</span></span>
            <span className="line-reveal-wrap"><em className="line-reveal-text">starts with understanding.</em></span>
          </h2>
          <p className={styles.srOnly}>One ingredient. Nothing hidden.</p>
        </header>

        <figure className={styles.plant}>
          <div className={styles.plantPhoto} style={{ "--plant-photo-clip": `url(#${plantClipId})` } as CSSProperties}>
            <div className={styles.plantPhotoMedia}>
              <IngredientPoster {...posterProps} images={media.plantImages} fallback={defaultIngredientClarity.plantImages[0]} label="Meet the plant" sizes="(max-width: 760px) 92vw, 50vw" />
            </div>
          </div>
          <StepCaption number="01" title="Meet the plant.">Know the botanical and the part used.</StepCaption>
        </figure>

        <figure className={styles.preparation}>
          <div className={styles.preparationPhoto}>
            <IngredientPoster {...posterProps} images={media.preparationImages} fallback={defaultIngredientClarity.preparationImages[0]} label="Make it simply" sizes="(max-width: 760px) 60vw, 26vw" />
          </div>
          <StepCaption number="02" title="Make it simply.">Clear preparation and safety guidance.</StepCaption>
        </figure>

        <div className={styles.honesty}>
          <figure className={styles.lifestyle}>
            <div className={styles.lifestylePhoto}>
              <IngredientPoster {...posterProps} images={media.lifestyleImages} fallback={defaultIngredientClarity.lifestyleImages[0]} label="Keep it honest" sizes="(max-width: 760px) 82vw, 28vw" />
            </div>
            <StepCaption number="03" title="Keep it honest.">Realistic claims. No miracle promises.</StepCaption>
          </figure>
          <div className={styles.ctaWrap} data-motion-reveal>
            <MagneticLink className={styles.cta} href="/our-story">
              <span>Read our ingredient promise</span><span className={styles.arrow} aria-hidden="true">⟶</span>
            </MagneticLink>
          </div>
        </div>
      </div>
    </section>
    </IngredientSlideshow>
  );
}
