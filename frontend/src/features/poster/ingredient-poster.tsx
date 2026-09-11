"use client";

import Image from "next/image";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { StoreImage } from "@/domain/catalog/products";
import { posterImages, type IngredientPosterSettings } from "@/domain/ingredient-poster";
import { useStore } from "@/features/store/store-provider";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { sheryPosterConfig } from "@/domain/shery-config";
import { SheryPoster } from "./shery-poster";
import styles from "./ingredient-poster.module.css";

const SheryEditor = process.env.NODE_ENV === "development"
  ? lazy(() => import("./shery-editor").then((module) => ({ default: module.SheryEditor })))
  : null;

export function IngredientPoster({ images: sourceImages, fallback, settings }: { images: StoreImage[]; fallback: StoreImage; settings: IngredientPosterSettings }) {
  const images = useMemo(() => posterImages(sourceImages, fallback), [sourceImages, fallback]);
  // Changing/reordering admin images starts a fresh sequence with the first image.
  return <PosterSequence key={images.map((image) => image.url).join("|")} images={images} settings={settings} />;
}

function PosterSequence({ images, settings }: { images: StoreImage[]; settings: IngredientPosterSettings }) {
  const { content: { motionSettings } } = useStore();
  const [debugOpen, setDebugOpen] = useState(false);
  const config = useMemo(() => sheryPosterConfig(settings.strength, settings.config), [settings.strength, settings.config]);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visited, setVisited] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const moving = motionSettings.enabled && !reducedMotion;
  const playing = images.length > 1 && settings.autoplay && moving && inView && pageVisible && !paused && !hovered && !focused && !debugOpen;
  const current = images[selected];

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setVisited(true);
    }, { threshold: .12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setSelected((index) => (index + 1) % images.length), settings.interval * 1000);
    return () => clearTimeout(timer);
  }, [playing, selected, images.length, settings.interval]);

  return (
    <div className={styles.gallery} role="region" aria-label="Ingredient clarity poster gallery" aria-roledescription="carousel">
      <div ref={frame} className={styles.frame} data-motion-reveal="image"
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <Image key={current.url} src={current.url} alt={current.altText || `NatureMist botanical ritual ${selected + 1}`} fill
          sizes="(max-width: 768px) 90vw, 480px" className={styles.image} loading={visited ? "eager" : "lazy"} />
        {visited && images.length > 1 && moving && settings.gooey && (
          <SheryPoster images={images} config={config} selected={selected} active={inView && pageVisible && !debugOpen}
            cursor={motionSettings.cursor && motionSettings.intensity > 0 && !focused} duration={1100 * motionSettings.duration}
            onSelect={setSelected} />
        )}
        <span className={styles.brand} aria-hidden="true">N</span>
        {images.length > 1 && (
          <div className={styles.controls} aria-label="Poster image controls">
            <button type="button" aria-label="Previous poster image" onClick={() => setSelected((selected + images.length - 1) % images.length)}>←</button>
            <span className={styles.count} aria-live={playing ? "off" : "polite"} aria-atomic="true">{String(selected + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            <button type="button" aria-label="Next poster image" onClick={() => setSelected((selected + 1) % images.length)}>→</button>
            {settings.autoplay && moving && <button type="button" aria-label={paused ? "Resume poster slideshow" : "Pause poster slideshow"} aria-pressed={paused} onClick={() => setPaused(!paused)}>
              <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
            </button>}
          </div>
        )}
      </div>
      <p className={styles.caption}>Botanical ritual · prepared fresh</p>
      {SheryEditor && <>
        <button type="button" className={styles.debugTrigger} disabled={images.length < 2 || !moving} onClick={() => setDebugOpen(true)}>Open Shery controls</button>
        {(images.length < 2 || !moving) && <p className={styles.debugHint}>The editor needs two images and enabled animations. Reduced motion takes priority.</p>}
        {debugOpen && <Suspense fallback={<p>Loading Shery controls…</p>}><SheryEditor images={images} config={config} active={pageVisible && moving} onClose={() => setDebugOpen(false)} /></Suspense>}
      </>}
    </div>
  );
}
