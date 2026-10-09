"use client";

import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import type { StoreImage } from "@/domain/catalog/products";
import { posterImages, type IngredientPosterSettings } from "@/domain/ingredient-poster";
import { useStore } from "@/features/store/store-provider";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { usePointerMotion } from "@/shared/hooks/use-pointer-motion";
import { MediaImage } from "@/shared/ui/media-image";
import { sheryPosterConfig } from "@/domain/shery-config";
import { SheryPoster } from "./shery-poster";
import { useIngredientSlideshow } from "./ingredient-slideshow";
import styles from "./ingredient-poster.module.css";

const SheryEditor = process.env.NODE_ENV === "development"
  ? lazy(() => import("./shery-editor").then((module) => ({ default: module.SheryEditor })))
  : null;

type PosterProps = {
  images: StoreImage[];
  fallback: StoreImage;
  settings: IngredientPosterSettings;
  pace?: number;
  variant?: "arch" | "editorial";
  label?: string;
  sizes?: string;
};

export function IngredientPoster({ images: sourceImages, fallback, settings, pace = 1, variant = "arch", label = "Ingredient clarity poster gallery", sizes = "(max-width: 768px) 90vw, 480px" }: PosterProps) {
  const images = useMemo(() => posterImages(sourceImages, fallback), [sourceImages, fallback]);
  // Changing/reordering admin images starts a fresh sequence with the first image.
  return <PosterSequence key={images.map((image) => image.url).join("|")} images={images} fallback={fallback} settings={settings} pace={pace} variant={variant} label={label} sizes={sizes} />;
}

function PosterSequence({ images, fallback, settings, pace, variant, label, sizes }: Required<PosterProps>) {
  const { content: { motionSettings } } = useStore();
  const [debugOpen, setDebugOpen] = useState(false);
  const config = useMemo(() => sheryPosterConfig(settings.strength, settings.config), [settings.strength, settings.config]);
  const [localSelected, setLocalSelected] = useState(0);
  const [localPaused, setLocalPaused] = useState(false);
  const slideshow = useIngredientSlideshow();
  const galleryId = useId();
  const selected = slideshow ? ((slideshow.step % images.length) + images.length) % images.length : localSelected;
  const paused = slideshow ? slideshow.paused : localPaused;
  const blockSlideshow = slideshow?.setBlocked;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visited, setVisited] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const posterPointer = usePointerMotion<HTMLDivElement>(true);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const moving = motionSettings.enabled && !reducedMotion;
  const playing = slideshow ? slideshow.playing : images.length > 1 && settings.autoplay && moving && inView && pageVisible && !paused && !hovered && !focused && !debugOpen;
  const current = images[selected];

  const advance = (delta: number) => {
    if (images.length < 2) return;
    if (slideshow) slideshow.advance(delta);
    else setLocalSelected((index) => (index + delta + images.length) % images.length);
  };
  const selectImage = (index: number) => {
    if (index !== selected) advance((index - selected + images.length) % images.length);
  };

  useEffect(() => {
    blockSlideshow?.(galleryId, hovered || focused || debugOpen);
    return () => blockSlideshow?.(galleryId, false);
  }, [blockSlideshow, galleryId, hovered, focused, debugOpen]);

  useEffect(() => {
    const element = root.current;
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
    if (slideshow || !playing) return;
    const timer = setTimeout(() => setLocalSelected((index) => (index + 1) % images.length), settings.interval * 1000 * pace);
    return () => clearTimeout(timer);
  }, [slideshow, playing, selected, images.length, settings.interval, pace]);

  return (
    <div
      ref={root}
      className={`${styles.gallery} ${variant === "editorial" ? styles.editorial : ""}`}
      role="region"
      aria-label={label}
      aria-roledescription={images.length > 1 ? "carousel" : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {variant === "arch" && <div className={styles.ambientGlow} aria-hidden="true" />}
      <div
        {...posterPointer}
        className={styles.frame}
        data-motion-reveal="image"
        onClick={() => advance(1)}
      >
        <MediaImage
          key={current.url}
          src={current.url}
          fallbackSrc={fallback.url}
          alt={current.altText || `NatureMist botanical ritual ${selected + 1}`}
          fill
          sizes={sizes}
          className={styles.image}
          loading={visited ? "eager" : "lazy"}
          onError={(event) => {
            // A resized-image failure still gets an original-file retry. Only
            // remove WebGL when the selected original itself is unavailable.
            const failed = new URL(event.currentTarget.currentSrc || event.currentTarget.src, window.location.href);
            if (failed.href === new URL(current.url, window.location.href).href) setFailedImageUrl(current.url);
          }}
          onLoad={(event) => {
            const loaded = new URL(event.currentTarget.currentSrc || event.currentTarget.src, window.location.href);
            const source = loaded.pathname === "/_next/image"
              ? new URL(loaded.searchParams.get("url") || loaded.href, window.location.href)
              : loaded;
            const original = new URL(current.url, window.location.href);
            // A later retry may recover. A loaded fallback must not restore a
            // shader whose selected texture is still missing.
            if (source.origin === original.origin && source.pathname === original.pathname) {
              setFailedImageUrl((failed) => failed === current.url ? null : failed);
            }
          }}
        />
        {visited && images.length > 1 && moving && settings.gooey && failedImageUrl !== current.url && (
          <SheryPoster images={images} config={config} selected={selected} active={inView && pageVisible && !debugOpen}
            // The iframe owns pointer enter/leave. Focus on a photo or its
            // controls must not prevent the cursor-following reveal.
            cursor={motionSettings.cursor && motionSettings.intensity > 0} duration={1320 * motionSettings.duration * pace}
            onSelect={selectImage} />
        )}
        {variant === "arch" && <span className={styles.brand} aria-hidden="true">N</span>}

        {images.length > 1 && variant !== "editorial" && (
          <span className={styles.posterBadge} aria-hidden="true">
            <span>{slideshow ? "Next photos" : "Next ritual"}</span>
            <span className={styles.posterBadgeArrow}>→</span>
          </span>
        )}

        {images.length > 1 && (
          <div className={styles.controls} role="group" aria-label={`${label} image controls`} onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label={slideshow ? "Previous photo set" : "Previous poster image"} onClick={() => advance(-1)}>←</button>
            <span className={styles.count} aria-live={playing ? "off" : "polite"} aria-atomic="true">{String(selected + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            <button type="button" aria-label={slideshow ? "Next photo set" : "Next poster image"} onClick={() => advance(1)}>→</button>
            {settings.autoplay && moving && (
              <button type="button" aria-label={slideshow ? (paused ? "Resume all photos" : "Pause all photos") : (paused ? "Resume poster slideshow" : "Pause poster slideshow")} aria-pressed={paused} onClick={slideshow ? slideshow.togglePause : () => setLocalPaused(!paused)}>
                <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
              </button>
            )}
          </div>
        )}
      </div>


      {SheryEditor && (variant === "arch" || (images.length > 1 && moving)) && (
        <>
          <button type="button" className={styles.debugTrigger} aria-label="Open Shery controls" disabled={images.length < 2 || !moving} onClick={() => setDebugOpen(true)}>
            {variant === "editorial" ? <span aria-hidden="true">⚙</span> : "Open Shery controls"}
          </button>
          {(images.length < 2 || !moving) && <p className={styles.debugHint}>The editor needs two images and enabled animations. Reduced motion takes priority.</p>}
          {debugOpen && (
            <Suspense fallback={<p>Loading Shery controls…</p>}>
              <SheryEditor images={images} config={config} active={pageVisible && moving} onClose={() => setDebugOpen(false)} />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
