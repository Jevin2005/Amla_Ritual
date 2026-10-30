"use client";

import { MediaImage as Image } from "@/shared/ui/media-image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { getHomepageHeroProducts, type HomepageHeroProduct, type Product } from "@/domain/catalog/products";
import { nextHeroIndex, type HeroSettings } from "@/domain/catalog/hero";
import { getHeroPresentation } from "./hero-presentation";
import { ProductModel } from "@/features/catalog/product-model";
import { SheryBackground } from "@/features/background/shery-background";
import { backgroundTextureSize, paintBackground } from "@/features/background/background-fit";
import { SheryPoster } from "@/features/poster/shery-poster";
import { defaultSheryBackgroundConfig, heroPosterGooeyConfig } from "@/domain/shery-config";
import { useStore } from "@/features/store/store-provider";
import { useCompactViewport, useFinePointer, usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { useWebGL } from "@/shared/hooks/use-webgl";
import { useDeferredMedia } from "@/shared/hooks/use-deferred-media";
import { shopifyImageLoader } from "@/shared/media/image-delivery";
import { HeroPurchase } from "./hero-purchase";
import styles from "./previous-product-hero.module.css";

export function PreviousProductHero({ products, settings }: { products: Product[]; settings: HeroSettings }) {
  const { content: { motionSettings }, track } = useStore();
  const slides = useMemo(() => getHomepageHeroProducts(products), [products]);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [nearHero, setNearHero] = useState(false);
  const [visited, setVisited] = useState(false);
  const [revision, setRevision] = useState(0);
  const [modelInteracting, setModelInteracting] = useState(false);
  const [modelHovered, setModelHovered] = useState(false);
  const [readyImages, setReadyImages] = useState<string[]>([]);
  const [requested, setRequested] = useState<number | null>(null);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [mediaTransition, setMediaTransition] = useState<{
    outgoing: HomepageHeroProduct; incomingId: string; token: number; posterReady: boolean; backgroundReady: boolean;
  } | null>(null);
  const root = useRef<HTMLElement>(null);
  const backgroundImages = useRef(new Map<string, HTMLImageElement>());
  const posterImages = useRef(new Map<string, HTMLImageElement>());
  const mobileBackgrounds = useRef(new Map<string, HTMLCanvasElement>());
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const finePointer = useFinePointer();
  const compactViewport = useCompactViewport();
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const index = nextHeroIndex(selected, slides.length, 0);
  const product = slides[index];
  const modelLoading = Boolean(product && loadingModels.includes(product.heroModel.url));
  const posterReady = Boolean(product && readyImages.includes(product.heroPoster.url));
  const mediaReady = Boolean(posterReady && product && readyImages.includes(product.heroBackground.url));
  const markReady = useCallback((url: string) => {
    setReadyImages((ready) => ready.includes(url) ? ready : [...ready, url]);
  }, []);
  const effectsReady = useDeferredMedia(mediaReady && !modelLoading && finePointer && !compactViewport && inView && pageVisible);
  const webgl = useWebGL(effectsReady && finePointer && !compactViewport);
  const hasProduct = Boolean(product);
  const duration = (product?.heroDurationSeconds ?? settings.intervalSeconds) * 1.2;
  const moving = motionSettings.enabled && !reducedMotion;
  const transitioning = moving && settings.transition !== "none";
  const animateMedia = compactViewport && transitioning && inView && pageVisible;
  const activeTransition = animateMedia && mediaTransition?.incomingId === product?.heroEntryId ? mediaTransition : null;
  const transitionReady = Boolean(activeTransition?.posterReady && activeTransition.backgroundReady);
  // Give each product change a readable reveal on both CSS and WebGL paths.
  const mediaDuration = Math.max(1400, Math.min(4200, 2800 * motionSettings.duration));
  const mediaLayers = activeTransition && product ? [activeTransition.outgoing, product] : product ? [product] : [];
  const departingProduct = mediaTransition?.outgoing;
  const mediaToken = mediaTransition?.token;
  const playing = mediaReady && !modelLoading && !activeTransition && requested === null && slides.length > 1 && settings.autoplay && !paused && !focused && !modelInteracting && !modelHovered && moving && pageVisible && inView;
  const showProgress = mediaReady && slides.length > 1 && settings.autoplay && moving && pageVisible && inView;
  const heroBackgrounds = useMemo(() => slides.map((slide) => ({ ...slide.heroBackground, url: shopifyImageLoader({ src: slide.heroBackground.url, width: 1600 }) })), [slides]);
  const heroPosters = useMemo(() => slides.map((slide) => ({ ...slide.heroPoster, url: shopifyImageLoader({ src: slide.heroPoster.url, width: 960 }) })), [slides]);
  const posterCursor = finePointer && settings.cursorMotion && motionSettings.cursor && motionSettings.intensity > 0;
  const handleModelLoading = useCallback((url: string, loading: boolean) => {
    // A previous viewer may finish after a manual slide change. Track each URL
    // independently so its callback cannot replace the current loading state.
    setLoadingModels((current) => loading
      ? current.includes(url) ? current : [...current, url]
      : current.includes(url) ? current.filter((pending) => pending !== url) : current);
  }, []);
  const markLayerReady = useCallback((id: string, token: number, part: "posterReady" | "backgroundReady") => {
    setMediaTransition((current) => current?.incomingId === id && current.token === token && !current[part]
      ? { ...current, [part]: true } : current);
  }, []);
  const remainingTimeRef = useRef<number>(duration * 1000);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    remainingTimeRef.current = duration * 1000;
    startTimeRef.current = 0;
  }, [index, revision, duration]);

  const start3DInteraction = useCallback(() => {
    if (interactingRef.current) return;
    interactingRef.current = true;
    setModelInteracting(true);

    const onRelease = () => {
      if (!interactingRef.current) return;
      interactingRef.current = false;
      setModelInteracting(false);
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("pointerup", onRelease, true);
        window.removeEventListener("pointercancel", onRelease, true);
        window.removeEventListener("mouseup", onRelease, true);
        window.removeEventListener("touchend", onRelease, true);
        window.removeEventListener("touchcancel", onRelease, true);
        window.removeEventListener("blur", onRelease);
      }
    };

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("pointerup", onRelease, { capture: true, passive: true });
      window.addEventListener("pointercancel", onRelease, { capture: true, passive: true });
      window.addEventListener("mouseup", onRelease, { capture: true, passive: true });
      window.addEventListener("touchend", onRelease, { capture: true, passive: true });
      window.addEventListener("touchcancel", onRelease, { capture: true, passive: true });
      window.addEventListener("blur", onRelease);
    }
  }, []);

  useEffect(() => {
    const el = modelContainerRef.current;
    if (!el) return;

    const handleStart = () => start3DInteraction();
    const onCameraChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ source?: string }>;
      if (customEvent.detail?.source === "user-interaction") {
        start3DInteraction();
      }
    };

    el.addEventListener("pointerdown", handleStart, { capture: true, passive: true });
    el.addEventListener("mousedown", handleStart, { capture: true });
    el.addEventListener("touchstart", handleStart, { capture: true, passive: true });
    el.addEventListener("camera-change", onCameraChange as EventListener, { capture: true });

    return () => {
      el.removeEventListener("pointerdown", handleStart, { capture: true });
      el.removeEventListener("mousedown", handleStart, { capture: true });
      el.removeEventListener("touchstart", handleStart, { capture: true });
      el.removeEventListener("camera-change", onCameraChange as EventListener, { capture: true });
    };
  }, [start3DInteraction, compactViewport, product?.heroEntryId]);

  useEffect(() => {
    if (!compactViewport) return;
    const layers = [departingProduct, product].filter((slide): slide is HomepageHeroProduct => Boolean(slide));
    let frame = 0;
    let disposed = false;
    const draw = () => {
      if (disposed) return;
      for (const slide of layers) {
        const image = backgroundImages.current.get(slide.heroEntryId);
        const canvas = mobileBackgrounds.current.get(slide.heroEntryId);
        if (!image?.complete || !image.naturalWidth || !image.naturalHeight || !canvas) continue;
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const size = backgroundTextureSize(bounds.width * pixelRatio, bounds.height * pixelRatio);
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = size.width;
          canvas.height = size.height;
          paintBackground(context, image, size.width, size.height, "edges");
          canvas.dataset.ready = "true";
        }
        // If canvas is unavailable, the decoded image remains a complete fallback.
        if (mediaToken !== undefined) markLayerReady(slide.heroEntryId, mediaToken, "backgroundReady");
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
    const images = layers.flatMap((slide) => {
      const image = backgroundImages.current.get(slide.heroEntryId);
      const canvas = mobileBackgrounds.current.get(slide.heroEntryId);
      if (canvas) observer?.observe(canvas);
      if (image) image.addEventListener("load", schedule);
      return image ? [image] : [];
    });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      images.forEach((image) => image.removeEventListener("load", schedule));
      window.removeEventListener("resize", schedule);
    };
  }, [compactViewport, product, departingProduct, mediaToken, markLayerReady]);

  useEffect(() => {
    if (!mediaTransition || (animateMedia && !transitionReady)) return;
    const token = mediaTransition.token;
    const timeout = window.setTimeout(() => {
      setMediaTransition((current) => current?.token === token ? null : current);
    }, animateMedia ? mediaDuration + 80 : 0);
    return () => window.clearTimeout(timeout);
  }, [mediaTransition, animateMedia, transitionReady, mediaDuration]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setNearHero(entry.isIntersecting), { rootMargin: "100% 0px", threshold: 0 })
      : null;
    observer?.observe(section);
    const frame = observer ? 0 : requestAnimationFrame(() => setNearHero(true));
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); };
  }, [hasProduct]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const previous = section.previousElementSibling;
    const outgoing = previous?.hasAttribute("data-ritual-hero") ? previous as HTMLElement : null;
    let intersects = false;
    const updateVisibility = () => {
      const covered = outgoing?.dataset.handoff === "true" && outgoing.dataset.reducedMotion !== "true" && outgoing.dataset.revealing !== "true";
      const visible = intersects && !covered;
      setInView(visible);
      if (visible) setVisited(true);
    };
    // Intersection alone cannot tell that the opening hero still covers this section.
    const handoffObserver = outgoing && typeof MutationObserver === "function"
      ? new MutationObserver(updateVisibility) : null;
    handoffObserver?.observe(outgoing!, { attributes: true, attributeFilter: ["data-revealing", "data-reduced-motion", "data-handoff"] });
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => {
        intersects = true;
        updateVisibility();
      });
      return () => { cancelAnimationFrame(frame); handoffObserver?.disconnect(); };
    }
    const observer = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      updateVisibility();
    }, { threshold: 0.15 });
    observer.observe(section);
    return () => { observer.disconnect(); handoffObserver?.disconnect(); };
  }, [hasProduct]);

  const goTo = useCallback((next: number) => {
    if (!Number.isInteger(next)) return;
    const target = nextHeroIndex(next, slides.length, 0);
    setRequested(target === index ? null : target);
  }, [index, slides.length]);

  // Keep the displayed slide intact until both images for the requested slide
  // have decoded. Only one upcoming slide is fetched, never the entire carousel.
  const upcomingIndex = requested ?? nextHeroIndex(index, slides.length);
  const upcoming = slides[upcomingIndex];
  useEffect(() => {
    if (requested === null || !upcoming || !readyImages.includes(upcoming.heroPoster.url) || !readyImages.includes(upcoming.heroBackground.url)) return;
    const frame = requestAnimationFrame(() => {
      const retainedPoster = posterImages.current.get(upcoming.heroEntryId);
      setMediaTransition(animateMedia && product ? {
        outgoing: product, incomingId: upcoming.heroEntryId, token: revision + 1,
        // A quick return may reuse the still-mounted outgoing decoded image,
        // which will not dispatch another load event.
        posterReady: Boolean(retainedPoster?.complete && retainedPoster.naturalWidth), backgroundReady: false,
      } : null);
      setSelected(upcomingIndex);
      setRequested(null);
      setRevision((rev) => rev + 1);
    });
    return () => cancelAnimationFrame(frame);
  }, [requested, upcoming, upcomingIndex, readyImages, animateMedia, product, revision]);

  const handlePosterClick = () => {
    if (slides.length > 1) {
      goTo(nextHeroIndex(index, slides.length));
    }
  };

  useEffect(() => {
    if (!playing) {
      if (startTimeRef.current > 0) {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        startTimeRef.current = 0;
      }
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const remaining = remainingTimeRef.current > 0 ? remainingTimeRef.current : duration * 1000;
    remainingTimeRef.current = remaining;
    startTimeRef.current = Date.now();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      startTimeRef.current = 0;
      remainingTimeRef.current = 0;
      goTo(nextHeroIndex(index, slides.length));
    }, remaining) as unknown as number;

    return () => {
      if (startTimeRef.current > 0) {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        startTimeRef.current = 0;
      }
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, duration, slides.length, index, revision, goTo]);

  if (!product) return null;

  const { theme, firstLine, productLine, tagline, description } = getHeroPresentation(product);
  const animation = !mediaReady || !visited || reducedMotion || !motionSettings.enabled ? "none" : settings.transition;
  const heroTransitionDuration = mediaDuration;

  return (
    // The scroll handoff owns this scene's visibility. A generic section reveal
    // would move its sticky surface and fade out the background during arrival.
    <section id="previous-hero" data-previous-hero data-reveal-ignore ref={root} className={styles.hero} aria-label="Featured botanical rituals" aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        setFocused(!compactViewport || event.target.matches(":focus-visible") || Boolean(event.target.closest("details")));
      }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      data-theme={theme.key}
      data-media-ready={mediaReady}
      data-media-transition={activeTransition ? transitionReady ? "running" : "preparing" : "idle"}
      data-transition={animation}
      data-hovered={hovered ? "true" : undefined}
      style={{
        "--hero-heading": theme.heading,
        "--hero-body": theme.body,
        "--hero-accent": theme.accent,
        "--hero-button-bg": theme.buttonBackground,
        "--hero-button-text": theme.buttonText,
        "--hero-surface": theme.surface,
        "--hero-soft": product.accentSoft,
        "--hero-media-duration": `${mediaDuration}ms`,
        "--hero-content-duration": `${Math.max(650, Math.min(2340, 1300 * motionSettings.duration))}ms`,
      } as CSSProperties}>
      <div className={styles.landing} data-hero-landing>
      <div className={styles.background} data-transition={animation} aria-hidden="true">
        {mediaLayers.map((slide) => <div key={slide.heroEntryId} className={styles.mediaLayer} style={{ backgroundColor: getHeroPresentation(slide).theme.surface }}
          data-layer={activeTransition ? slide.heroEntryId === product.heroEntryId ? "incoming" : "outgoing" : "current"}
          data-active={transitionReady} data-transition={animation}>
          <Image ref={(node) => { if (node) backgroundImages.current.set(slide.heroEntryId, node); else backgroundImages.current.delete(slide.heroEntryId); }}
            src={slide.heroBackground.url} alt="" fill sizes="100vw" loading="eager" className={styles.backgroundImage} onLoad={() => markReady(slide.heroBackground.url)} />
          <canvas ref={(node) => { if (node) mobileBackgrounds.current.set(slide.heroEntryId, node); else mobileBackgrounds.current.delete(slide.heroEntryId); }} className={styles.mobileBackground} />
        </div>)}
        {visited && mediaReady && effectsReady && !compactViewport && finePointer && slides.length > 1 && transitioning && webgl && (
          <SheryBackground
            images={heroBackgrounds}
            config={defaultSheryBackgroundConfig}
            selected={index}
            active={inView && pageVisible}
            duration={heroTransitionDuration}
            fit={compactViewport ? "edges" : "cover"}
            className={styles.heroSheryBackground}
          />
        )}
      </div>
      <div className={styles.layout} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${product.name}`}>
        <div className={styles.copy} key={`copy-${product.heroEntryId}`} data-transition={animation}>
          <p className={styles.introEyebrow}>{product.hero?.eyebrow || "NATUREMIST · BOTANICAL HAIR CARE"}</p>
          <h2 id="previous-hero-title">
            <span className={styles.headlineLine}><span className={styles.headlineText}>{firstLine}</span></span>
            <span className={`${styles.headlineLine} ${styles.productHeadline}`} data-long-name={productLine.length > 8}>
              <span className={styles.headlineText}>{productLine}</span>
            </span>
          </h2>
          <p className={styles.tagline}><em className={styles.headlineText}>{tagline}</em></p>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.scene} data-transition={animation}>
          <div className={styles.orbit} aria-hidden="true" />
          <div
            className={styles.poster}
            role={slides.length > 1 ? "button" : undefined}
            tabIndex={slides.length > 1 ? 0 : undefined}
            aria-label={slides.length > 1 ? `Next botanical ritual: ${slides[nextHeroIndex(index, slides.length)].name}` : undefined}
            onClick={handlePosterClick}
            onKeyDown={(event) => {
              if (slides.length > 1 && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                handlePosterClick();
              }
            }}
          >
            <div className={styles.posterMotion}>
              {mediaLayers.map((slide) => <div key={slide.heroEntryId} className={styles.mediaLayer}
                data-layer={activeTransition ? slide.heroEntryId === product.heroEntryId ? "incoming" : "outgoing" : "current"}
                data-active={transitionReady} data-transition={animation} aria-hidden={slide.heroEntryId !== product.heroEntryId ? true : undefined}>
              <Image ref={(node) => { if (node) posterImages.current.set(slide.heroEntryId, node); else posterImages.current.delete(slide.heroEntryId); }}
                src={slide.heroPoster.url} alt={slide.heroEntryId === product.heroEntryId ? slide.heroPoster.altText || `${slide.name} botanical ritual` : ""} fill
                sizes="(max-width: 900px) 46vw, (max-width: 1100px) 34vw, 38vw"
                preload={index === 0 && revision === 0}
                loading={index === 0 && revision === 0 ? undefined : "eager"}
                fetchPriority={index === 0 && revision === 0 ? undefined : "high"} className={styles.posterImage}
                fallbackSrc={slide.featuredImage?.url} onLoad={() => {
                  markReady(slide.heroPoster.url);
                  if (activeTransition) markLayerReady(slide.heroEntryId, activeTransition.token, "posterReady");
                }} />
              </div>)}
              {visited && mediaReady && effectsReady && !compactViewport && slides.length > 1 && transitioning && posterCursor && webgl && (
                <SheryPoster
                  key={heroPosters.map((image) => image.url).join("|")}
                  images={heroPosters}
                  config={heroPosterGooeyConfig}
                  selected={index}
                  active={inView && pageVisible}
                  cursor={posterCursor}
                  duration={heroTransitionDuration}
                  className={styles.heroPosterEffect}
                  onSelect={goTo}
                />
              )}
            </div>

            {slides.length > 1 && (
              <span className={styles.posterBadge} aria-hidden="true">
                <span>Next ritual</span>
                <span className={styles.posterBadgeArrow}>→</span>
              </span>
            )}
          </div>
          <div className={styles.sceneFooter}>
            <Link
              key={`caption-${product.heroEntryId}`}
              href={`/shop/${product.slug}`}
              onClick={() => { if (product.id) track("select_item", { item_id: product.id }); }}
              className={styles.caption}
              data-transition={animation}
            >
              <span className={styles.captionCopy}>
                <strong>{product.hero?.badgeText || product.name}</strong>
                <span>{product.hero?.badgeSubtitle || product.subtitle}</span>
              </span>
              <span className={styles.captionArrow} aria-hidden="true">↗</span>
            </Link>
            <a className={styles.scrollLink} href="#featured-ritual" aria-label={`Explore ${product.name}`}><span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={styles.purchase} key={`purchase-${product.heroEntryId}`} data-transition={animation}>
          <HeroPurchase slug={product.slug} name={product.name} pricePaise={product.pricePaise}
            compareAtPricePaise={product.compareAtPricePaise}
            size={product.size} currencyCode={product.currencyCode} cursorMotion={posterCursor && moving} />
        </div>
        <aside className={styles.featured} id="featured-ritual" aria-labelledby="featured-ritual-heading">
          <div className={styles.featuredHeader} aria-label="Hero slideshow controls">
            <button type="button" className={styles.arrow} disabled={slides.length < 2} onClick={() => goTo(nextHeroIndex(index, slides.length, -1))} aria-label="Previous featured product">←</button>
            <p id="featured-ritual-heading">Featured botanical ritual</p>
            <button type="button" className={styles.arrow} disabled={slides.length < 2} onClick={() => goTo(nextHeroIndex(index, slides.length))} aria-label="Next featured product">→</button>
          </div>
          <div
            ref={modelContainerRef}
            className={styles.model}
            data-transition={animation}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") setModelHovered(true); }}
            onPointerLeave={() => setModelHovered(false)}
            onPointerDown={start3DInteraction}
            onMouseDown={start3DInteraction}
            onTouchStart={start3DInteraction}
          >
            <ProductModel model={{ ...product.heroModel, altText: product.heroModel.altText || `${product.name} in 3D` }}
              settings={settings} presentation="showcase" paused={paused || !inView} cameraDistancePercent={95} eager
              // On phones the short opening story puts this model near the
              // viewport immediately. Wait for the reveal before decoding its
              // large textures so jar swiping keeps the main thread available.
              enabled={!compactViewport || (inView && pageVisible)}
              preload={(compactViewport ? inView : nearHero) && pageVisible}
              poster={product.featuredImage || product.heroPoster}
              onLoadingChange={handleModelLoading} />
          </div>
          <div className={styles.productDetails} key={`details-${product.heroEntryId}`} data-transition={animation}>
            <p className={styles.eyebrow}>{product.hero?.eyebrow || "Botanical hair care"}</p>
            <h3 className={styles.productName}><Link href={`/shop/${product.slug}`} onClick={() => { if (product.id) track("select_item", { item_id: product.id }); }}>{product.name}</Link></h3>
            {(product.subtitle || product.size) && <p className={styles.subtitle}>{[product.subtitle, product.size].filter(Boolean).join(" · ")}</p>}
            <div className={styles.disclosures}>
              {(description || product.benefits.length > 0) && <details name="hero-product-details">
                <summary>Why you’ll love it <span className={styles.accordionIcon} aria-hidden="true" /></summary>
                <div className={styles.disclosureBody}>
                  {description && <p>{description}</p>}
                  {product.benefits.length > 0 && <ul>{product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>}
                </div>
              </details>}
              {product.howTo.length > 0 && <details name="hero-product-details">
                <summary>How to prepare <span className={styles.accordionIcon} aria-hidden="true" /></summary>
                <div className={styles.disclosureBody}>
                  <ol>{product.howTo.map((step) => <li key={step}>{step}</li>)}</ol>
                </div>
              </details>}
              {(product.ingredient || product.formulation) && <details name="hero-product-details" open={!compactViewport}>
                <summary>Ingredient clarity <span className={styles.accordionIcon} aria-hidden="true" /></summary>
                <div className={styles.disclosureBody}>
                  {product.ingredient && <p>{product.ingredient}</p>}
                  {product.formulation && <p className={styles.formulation}><span>Formulation: </span>{product.formulation}</p>}
                </div>
              </details>}
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
              {settings.autoplay && moving && <button className={styles.pause} type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Resume slideshow" : "Pause slideshow"} title={paused ? "Resume slideshow" : "Pause slideshow"}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  {paused ? <path d="M5 3.5 12 8l-7 4.5z" /> : <path d="M5 4h2v8H5zm4 0h2v8H9z" />}
                </svg>
              </button>}
              <span className={styles.count}>{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            </div>
          )}
        </aside>
      </div>
      {upcoming && upcomingIndex !== index && (requested !== null || (posterReady && inView && pageVisible)) && (
        <div className={styles.preload} aria-hidden="true">
          <Image src={upcoming.heroPoster.url} fallbackSrc={upcoming.featuredImage?.url} alt="" fill
            sizes="(max-width: 900px) 46vw, (max-width: 1100px) 34vw, 38vw" loading="eager" fetchPriority="low"
            onLoad={() => markReady(upcoming.heroPoster.url)} />
          <Image src={upcoming.heroBackground.url} alt="" fill sizes="100vw" loading="eager" fetchPriority="low"
            onLoad={() => markReady(upcoming.heroBackground.url)} />
          {upcoming.featuredImage?.url && upcoming.featuredImage.url !== upcoming.heroPoster.url && (
            <Image src={upcoming.featuredImage.url} alt="" fill sizes="(max-width: 900px) 40vw, 28vw" loading="eager" fetchPriority="low" />
          )}
        </div>
      )}
      {showProgress && (
        <div
          key={`progress-${product.slug}-${revision}`}
          className={styles.progress}
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: playing ? "running" : "paused",
          }}
          aria-hidden="true"
        />
      )}
      <span className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">{product.name}, featured product {index + 1} of {slides.length}</span>
      </div>
    </section>
  );
}
