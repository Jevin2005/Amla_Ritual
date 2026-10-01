"use client";

import Image from "next/image";
import { createElement, useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { defaultHeroSettings, type HeroSettings } from "@/domain/catalog/hero";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { isWebGLAvailable, markWebGLUnavailable } from "@/shared/hooks/use-webgl";
import { useStore } from "@/features/store/store-provider";
import { resolveModelMotion } from "./model-motion";
import styles from "./product-model.module.css";
import type { StoreImage } from "@/domain/catalog/products";

type Props = {
  model: { url: string; altText: string };
  settings?: HeroSettings;
  paused?: boolean;
  eager?: boolean;
  cameraDistancePercent?: number;
  presentation?: "hero" | "gallery";
  poster?: StoreImage | null;
};

export function ProductModel(props: Props) {
  return <ModelStage {...props} />;
}

function ModelStage({ model, settings = defaultHeroSettings, paused = false, eager = false, cameraDistancePercent = 105, presentation = "hero", poster }: Props) {
  const viewer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const tracking = useRef(false);
  const [loadStatus, setLoadStatus] = useState<{ url: string; status: "loading" | "ready" | "error" }>({ url: model.url, status: "loading" });
  const [visible, setVisible] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const { content: { motionSettings } } = useStore();
  const motion = resolveModelMotion(settings, motionSettings, reducedMotion);
  const status = loadStatus.url === model.url ? loadStatus.status : "loading";
  const moving = motion.enabled && !paused && pageVisible && visible;
  const cursorEnabled = presentation !== "gallery" && moving && motion.cursor;

  useEffect(() => {
    const supported = isWebGLAvailable();
    const element = viewer.current;
    const container = stage.current;
    const initialFrame = requestAnimationFrame(() => {
      setWebglSupported(supported);
      if (!supported) setLoadStatus({ url: model.url, status: "error" });
      else if ((element as unknown as { loaded?: boolean } | null)?.loaded) setLoadStatus({ url: model.url, status: "ready" });
    });
    if (!supported) {
      return () => cancelAnimationFrame(initialFrame);
    }

    if (!element || !container) return () => cancelAnimationFrame(initialFrame);
    let disposed = false;
    const ready = () => setLoadStatus({ url: model.url, status: "ready" });
    const failed = () => setLoadStatus({ url: model.url, status: "error" });
    const onContextLost = (event: Event) => {
      event.preventDefault();
      markWebGLUnavailable();
      setLoadStatus({ url: model.url, status: "error" });
    };

    element.addEventListener("load", ready);
    element.addEventListener("error", failed);
    element.addEventListener("webglcontextlost", onContextLost);

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
      : null;
    observer?.observe(container);
    const visibilityFrame = observer ? 0 : requestAnimationFrame(() => setVisible(true));

    // Use the vendor's production bundle in dev too, avoiding Lit's debug runtime.
    import("@google/model-viewer/dist/model-viewer.js").catch(() => {
      if (!disposed) failed();
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(visibilityFrame);
      cancelAnimationFrame(frame.current);
      element.removeEventListener("load", ready);
      element.removeEventListener("error", failed);
      element.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [model.url]);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    element.toggleAttribute("auto-rotate", moving && motion.autoRotate && !rotationPaused && status === "ready");
  }, [moving, motion.autoRotate, rotationPaused, status]);

  const resetPosition = useCallback(() => {
    if (!tracking.current) return;
    tracking.current = false;
    cancelAnimationFrame(frame.current);
    stage.current?.style.setProperty("--model-x", "0px");
    stage.current?.style.setProperty("--model-y", "0px");
    viewer.current?.setAttribute("camera-orbit", `0deg 90deg ${cameraDistancePercent}%`);
  }, [cameraDistancePercent]);

  useEffect(() => {
    if (!cursorEnabled || status !== "ready") resetPosition();
  }, [cursorEnabled, status, resetPosition]);

  const followCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (!cursorEnabled || event.pointerType !== "mouse" || event.buttons || status !== "ready") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tracking.current = true;
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      stage.current?.style.setProperty("--model-x", `${x * 12 * motion.intensity}px`);
      stage.current?.style.setProperty("--model-y", `${y * 8 * motion.intensity}px`);
      viewer.current?.setAttribute("camera-orbit", `${x * 25 * motion.intensity}deg ${90 + y * 12 * motion.intensity}deg ${cameraDistancePercent}%`);
    });
  };

  const fallback = poster?.url ? (
    <Image
      src={poster.url}
      alt={poster.altText || model.altText}
      fill
      priority={eager}
      loading={eager ? "eager" : "lazy"}
      sizes="(max-width: 960px) 95vw, 48vw"
      className={styles.poster}
    />
  ) : null;

  if (webglSupported === false) {
    return (
      <div ref={stage} className={styles.stage} data-status="error">
        {fallback}
        <span className={styles.hint} role="status">3D view unavailable</span>
      </div>
    );
  }

  return (
    <div ref={stage} className={styles.stage} data-status={status} onPointerMove={followCursor} onPointerLeave={resetPosition}>
      {status !== "ready" && fallback}
      {createElement("model-viewer", {
        ref: viewer,
        src: model.url,
        alt: model.altText,
        className: styles.viewer,
        style: { opacity: status === "ready" ? 1 : 0, pointerEvents: status === "ready" ? "auto" : "none", transition: motion.enabled && settings.transition !== "none" ? undefined : "none" },
        "aria-hidden": status !== "ready",
        inert: status !== "ready",
        "camera-controls": "",
        "disable-zoom": "",
        "disable-pan": "",
        "touch-action": "pan-y",
        "camera-orbit": `0deg 90deg ${cameraDistancePercent}%`,
        "camera-target": "auto auto auto",
        "min-field-of-view": "25deg",
        "max-field-of-view": "45deg",
        "rotation-per-second": `${settings.rotationSpeed}deg`,
        "auto-rotate-delay": presentation === "gallery" ? "3000" : "0",
        "shadow-intensity": "0.8",
        "shadow-softness": "1",
        "interaction-prompt": "none",
        loading: eager ? "eager" : "lazy",
        reveal: "auto",
      })}
      {status === "ready" && motion.autoRotate && (
        <button className={styles.pause} type="button" onClick={() => setRotationPaused((value) => !value)} aria-pressed={rotationPaused} aria-label={rotationPaused ? "Resume product rotation" : "Pause product rotation"}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {rotationPaused ? <path d="M5 2.5 13 8l-8 5.5z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}
          </svg>
        </button>
      )}
      {status !== "ready" && (
        <span className={styles.hint} role="status">
          {status === "error" ? "3D view unavailable" : "Loading 3D view…"}
        </span>
      )}
    </div>
  );
}
