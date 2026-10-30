"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { Product } from "@/domain/catalog/products";
import { getImageHeroProducts } from "@/domain/catalog/image-hero";
import type { HeroSettings } from "@/domain/catalog/hero";
import { useStore } from "@/features/store/store-provider";
import { MediaImage } from "@/shared/ui/media-image";
import { scrollPageTo } from "@/shared/ui/page-scroll";
import { clamp, createHeroArrivalGuard, getCoverScale, getHeroBackdrop, getHeroFrame, getHeroHandoffMetrics, getHeroLayout, getHeroLoopSlotCount, getHeroScrollMetrics, getHeroScrollProgress, getHeroTravel, smoothstep, wrapHeroIndex } from "./hero-motion";
import { heroSealPath, heroSealTitleLength, heroSealTitlePath } from "./hero-seal";
import { HeroDiscoverHint } from "./hero-discover-hint";
import styles from "./product-hero.module.css";

export function ProductHero({ products, settings }: { products: Product[]; settings: HeroSettings }) {
  const { content: { motionSettings }, track } = useStore();
  const slides = useMemo(() => getImageHeroProducts(products), [products]);
  // Short catalogs need offscreen copies so a loop never teleports a visible jar.
  const renderedSlides = useMemo(() => Array.from({ length: getHeroLoopSlotCount(slides.length) }, (_, index) => slides[index % slides.length]), [slides]);
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
    const visualViewport = window.visualViewport;
    let disposed = false;
    let frame = 0;
    let width = 1;
    let height = 1;
    let storyHeight = 1;
    let mobile = false;
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
    let gliding = false;
    let previousTravel = 0;
    let travelSpeed = 0;
    let suppressClickUntil = 0;
    let browsed = false;
    let pendingFocus: number | null = null;
    const arrival = createHeroArrivalGuard();
    let gesture: { id: number; x: number; y: number; lastX: number; time: number; velocity: number; dragging: boolean } | null = null;
    const scrollTravel = () => getHeroTravel(reduced ? 0 : target, slides.length, mobile);
    const limitManual = (value: number) => mobile ? value : clamp(value, -scrollTravel(), slides.length - 1 - scrollTravel());
    const jarTarget = (event: Event) => (event.target as Element | null)?.closest?.("[data-hero-product]");
    const canSwipe = (event: Event) => Boolean(jarTarget(event)) || (mobile && !(event.target as Element | null)?.closest?.('a, button, input, textarea, select, [role="button"], [contenteditable], [data-native-scroll]'));
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
      const ease = 1 - Math.exp(-delta / (mobile ? gliding ? 180 : 90 : 140));
      const pointerEase = 1 - Math.exp(-delta / 180);
      // Both Lenis and native touch must stay aligned with sticky geometry;
      // a second easing layer lets the incoming section outrun the scene.
      current = target;
      const previousManual = manualCurrent;
      // While held, the phone carousel follows the finger on the next frame.
      // Damping belongs to the released glide, not the drag itself.
      manualCurrent = reduced || settle || (mobile && gesture?.dragging) ? manualTarget : manualCurrent + (manualTarget - manualCurrent) * ease;
      if (Math.abs(manualTarget - manualCurrent) < 0.0001) { manualCurrent = manualTarget; gliding = false; }
      const travel = getHeroTravel(current, slides.length, mobile);
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
      const state = getHeroFrame(reduced ? 0 : current, slides.length, mobile, manualCurrent, travelSpeed, layout, mobile);
      section.dataset.idle = String(active && !document.hidden && !gesture && target === 0 && current < 0.001 && !browsed);
      section.dataset.browsed = String(browsed || target > 0.01);
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
        // Keep the way forward visible throughout the product story.
        const cueOpacity = 1 - smoothstep((current - 0.66) / 0.08);
        cue.current.style.opacity = String(cueOpacity);
        cue.current.style.visibility = cueOpacity === 0 ? "hidden" : "visible";
        cue.current.style.pointerEvents = cueOpacity < 0.1 ? "none" : "auto";
        cue.current.tabIndex = cueOpacity < 0.1 ? -1 : 0;
      }
      if (counter.current) counter.current.textContent = `${String(state.focus + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${state.progress})`;
      productLinks.current.forEach((link, i) => {
        const pose = state.poses[i];
        if (!pose) {
          if (link) { link.style.visibility = "hidden"; link.tabIndex = -1; }
          return;
        }
        const hover = reduced ? 0 : (1 - state.exit) * clamp(motionSettings.intensity, 0, 1.5);
        const depth = clamp(pose.height / layout.centerHeight, 0.55, 1);
        const adjusted = {
          ...pose,
          x: pose.x + pointerX * Math.min(32, width * 0.024) / width * hover * depth,
          y: pose.y + pointerY * Math.min(22, height * 0.023) / height * hover * depth,
          roll: pose.roll + pointerX * 0.025 * hover * depth,
        };
        if (link) {
          const reach = adjusted.height * height * (0.74 * Math.abs(Math.cos(adjusted.roll)) + Math.abs(Math.sin(adjusted.roll))) / (2 * width);
          const visible = adjusted.x + reach > 0 && adjusted.x - reach < 1 && adjusted.opacity > 0.2 && adjusted.y > -0.4;
          // Size once on resize; animate only the composited transform.
          link.style.transform = `translate3d(${adjusted.x * width}px,${adjusted.y * height}px,0) translate(-50%,-50%) rotate(${-adjusted.roll}rad) scale(${adjusted.height / layout.centerHeight})`;
          link.style.opacity = String(adjusted.opacity);
          link.style.setProperty("--jar-brightness", String(reduced ? 1 : pose.brightness));
          link.style.zIndex = String(Math.round(pose.height * 100));
          link.style.visibility = visible ? "visible" : "hidden";
          link.tabIndex = visible ? 0 : -1;
          // A two-product loop can show copies at both edges. Focus the copy
          // arriving in the foreground, not an outgoing copy that will hide.
          if (visible && pendingFocus === i % slides.length && (!mobile || Math.abs(adjusted.x - 0.5) < layout.spacing * 0.1)) {
            link.focus({ preventScroll: true });
            pendingFocus = null;
          }
        }
      });
      if (!settle && (Math.abs(target - current) > 0.0001 || Math.abs(manualTarget - manualCurrent) > 0.0001 || travelSpeed !== 0 || Math.abs(aimX - pointerX) > 0.001 || Math.abs(aimY - pointerY) > 0.001)) requestDraw();
    };
    function requestDraw() {
      if (!frame && active && !document.hidden && !disposed) {
        if (performance.now() - lastTime > 100) lastTime = 0;
        frame = requestAnimationFrame(draw);
      }
    }
    const cancelDraw = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const readScroll = () => {
      if (disposed) return;
      if (incoming && !reduced) {
        const offset = window.scrollY - start;
        const limited = arrival.limit(offset, performance.now(), getHeroHandoffMetrics(storyHeight, slides.length, mobile));
        if (limited < offset) {
          // Use the document's scroll owner so pending Lenis inertia is also
          // cancelled, rather than replayed after the arrival pause.
          scrollPageTo(start + limited, { immediate: true });
        }
      }
      const bounds = section.getBoundingClientRect();
      start = bounds.top + window.scrollY;
      const wasActive = active;
      // Intersection notifications can arrive after a fast return to the top.
      // Current geometry must be able to restart the paused story on its own.
      active = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (active !== wasActive) lastTime = 0;
      const nextTarget = reduced ? 0 : getHeroScrollProgress(window.scrollY - start, storyHeight, slides.length, mobile);
      if (!mobile && nextTarget !== target) manualTarget = 0;
      target = nextTarget;
      if (!active) {
        section.dataset.idle = "false";
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
      const nextMobile = width <= 680;
      if (mobile !== nextMobile) {
        cancelGesture();
        manualTarget = manualCurrent = travelSpeed = previousTravel = 0;
        arrival.reset();
      }
      mobile = nextMobile;
      height = surface.clientHeight;
      // The visible scene follows browser chrome; the story keeps the small
      // viewport's scroll distances so hiding the address bar cannot skip ahead.
      storyHeight = Number.parseFloat(getComputedStyle(surface).minHeight) || height;
      // dvh can lag behind the toolbar animation. Use the visual viewport for
      // both sticky scenes so the outgoing background cannot expose the next
      // hero through a strip at the bottom. Keep svh as the story's timebase.
      // Pinch zoom changes the visual viewport, not the document composition.
      if (!visualViewport || visualViewport.scale === 1) {
        const visibleHeight = visualViewport?.height || window.innerHeight;
        if (Number.isFinite(visibleHeight) && visibleHeight > 0) {
          height = Math.max(storyHeight, visibleHeight);
          section.style.setProperty("--stage-height", `${height}px`);
          incoming?.style.setProperty("--landing-height", `${height}px`);
        }
      }
      layout = getHeroLayout(width, height);
      for (const link of productLinks.current) {
        if (!link) continue;
        link.style.left = "0px";
        link.style.top = "0px";
        link.style.height = `${layout.centerHeight * height}px`;
        link.style.width = `${layout.centerHeight * height * 0.74}px`;
      }
      start = bounds.top + window.scrollY;
      const metrics = getHeroScrollMetrics(storyHeight, slides.length, mobile);
      section.style.setProperty("--story-extra", `${metrics.distance - storyHeight * 1.35}px`);
      if (incoming) {
        const handoff = getHeroHandoffMetrics(storyHeight, slides.length, mobile);
        // CSS updates both the section and overlap in the same layout pass.
        // Their dynamic heights cancel, keeping the incoming scene in place.
        section.style.setProperty("--handoff-overlap", `calc(var(--stage-height) + ${handoff.lead}px)`);
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
      // ResizeObserver runs after animation callbacks. Commit the new jar and
      // cover geometry now, before the resized background is painted.
      if (active && !document.hidden) {
        cancelDraw();
        draw(performance.now());
      }
    };
    const preferencesChanged = () => {
      arrival.reset();
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
          browsed = true;
          section.dataset.dragging = "true";
          section.setPointerCapture(event.pointerId);
        }
        if (gesture.dragging) {
          event.preventDefault();
          const spacing = width * layout.spacing;
          const change = (gesture.lastX - event.clientX) / spacing;
          const velocity = change / Math.max(8, event.timeStamp - gesture.time);
          // Reversing a swipe must also reverse its released momentum, even if
          // only one new pointer sample arrives before the finger lifts.
          gesture.velocity = mobile && Math.sign(velocity) === Math.sign(gesture.velocity)
            ? gesture.velocity + (velocity - gesture.velocity) * 0.65 : velocity;
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
      if (slides.length < 2 || event.button !== 0 || !event.isPrimary || !canSwipe(event) || current > 0.5) return;
      suppressClickUntil = 0;
      if (mobile) {
        // A new swipe takes ownership immediately, even midway through a flick.
        manualTarget = manualCurrent;
        gliding = false;
        travelSpeed = 0;
        pendingFocus = null;
      }
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, time: event.timeStamp, velocity: 0, dragging: false };
      section.dataset.idle = "false";
    };
    const pointerUp = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      if (gesture.dragging) {
        const velocity = !reduced && event.type !== "pointercancel" && event.timeStamp - gesture.time < 100 ? clamp(gesture.velocity, -0.012, 0.012) : 0;
        if (mobile) {
          // Free momentum keeps short drags and direction changes from snapping
          // backwards to a rounded slot. 180ms matches the release damping.
          manualTarget += velocity * 180;
          gliding = velocity !== 0;
        } else {
          const destination = Math.round(scrollTravel() + manualTarget + velocity * 140);
          manualTarget = limitManual(destination - scrollTravel());
        }
        suppressClickUntil = event.timeStamp + 450;
        requestDraw();
      }
      cancelGesture();
      requestDraw();
    };
    const preventDragClick = (event: MouseEvent) => {
      if (event.detail > 0 && event.timeStamp < suppressClickUntil && jarTarget(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const horizontalWheel = (event: WheelEvent) => {
      if (slides.length < 2 || event.ctrlKey || event.metaKey || !canSwipe(event) || Math.abs(event.deltaX) <= Math.abs(event.deltaY) || current > 0.5) return;
      const pixels = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1);
      const destination = limitManual(manualTarget + pixels / (width * layout.spacing));
      if (destination === manualTarget) return;
      event.preventDefault();
      if (mobile && gliding) {
        manualTarget = manualCurrent;
        gliding = false;
      }
      manualTarget = mobile ? manualTarget + pixels / (width * layout.spacing) : destination;
      browsed = true;
      requestDraw();
    };
    const keyboardBrowse = (event: KeyboardEvent) => {
      const link = jarTarget(event);
      if (!link || slides.length < 2 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || current > 0.5) return;
      event.preventDefault();
      gliding = false;
      const index = Number(link.getAttribute("data-hero-product"));
      const step = event.key === "ArrowRight" ? 1 : -1;
      const destination = event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1
        : mobile ? wrapHeroIndex(index + step, slides.length) : clamp(index + step, 0, slides.length - 1);
      if (mobile) {
        const position = scrollTravel() + manualTarget;
        // Pick the nearby copy, then step in the requested direction across the seam.
        const focused = position + wrapHeroIndex(index - position + slides.length / 2, slides.length) - slides.length / 2;
        const next = event.key.startsWith("Arrow") ? focused + step
          : position + wrapHeroIndex(destination - position + slides.length / 2, slides.length) - slides.length / 2;
        manualTarget = next - scrollTravel();
      } else manualTarget = limitManual(destination - scrollTravel());
      browsed = true;
      pendingFocus = destination;
      requestDraw();
    };
    const pointerLeave = () => {
      if (!gesture?.dragging) cancelGesture();
    };
    const resume = () => {
      arrival.reset();
      cancelDraw();
      lastTime = 0;
      cancelGesture();
      aimX = aimY = pointerX = pointerY = 0;
      measure();
    };
    const visibilityChanged = () => {
      lastTime = 0;
      if (document.hidden) { section.dataset.idle = "false"; cancelGesture(); aimX = aimY = pointerX = pointerY = 0; cancelDraw(); }
      else resume();
    };
    const armArrival = (event: Event) => {
      if (mobile || reduced || !incoming || event.defaultPrevented) return;
      const element = event.target as Element | null;
      if (element?.closest?.('input, textarea, select, [contenteditable], dialog, [role="dialog"], [data-native-scroll]')) return;
      if (event.type === "keydown" && element?.closest?.("a, button")) return;
      if (event.type === "wheel") {
        const wheel = event as WheelEvent;
        if (wheel.ctrlKey || wheel.metaKey || wheel.shiftKey || wheel.deltaY <= 0 || Math.abs(wheel.deltaX) > Math.abs(wheel.deltaY)) return;
      }
      const offset = window.scrollY - start;
      if (offset >= 0 && offset < getHeroHandoffMetrics(storyHeight, slides.length, mobile).revealEnd) arrival.arm();
    };
    const arrivalKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key) && !event.shiftKey) armArrival(event);
      else arrival.reset();
    };
    section.dataset.reducedMotion = String(reduced);
    measure();
    current = target;
    const observer = new IntersectionObserver(readScroll);
    observer.observe(section);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(surface);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("wheel", armArrival, { passive: true });
    window.addEventListener("touchstart", armArrival, { passive: true });
    window.addEventListener("keydown", arrivalKey);
    window.addEventListener("click", arrival.reset, true);
    window.addEventListener("popstate", arrival.reset);
    window.addEventListener("hashchange", arrival.reset);
    window.addEventListener("resize", measure, { passive: true });
    visualViewport?.addEventListener("resize", measure, { passive: true });
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
      window.removeEventListener("wheel", armArrival);
      window.removeEventListener("touchstart", armArrival);
      window.removeEventListener("keydown", arrivalKey);
      window.removeEventListener("click", arrival.reset, true);
      window.removeEventListener("popstate", arrival.reset);
      window.removeEventListener("hashchange", arrival.reset);
      window.removeEventListener("resize", measure);
      visualViewport?.removeEventListener("resize", measure);
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
        incoming.style.removeProperty("--landing-height");
      }
      section.style.removeProperty("--stage-height");
      section.style.removeProperty("--handoff-overlap");
      surface.inert = false;
      surface.style.opacity = "1";
      surface.style.pointerEvents = "auto";
      delete section.dataset.handoff;
      delete section.dataset.revealing;
      delete section.dataset.idle;
      delete section.dataset.browsed;
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
    <section ref={root} className={styles.hero} style={{ "--catalog-story-extra": slides.length > 1 ? `calc(max(380px, calc(var(--story-height) * 0.62)) * ${slides.length - 1} - var(--story-height) * 0.648)` : "0px" } as CSSProperties} data-ritual-hero data-reduced-motion={!motionSettings.enabled ? "true" : undefined} aria-label="NatureMist botanical rituals">
      <div ref={stage} className={styles.stage}>
        <div className={styles.botanicalBackdrop} aria-hidden="true" />
        <h1 className="sr-only">Rooted in nature. Made for your ritual.</h1>
        {slides.length > 1 && <p id="jar-browse-instructions" className="sr-only">Drag or swipe horizontally to browse the jars. On phones, the jars loop in both directions. Use the left and right arrow keys when a jar is focused. Scroll vertically to continue.</p>}
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
          {renderedSlides.map((product, i) => {
            const copy = i >= slides.length;
            const initialScale = slides.length > 1 ? 0.59 + (1 - smoothstep(i / 1.8)) * 0.41 : 1;
            // CSS serializes angles to six decimals; keep hydration identical.
            const initialRoll = Number((-initial.poses[i % slides.length].roll).toFixed(6));
            const openingStyle: CSSProperties = {
              left: `calc(50% + var(--initial-jar-gap) * ${i})`,
              top: `calc(var(--initial-jar-y) + var(--initial-wave) * ${Math.sin(i * 1.35)})`,
              height: `calc(var(--initial-jar-height) * ${initialScale})`,
              width: `calc(var(--initial-jar-height) * ${initialScale * 0.74})`,
              visibility: copy ? "hidden" : undefined,
            };
            return <Link key={`${product.heroEntryId}-${i}`} ref={(element) => { productLinks.current[i] = element; }} href={`/shop/${product.slug}`} onClick={(event) => { if (!event.defaultPrevented && product.id) track("select_item", { item_id: product.id }); }} className={styles.product} data-hero-product={i % slides.length} data-hero-loop-copy={copy || undefined} aria-label={`Discover ${product.name}`} aria-describedby={slides.length > 1 ? "jar-browse-instructions" : undefined} draggable={false} tabIndex={!copy && initial.poses[i].x > -0.12 && initial.poses[i].x < 1.12 ? 0 : -1} style={{ ...openingStyle, transform: `translate(-50%, -50%) rotate(${initialRoll}rad)` }}>
              <div className={styles.float}>
                <div className={styles.artwork} style={{ animationDelay: `${i * 70}ms` }}>
                  <MediaImage src={product.heroImage.url} alt={product.heroImage.altText} fill sizes="(max-width: 480px) 70vw, (max-width: 1024px) 77vw, 62dvh" preload draggable={false} className={styles.jarImage} />
                </div>
              </div>
            </Link>;
          })}
        </div>
        {slides.length > 1 && <p className={styles.swipeHint} aria-hidden="true">
          <svg width="36" height="16" viewBox="0 0 36 16" fill="none"><path d="m6 4-4 4 4 4m24-8 4 4-4 4M2 8h32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>Swipe the jars to explore</span>
        </p>}
        <HeroDiscoverHint animated={motionSettings.enabled && motionSettings.cursor && settings.cursorMotion} />
        <a ref={cue} className={styles.scrollCue} href="#previous-hero" onClick={(event) => {
          const section = root.current;
          if (!section) return;
          event.preventDefault();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !motionSettings.enabled;
          const top = section.getBoundingClientRect().top + window.scrollY;
          const surface = stage.current;
          const height = surface ? Number.parseFloat(getComputedStyle(surface).minHeight) || surface.clientHeight : window.innerHeight;
          // The second hero overlaps the first. Its DOM top is the start of
          // the crossfade; the story's end is the fully revealed landing.
          scrollPageTo(top + (reduced ? section.offsetHeight : getHeroScrollMetrics(height, slides.length, section.clientWidth <= 680).distance), { immediate: reduced });
        }}>
          <span className={styles.scrollLabel}>Scroll to discover</span>
          <span className={styles.mobileScrollLabel}>Scroll to your ritual</span>
          <span className={styles.scrollDetail}>Swipe up or tap to continue</span>
          <svg width="26" height="16" viewBox="0 0 26 16" fill="none" aria-hidden="true"><path d="m2 3 11 10L24 3" stroke="currentColor" strokeWidth="1.3" /></svg>
        </a>
        <div className={styles.caption}><span ref={counter}>01 / {String(slides.length).padStart(2, "0")}</span><span>Botanical care</span></div>
        <a href="#botanical-collection" className={styles.skip}>Explore the collection <span aria-hidden="true">↗</span></a>
        <div className={styles.progress} aria-hidden="true"><span ref={progressBar} /></div>
      </div>
    </section>
  );
}
