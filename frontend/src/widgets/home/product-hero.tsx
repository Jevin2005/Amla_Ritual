"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { Product } from "@/domain/catalog/products";
import { getImageHeroProducts } from "@/domain/catalog/image-hero";
import type { HeroSettings } from "@/domain/catalog/hero";
import { useStore } from "@/features/store/store-provider";
import { MediaImage } from "@/shared/ui/media-image";
import { clamp, getCoverScale, getHeroBackdrop, getHeroFrame, getHeroHandoffMetrics, getHeroLayout, getHeroScrollMetrics, getHeroScrollProgress, smoothstep } from "./hero-motion";
import { heroSealPath, heroSealTitleLength, heroSealTitlePath } from "./hero-seal";
import { HeroDiscoverHint } from "./hero-discover-hint";
import styles from "./product-hero.module.css";

export function ProductHero({ products, settings }: { products: Product[]; settings: HeroSettings }) {
  const { content: { motionSettings } } = useStore();
  const slides = useMemo(() => getImageHeroProducts(products), [products]);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGSVGElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);
  const productLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = root.current;
    const surface = stage.current;
    if (!section || !surface || !slides.length) return;
    const next = section.nextElementSibling;
    const incoming = next?.hasAttribute("data-previous-hero") ? next as HTMLElement : null;
    const header = document.querySelector<HTMLElement>("[data-ritual-header]");
    section.dataset.handoff = String(Boolean(incoming));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false;
    let frame = 0;
    let width = 1;
    let height = 1;
    let layout = getHeroLayout(1440, 900);
    let start = 0;
    let diameter = 1;
    let centerY = 1;
    let target = 0;
    let current = 0;
    let lastTime = 0;
    let pointerX = 0;
    let pointerY = 0;
    let aimX = 0;
    let aimY = 0;
    let active = true;
    let reduced = media.matches || !motionSettings.enabled;
    let manualTarget = 0;
    let manualCurrent = 0;
    let previousTravel = 0;
    let travelSpeed = 0;
    let suppressClickUntil = 0;
    let pendingFocus: number | null = null;
    let gesture: { id: number; x: number; y: number; lastX: number; time: number; velocity: number; dragging: boolean } | null = null;
    const scrollTravel = () => smoothstep((reduced ? 0 : target) / 0.48) * Math.max(0, slides.length - 1);
    const limitManual = (value: number) => clamp(value, -scrollTravel(), slides.length - 1 - scrollTravel());
    const jarTarget = (event: Event) => (event.target as Element | null)?.closest?.("[data-hero-product]");
    const cancelGesture = () => {
      const previous = gesture;
      gesture = null;
      if (previous && section.hasPointerCapture(previous.id)) section.releasePointerCapture(previous.id);
      section.dataset.dragging = "false";
    };

    const draw = (time: number, settle = false) => {
      frame = 0;
      if (disposed || (!settle && (document.hidden || !active))) return;
      const delta = Math.min(48, lastTime ? Math.max(0, time - lastTime) : 16.7);
      lastTime = settle ? 0 : time;
      // Time-based damping gives the same gentle scrub on 60 Hz and 120 Hz screens.
      const ease = 1 - Math.exp(-delta / 140);
      const pointerEase = 1 - Math.exp(-delta / 180);
      current = settle ? target : current + (target - current) * ease;
      const previousManual = manualCurrent;
      manualCurrent = reduced || settle ? manualTarget : manualCurrent + (manualTarget - manualCurrent) * ease;
      if (Math.abs(manualTarget - manualCurrent) < 0.0001) manualCurrent = manualTarget;
      const travel = smoothstep(current / 0.48) * Math.max(0, slides.length - 1);
      const speed = (travel - previousTravel + manualCurrent - previousManual) / Math.max(1, delta);
      travelSpeed = reduced || settle ? 0 : travelSpeed + (speed - travelSpeed) * ease;
      if (Math.abs(travelSpeed) < 0.00001) travelSpeed = 0;
      previousTravel = travel;
      // An offscreen reset has no animation timestamp. Never interpolate it
      // against a previous frame's clock or allow 0 * Infinity into positions.
      pointerX = settle ? aimX : pointerX + (aimX - pointerX) * pointerEase;
      pointerY = settle ? aimY : pointerY + (aimY - pointerY) * pointerEase;
      if (Math.abs(aimX - pointerX) < 0.001) pointerX = aimX;
      if (Math.abs(aimY - pointerY) < 0.001) pointerY = aimY;
      if (Math.abs(target - current) < 0.0001) current = target;
      const state = getHeroFrame(reduced ? 0 : current, slides.length, width < 680, manualCurrent, travelSpeed, layout);
      const reveal = incoming && !reduced ? state.reveal : 0;
      if (header) {
        header.dataset.heroMotion = String(!reduced);
        if (reduced) {
          header.style.removeProperty("--hero-header-progress");
          header.style.removeProperty("--hero-header-surface");
        } else {
          // Use the same damped frame as the hero, including when scrolling back.
          header.style.setProperty("--hero-header-progress", String(reveal));
          // Keep dark navigation legible before the green cover reaches the top.
          header.style.setProperty("--hero-header-surface", String(smoothstep((state.expansion - 0.1) / 0.35)));
        }
      }
      surface.style.opacity = String(1 - reveal);
      surface.style.pointerEvents = reveal > 0.02 ? "none" : "auto";
      surface.inert = reveal > 0.02;
      const revealing = String(reveal > 0.02);
      if (section.dataset.revealing !== revealing) section.dataset.revealing = revealing;
      if (incoming) incoming.inert = !reduced && reveal <= 0.02;
      section.dataset.covered = String(state.expansion > 0.4);
      const maxScale = getCoverScale(width, height, diameter, centerY);
      const coverTransform = `translate3d(-50%,0,0) scale(${1 + state.expansion * (maxScale - 1)}) rotate(${state.progress * 12}deg)`;
      if (seal.current) seal.current.style.transform = coverTransform;
      if (arc.current) {
        arc.current.style.opacity = String(state.textOpacity);
        arc.current.style.transform = coverTransform;
      }
      if (cue.current) {
        cue.current.style.opacity = String(1 - clamp(current / 0.12));
        cue.current.style.pointerEvents = current > 0.12 ? "none" : "auto";
        cue.current.tabIndex = current > 0.12 ? -1 : 0;
      }
      if (counter.current) counter.current.textContent = `${String(state.focus + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${state.progress})`;
      state.poses.forEach((pose, i) => {
        const hover = reduced ? 0 : (1 - state.exit) * clamp(motionSettings.intensity, 0, 1.5);
        const depth = clamp(pose.height / layout.centerHeight, 0.55, 1);
        const adjusted = {
          ...pose,
          x: pose.x + pointerX * Math.min(32, width * 0.024) / width * hover * depth,
          y: pose.y + pointerY * Math.min(22, height * 0.023) / height * hover * depth,
          roll: pose.roll + pointerX * 0.025 * hover * depth,
        };
        const link = productLinks.current[i];
        if (link) {
          const reach = adjusted.height * height * (0.74 * Math.abs(Math.cos(adjusted.roll)) + Math.abs(Math.sin(adjusted.roll))) / (2 * width);
          const visible = adjusted.x + reach > 0 && adjusted.x - reach < 1 && adjusted.opacity > 0.2 && adjusted.y > -0.4;
          link.style.left = `${adjusted.x * 100}%`;
          link.style.top = `${adjusted.y * 100}%`;
          link.style.height = `${adjusted.height * 100}%`;
          link.style.width = `${adjusted.height * height * 0.74}px`;
          link.style.transform = `translate(-50%,-50%) rotate(${-adjusted.roll}rad)`;
          link.style.opacity = String(adjusted.opacity);
          link.style.setProperty("--jar-brightness", String(reduced ? 1 : pose.brightness));
          link.style.setProperty("--jar-blur", `${reduced ? 0 : pose.depthBlur}px`);
          link.style.zIndex = String(Math.round(pose.height * 100));
          link.style.visibility = visible ? "visible" : "hidden";
          link.tabIndex = visible ? 0 : -1;
          if (visible && pendingFocus === i) {
            link.focus({ preventScroll: true });
            pendingFocus = null;
          }
        }
      });
      if (!settle && (Math.abs(target - current) > 0.0001 || Math.abs(manualTarget - manualCurrent) > 0.0001 || travelSpeed !== 0 || Math.abs(aimX - pointerX) > 0.001 || Math.abs(aimY - pointerY) > 0.001)) requestDraw();
    };
    function requestDraw() {
      if (!frame && active && !document.hidden && !disposed) frame = requestAnimationFrame(draw);
    }
    const cancelDraw = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const readScroll = () => {
      if (disposed) return;
      const bounds = section.getBoundingClientRect();
      start = bounds.top + window.scrollY;
      const wasActive = active;
      // Intersection notifications can arrive after a fast return to the top.
      // Current geometry must be able to restart the paused story on its own.
      active = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (active !== wasActive) lastTime = 0;
      const nextTarget = reduced ? 0 : getHeroScrollProgress(window.scrollY - start, height, slides.length);
      if (nextTarget !== target) manualTarget = 0;
      target = nextTarget;
      if (!active) {
        cancelDraw();
        if (wasActive) {
          cancelGesture();
          aimX = aimY = pointerX = pointerY = 0;
          draw(0, true);
          // A jump may leave before the final scrub frame runs.
          header?.style.removeProperty("--hero-header-progress");
          header?.style.removeProperty("--hero-header-surface");
        }
        return;
      }
      requestDraw();
    };
    const measure = () => {
      const bounds = section.getBoundingClientRect();
      width = section.clientWidth;
      height = surface.clientHeight;
      layout = getHeroLayout(width, height);
      section.style.setProperty("--stage-height", `${height}px`);
      start = bounds.top + window.scrollY;
      const metrics = getHeroScrollMetrics(height, slides.length);
      section.style.setProperty("--story-extra", `${metrics.distance - height * 1.35}px`);
      if (incoming) {
        const handoff = getHeroHandoffMetrics(height, slides.length);
        section.style.setProperty("--handoff-overlap", `${handoff.overlap}px`);
        incoming.dataset.arrival = String(!reduced);
        incoming.style.setProperty("--arrival-runway", `${handoff.runway}px`);
        incoming.style.setProperty("--arrival-lead", `${handoff.lead}px`);
      }
      const backdrop = getHeroBackdrop(width, height);
      diameter = backdrop.diameter;
      centerY = backdrop.top + diameter / 2;
      section.style.setProperty("--seal-size", `${diameter}px`);
      section.style.setProperty("--seal-top", `${backdrop.top}px`);
      section.style.setProperty("--arc-size", `${backdrop.arcSize}px`);
      section.style.setProperty("--arc-top", `${backdrop.arcTop}px`);
      readScroll();
    };
    const preferencesChanged = () => {
      reduced = media.matches || !motionSettings.enabled;
      section.dataset.reducedMotion = String(reduced);
      aimX = aimY = pointerX = pointerY = 0;
      manualTarget = manualCurrent = travelSpeed = previousTravel = 0;
      cancelGesture();
      current = target = 0;
      measure();
    };
    const pointerMove = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId) {
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (!gesture.dragging && Math.hypot(dx, dy) > 8) {
          // A vertical gesture belongs to the page, including when it starts on a jar.
          if (Math.abs(dy) >= Math.abs(dx)) { gesture = null; return; }
          gesture.dragging = true;
          section.dataset.dragging = "true";
          section.setPointerCapture(event.pointerId);
        }
        if (gesture.dragging) {
          event.preventDefault();
          const spacing = width * layout.spacing;
          const change = (gesture.lastX - event.clientX) / spacing;
          gesture.velocity = change / Math.max(8, event.timeStamp - gesture.time);
          manualTarget = limitManual(manualTarget + change);
          gesture.lastX = event.clientX;
          gesture.time = event.timeStamp;
          aimX = aimY = 0;
          requestDraw();
          return;
        }
      }
    };
    // Track the whole viewport so empty space and the fixed header share the
    // same gentle follow. Dragging remains local to the product links.
    const trackPointer = (event: PointerEvent) => {
      if (!active || document.hidden || current >= 0.86 || gesture || event.buttons || reduced || !settings.cursorMotion || !motionSettings.cursor || !finePointer.matches || event.pointerType !== "mouse") return;
      if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
      const bounds = surface.getBoundingClientRect();
      aimX = clamp((event.clientX - bounds.left) / width * 2 - 1, -1, 1);
      aimY = clamp((event.clientY - bounds.top) / height * 2 - 1, -1, 1);
      requestDraw();
    };
    const resetPointer = () => { aimX = aimY = 0; requestDraw(); };
    const viewportLeave = (event: PointerEvent) => { if (!event.relatedTarget) resetPointer(); };
    const windowBlur = () => { cancelGesture(); resetPointer(); };
    const pointerDown = (event: PointerEvent) => {
      if (slides.length < 2 || event.button !== 0 || !event.isPrimary || !jarTarget(event) || current > 0.5) return;
      suppressClickUntil = 0;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, time: event.timeStamp, velocity: 0, dragging: false };
    };
    const pointerUp = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      if (gesture.dragging) {
        const velocity = !reduced && event.type !== "pointercancel" && event.timeStamp - gesture.time < 100 ? clamp(gesture.velocity, -0.012, 0.012) : 0;
        const destination = Math.round(scrollTravel() + manualTarget + velocity * 140);
        manualTarget = limitManual(destination - scrollTravel());
        suppressClickUntil = event.timeStamp + 450;
        requestDraw();
      }
      cancelGesture();
    };
    const preventDragClick = (event: MouseEvent) => {
      if (event.detail > 0 && event.timeStamp < suppressClickUntil && jarTarget(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const horizontalWheel = (event: WheelEvent) => {
      if (slides.length < 2 || event.ctrlKey || !jarTarget(event) || Math.abs(event.deltaX) <= Math.abs(event.deltaY) || current > 0.5) return;
      const pixels = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1);
      const destination = limitManual(manualTarget + pixels / (width * layout.spacing));
      if (destination === manualTarget) return;
      event.preventDefault();
      manualTarget = destination;
      requestDraw();
    };
    const keyboardBrowse = (event: KeyboardEvent) => {
      const link = jarTarget(event);
      if (!link || slides.length < 2 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || current > 0.5) return;
      event.preventDefault();
      const index = Number(link.getAttribute("data-hero-product"));
      const destination = event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : clamp(index + (event.key === "ArrowRight" ? 1 : -1), 0, slides.length - 1);
      manualTarget = limitManual(destination - scrollTravel());
      pendingFocus = destination;
      requestDraw();
    };
    const pointerLeave = () => {
      if (!gesture?.dragging) cancelGesture();
    };
    const resume = () => {
      cancelDraw();
      lastTime = 0;
      cancelGesture();
      aimX = aimY = pointerX = pointerY = 0;
      measure();
    };
    const visibilityChanged = () => {
      lastTime = 0;
      if (document.hidden) { cancelGesture(); aimX = aimY = pointerX = pointerY = 0; cancelDraw(); }
      else resume();
    };
    section.dataset.reducedMotion = String(reduced);
    measure();
    current = target;
    const observer = new IntersectionObserver(readScroll);
    observer.observe(section);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(surface);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("pageshow", resume);
    window.addEventListener("blur", windowBlur);
    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerout", viewportLeave, { passive: true });
    section.addEventListener("pointerdown", pointerDown);
    section.addEventListener("pointermove", pointerMove, { passive: false });
    section.addEventListener("pointerup", pointerUp);
    section.addEventListener("pointercancel", pointerUp);
    section.addEventListener("lostpointercapture", cancelGesture);
    section.addEventListener("click", preventDragClick, true);
    section.addEventListener("wheel", horizontalWheel, { passive: false });
    section.addEventListener("keydown", keyboardBrowse);
    section.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", visibilityChanged);
    media.addEventListener("change", preferencesChanged);
    return () => {
      disposed = true;
      cancelGesture();
      cancelDraw();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("blur", windowBlur);
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerout", viewportLeave);
      section.removeEventListener("pointermove", pointerMove);
      section.removeEventListener("pointerdown", pointerDown);
      section.removeEventListener("pointerup", pointerUp);
      section.removeEventListener("pointercancel", pointerUp);
      section.removeEventListener("lostpointercapture", cancelGesture);
      section.removeEventListener("click", preventDragClick, true);
      section.removeEventListener("wheel", horizontalWheel);
      section.removeEventListener("keydown", keyboardBrowse);
      section.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", visibilityChanged);
      media.removeEventListener("change", preferencesChanged);
      if (incoming) {
        incoming.inert = false;
        delete incoming.dataset.arrival;
        incoming.style.removeProperty("--arrival-runway");
        incoming.style.removeProperty("--arrival-lead");
      }
      section.style.removeProperty("--handoff-overlap");
      surface.inert = false;
      surface.style.opacity = "1";
      surface.style.pointerEvents = "auto";
      delete section.dataset.handoff;
      delete section.dataset.revealing;
      if (header) {
        delete header.dataset.heroMotion;
        header.style.removeProperty("--hero-header-progress");
        header.style.removeProperty("--hero-header-surface");
      }
    };
  }, [slides, settings.cursorMotion, motionSettings.enabled, motionSettings.cursor, motionSettings.intensity]);

  if (!slides.length) return null;
  const initial = getHeroFrame(0, slides.length, false, 0, 0, getHeroLayout(1440, 900));
  return (
    <section ref={root} className={styles.hero} style={{ "--story-extra": slides.length > 1 ? `calc(max(380px, calc(var(--stage-height) * 0.62)) * ${slides.length - 1} - var(--stage-height) * 0.648)` : "0px" } as CSSProperties} data-ritual-hero data-reduced-motion={!motionSettings.enabled ? "true" : undefined} aria-label="NatureMist botanical rituals">
      <div ref={stage} className={styles.stage}>
        <div className={styles.botanicalBackdrop} aria-hidden="true" />
        <h1 className="sr-only">Rooted in nature. Made for your ritual.</h1>
        {slides.length > 1 && <p id="jar-browse-instructions" className="sr-only">Drag or swipe horizontally to browse the jars. Use the left and right arrow keys when a jar is focused. Scroll vertically to continue.</p>}
        <div ref={seal} className={styles.seal} aria-hidden="true">
          <svg viewBox="0 0 1000 1000">
            <defs>
              {/* A soft, upper-left light gives the botanical surface natural depth. */}
              <radialGradient id="naturemist-seal-tone" cx="32%" cy="8%" r="96%">
                <stop offset="0%" stopColor="#66765a" />
                <stop offset="34%" stopColor="#455e43" />
                <stop offset="70%" stopColor="#304b37" />
                <stop offset="100%" stopColor="#213c2e" />
              </radialGradient>
            </defs>
            <path d={heroSealPath} fill="url(#naturemist-seal-tone)" />
          </svg>
        </div>
        <svg ref={arc} className={styles.arc} viewBox="0 0 1000 1000" aria-hidden="true">
          <defs><path id="naturemist-hero-arc" d={heroSealTitlePath} /></defs>
          <text><textPath href="#naturemist-hero-arc" startOffset="50%" textAnchor="middle" textLength={heroSealTitleLength} lengthAdjust="spacingAndGlyphs">ROOTED IN NATURE · MADE FOR YOUR RITUAL</textPath></text>
        </svg>
        <div className={styles.products}>
          {slides.map((product, i) => {
            const initialScale = slides.length > 1 ? 0.59 + (1 - smoothstep(i / 1.8)) * 0.41 : 1;
            // CSS serializes angles to six decimals; keep hydration identical.
            const initialRoll = Number((-initial.poses[i].roll).toFixed(6));
            const openingStyle: CSSProperties = {
              left: `calc(50% + var(--initial-jar-gap) * ${i})`,
              top: `calc(var(--initial-jar-y) + var(--initial-wave) * ${Math.sin(i * 1.35)})`,
              height: `calc(var(--initial-jar-height) * ${initialScale})`,
              width: `calc(var(--initial-jar-height) * ${initialScale * 0.74})`,
            };
            return <Link key={product.heroEntryId} ref={(element) => { productLinks.current[i] = element; }} href={`/shop/${product.slug}`} className={styles.product} data-hero-product={i} aria-label={`Discover ${product.name}`} aria-describedby={slides.length > 1 ? "jar-browse-instructions" : undefined} draggable={false} tabIndex={initial.poses[i].x > -0.12 && initial.poses[i].x < 1.12 ? 0 : -1} style={{ ...openingStyle, transform: `translate(-50%, -50%) rotate(${initialRoll}rad)` }}>
              <div className={styles.artwork} style={{ animationDelay: `${i * 70}ms` }}>
                <MediaImage src={product.heroImage.url} alt={product.heroImage.altText} fill sizes="(max-width: 480px) 70vw, (max-width: 1024px) 77vw, 62svh" preload draggable={false} className={styles.jarImage} />
              </div>
            </Link>;
          })}
        </div>
        <HeroDiscoverHint animated={motionSettings.enabled && motionSettings.cursor && settings.cursorMotion} />
        <a ref={cue} className={styles.scrollCue} href="#previous-hero" onClick={(event) => {
          const section = root.current;
          if (!section) return;
          event.preventDefault();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !motionSettings.enabled;
          const top = section.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: reduced ? top + section.offsetHeight : top + Math.min(window.innerHeight * 0.8, section.offsetHeight - window.innerHeight), behavior: reduced ? "instant" : "smooth" });
        }}>
          <span>Scroll to discover</span><svg width="26" height="16" viewBox="0 0 26 16" fill="none" aria-hidden="true"><path d="m2 3 11 10L24 3" stroke="currentColor" strokeWidth="1.3" /></svg>
        </a>
        <div className={styles.caption}><span ref={counter}>01 / {String(slides.length).padStart(2, "0")}</span><span>Botanical care</span></div>
        <a href="#botanical-collection" className={styles.skip}>Explore the collection <span aria-hidden="true">↗</span></a>
        <div className={styles.progress} aria-hidden="true"><span ref={progressBar} /></div>
      </div>
    </section>
  );
}
