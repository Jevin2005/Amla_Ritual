"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { IngredientPosterSettings } from "@/domain/ingredient-poster";
import { useStore } from "@/features/store/store-provider";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";

type Slideshow = {
  step: number;
  playing: boolean;
  paused: boolean;
  advance: (delta: number) => void;
  togglePause: () => void;
  setBlocked: (id: string, blocked: boolean) => void;
};

const SlideshowContext = createContext<Slideshow | null>(null);

export function useIngredientSlideshow() {
  return useContext(SlideshowContext);
}

/** One clock for the whole collage, including panels currently below the fold. */
export function IngredientSlideshow({ children, settings, hasSlides }: {
  children: ReactNode;
  settings: IngredientPosterSettings;
  hasSlides: boolean;
}) {
  const { content: { motionSettings } } = useStore();
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [blocked, setBlockedIds] = useState<Set<string>>(() => new Set());
  const playing = hasSlides && settings.autoplay && motionSettings.enabled && !reducedMotion
    && pageVisible && inView && !paused && blocked.size === 0;

  const advance = useCallback((delta: number) => setStep((value) => value + delta), []);
  const togglePause = useCallback(() => setPaused((value) => !value), []);
  const setBlocked = useCallback((id: string, active: boolean) => {
    setBlockedIds((previous) => {
      if (previous.has(id) === active) return previous;
      const next = new Set(previous);
      if (active) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    // Shopify's seconds are literal. The animation pace affects the effect only.
    const timer = setTimeout(() => advance(1), settings.interval * 1000);
    return () => clearTimeout(timer);
  }, [playing, step, settings.interval, advance]);

  return (
    <SlideshowContext.Provider value={{ step, playing, paused, advance, togglePause, setBlocked }}>
      <div ref={root} data-ingredient-slideshow>{children}</div>
    </SlideshowContext.Provider>
  );
}
