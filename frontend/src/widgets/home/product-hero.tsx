"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { getHomepageHeroProducts, type Product } from "@/domain/catalog/products";
import { nextHeroIndex, type HeroSettings, type HomepageHeroEntry } from "@/domain/catalog/hero";
import { ProductModel } from "@/features/catalog/product-model";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { HeroPurchase } from "./hero-purchase";
import styles from "./product-hero.module.css";

export function ProductHero({ products, entries, settings }: { products: Product[]; entries: HomepageHeroEntry[]; settings: HeroSettings }) {
  const slides = getHomepageHeroProducts(products, entries);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [revision, setRevision] = useState(0);
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const index = nextHeroIndex(selected, slides.length, 0);
  const product = slides[index];
  const hasProduct = Boolean(product);
  const duration = product?.heroDurationSeconds ?? settings.intervalSeconds;
  const playing = slides.length > 1 && settings.autoplay && !paused && !hovered && !focused && !reducedMotion && pageVisible && inView;

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [hasProduct]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setSelected((current) => nextHeroIndex(current, slides.length));
      setRevision((current) => current + 1);
    }, duration * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, duration, slides.length, index, revision]);

  if (!product) return null;

  const goTo = (next: number) => {
    setSelected(next);
    setRevision((current) => current + 1);
  };
  const name = product.name.replace(/ Powder$/i, "");
  const animation = reducedMotion ? "none" : settings.transition;
  const followPoster = (event: PointerEvent<HTMLDivElement>) => {
    if (!settings.cursorMotion || reducedMotion || event.pointerType !== "mouse" || event.buttons) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--poster-x", `${x * 10}px`);
    event.currentTarget.style.setProperty("--poster-y", `${y * 8}px`);
  };
  const resetPoster = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--poster-x", "0px");
    event.currentTarget.style.setProperty("--poster-y", "0px");
  };

  return (
    <section ref={root} className={styles.hero} aria-label="Featured botanical rituals" aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      style={{ "--hero-accent": product.accent, "--hero-soft": product.accentSoft } as CSSProperties}>
      <div className={styles.background} key={`background-${product.heroEntryId}`} data-transition={animation} aria-hidden="true">
        <Image src={product.heroBackground.url} alt="" fill sizes="100vw" loading="eager" className={styles.backgroundImage} />
      </div>
      <div className={styles.layout} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${product.name}`}>
        <div className={styles.copy} key={`copy-${product.heroEntryId}`} data-transition={animation}>
          <h1 id="hero-title">
            <span>{product.hero?.headlineFirst || "Discover"}</span>
            <span>{product.hero?.headlineMiddle || name}</span>
            <em>{product.hero?.headlineItalic || "Botanical ritual."}</em>
          </h1>
          <div className={styles.purchase}>
            <HeroPurchase key={product.slug} slug={product.slug} name={product.name} pricePaise={product.pricePaise} />
          </div>
        </div>
        <div className={styles.scene} key={`scene-${product.heroEntryId}`} data-transition={animation}
          data-cursor-motion={settings.cursorMotion && !reducedMotion}
          onPointerMove={followPoster} onPointerLeave={resetPoster}>
          <div className={styles.orbit} aria-hidden="true" />
          <div className={styles.poster}>
            <Image src={product.heroPoster.url} alt={product.heroPoster.altText || `${product.name} botanical ritual`} fill
              sizes="(max-width: 1000px) 48vw, 38vw" loading="eager" fetchPriority="high" className={styles.posterImage} />
          </div>
          <Link href={`/shop/${product.slug}`} className={styles.caption}>
            <span className={styles.captionMark} aria-hidden="true">N</span>
            <span className={styles.captionCopy}>
              <strong>{product.hero?.badgeText || product.name}</strong>
              <span>{product.hero?.badgeSubtitle || product.subtitle}</span>
            </span>
            <span className={styles.captionDot} aria-hidden="true" />
          </Link>
          <a className={styles.scrollLink} href="#featured-ritual" aria-label={`Explore ${product.name}`}><span aria-hidden="true">↓</span></a>
        </div>
        <aside className={styles.featured} id="featured-ritual" aria-labelledby="featured-ritual-heading">
          <div className={styles.featuredHeader} aria-label="Hero slideshow controls">
            <button type="button" className={styles.arrow} disabled={slides.length < 2} onClick={() => goTo(nextHeroIndex(index, slides.length, -1))} aria-label="Previous featured product">←</button>
            <p id="featured-ritual-heading">Featured botanical ritual</p>
            <button type="button" className={styles.arrow} disabled={slides.length < 2} onClick={() => goTo(nextHeroIndex(index, slides.length))} aria-label="Next featured product">→</button>
          </div>
          <div className={styles.model} key={`model-${product.heroEntryId}`} data-transition={animation}>
            <ProductModel model={{ ...product.heroModel, altText: product.heroModel.altText || `${product.name} in 3D` }}
              settings={settings} paused={paused || !inView} eager />
          </div>
          <div className={styles.productDetails} key={`details-${product.heroEntryId}`} data-transition={animation}>
            <p className={styles.eyebrow}>{product.hero?.eyebrow || "Single-origin botanical"}</p>
            <h2 className={styles.productName}><Link href={`/shop/${product.slug}`}>{product.name}</Link></h2>
            <p className={styles.subtitle}>{[product.subtitle, product.size].filter(Boolean).join(" · ")}</p>
            <div className={styles.disclosures}>
              <details name="hero-product-details">
                <summary>Why you’ll love it <span aria-hidden="true">+</span></summary>
                <div className={styles.disclosureBody}>
                  {(product.hero?.description || product.shortDescription) && <p>{product.hero?.description || product.shortDescription}</p>}
                  {product.benefits.length > 0 && <ul>{product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>}
                </div>
              </details>
              <details name="hero-product-details">
                <summary>How to prepare <span aria-hidden="true">+</span></summary>
                <div className={styles.disclosureBody}>
                  {product.howTo.length > 0 ? <ol>{product.howTo.map((step) => <li key={step}>{step}</li>)}</ol> : <Link href={`/shop/${product.slug}`}>View preparation details</Link>}
                </div>
              </details>
              <details name="hero-product-details" open>
                <summary>Ingredient clarity <span aria-hidden="true">+</span></summary>
                <div className={styles.disclosureBody}><p>{product.ingredient}</p></div>
              </details>
            </div>
          </div>
          {slides.length > 1 && (
            <div className={styles.navigation} aria-label="Choose or pause a featured product">
              <div className={styles.dots} role="group" aria-label="Choose a featured product">
                {slides.map((slide, slideIndex) => (
                  <button key={slide.heroEntryId} type="button" aria-label={`Show ${slide.name}`} aria-pressed={index === slideIndex} onClick={() => goTo(slideIndex)}>
                    <span className={styles.dot} />
                  </button>
                ))}
              </div>
              {settings.autoplay && !reducedMotion && <button className={styles.pause} type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Resume slideshow" : "Pause slideshow"}>{paused ? "Play" : "Pause"}</button>}
              <span className={styles.count}>{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            </div>
          )}
        </aside>
      </div>
      {playing && <div key={`${product.slug}-${revision}-${playing}`} className={styles.progress} style={{ animationDuration: `${duration}s` }} aria-hidden="true" />}
      <span className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">{product.name}, featured product {index + 1} of {slides.length}</span>
    </section>
  );
}
