"use client";

import { MediaImage as Image } from "@/shared/ui/media-image";
import { useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties, type PointerEvent } from "react";
import { defaultHeroSettings, type HeroSettings } from "@/domain/catalog/hero";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import { isWebGLAvailable } from "@/shared/hooks/use-webgl";
import { optimizedModelUrl } from "@/shared/media/model-delivery";
import { useStore } from "@/features/store/store-provider";
import { resolveModelMotion } from "./model-motion";
import { useDeferredMedia } from "@/shared/hooks/use-deferred-media";
import styles from "./product-model.module.css";
import type { StoreImage } from "@/domain/catalog/products";

const ModelViewer = "model-viewer" as unknown as ComponentType<Record<string, unknown>>;

type Props = {
  model: { url: string; altText: string };
  settings?: HeroSettings;
  paused?: boolean;
  eager?: boolean;
  cameraDistancePercent?: number;
  presentation?: "hero" | "gallery" | "showcase";
  poster?: StoreImage | null;
  enabled?: boolean;
  preload?: boolean;
  onPosterReady?: () => void;
  onLoadingChange?: (url: string, loading: boolean) => void;
};

export function ProductModel(props: Props) {
  return <ModelStage key={`${props.model.url}:${props.poster?.url ?? ""}`} {...props} />;
}

function ModelStage({ model, settings = defaultHeroSettings, paused = false, eager = false, cameraDistancePercent = 105, presentation = "hero", poster, enabled = true, preload = false, onPosterReady, onLoadingChange }: Props) {
  const viewer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const tracking = useRef(false);
  const dragging = useRef(false);
  const [loadStatus, setLoadStatus] = useState<{ url: string; status: "loading" | "ready" | "error" }>({ url: model.url, status: "loading" });
  const [visible, setVisible] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const { content: { motionSettings } } = useStore();
  const motion = resolveModelMotion(settings, motionSettings, reducedMotion);
  const status = loadStatus.url === model.url ? loadStatus.status : "loading";
  const moving = motion.enabled && !paused && pageVisible && visible;
  const showcase = presentation === "showcase";
  const autoRotate = motion.autoRotate && !showcase;
  const floating = showcase && motion.enabled && motion.intensity > 0 && status === "ready";
  const cursorEnabled = presentation !== "gallery" && moving && motion.cursor;
  const activated = useDeferredMedia(enabled && (visible || preload) && pageVisible, eager || presentation === "gallery" ? 0 : 300);
  useEffect(() => {
    onLoadingChange?.(model.url, activated && status === "loading");
    return () => onLoadingChange?.(model.url, false);
  }, [model.url, activated, status, onLoadingChange]);

  useEffect(() => {
    const container = stage.current;
    if (!container) return;
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
      : null;
    observer?.observe(container);
    const visibilityFrame = observer ? 0 : requestAnimationFrame(() => setVisible(true));
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(visibilityFrame);
    };
  }, []);

  useEffect(() => {
    if (!activated) return;
    const supported = isWebGLAvailable(attempt > 0);
    const element = viewer.current;
    const container = stage.current;
    const initialFrame = requestAnimationFrame(() => {
      setWebglSupported(supported);
      if (!supported) setLoadStatus({ url: model.url, status: "error" });
    });
    if (!supported) {
      return () => cancelAnimationFrame(initialFrame);
    }

    if (!element || !container) return () => cancelAnimationFrame(initialFrame);
    let disposed = false;
    let settled = false;
    let lastProgress = 0;
    let stallTimeout = 0;
    let lostContext: EventTarget | null = null;
    const timeout = window.setTimeout(() => failed(), 120000);
    const watchForStall = () => {
      window.clearTimeout(stallTimeout);
      stallTimeout = window.setTimeout(() => failed(), 20000);
    };
    const ready = () => {
      if (disposed || settled || lostContext) return;
      settled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(stallTimeout);
      // The vendor's load event follows the first rendered frame. Its loaded
      // property becomes true earlier, before shaders and textures are ready.
      setLoadStatus({ url: model.url, status: "ready" });
    };
    const failed = () => {
      if (disposed || settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(stallTimeout);
      setLoadStatus({ url: model.url, status: "error" });
    };
    const onProgress = (event: Event) => {
      if (disposed || settled) return;
      const value = (event as CustomEvent<{ totalProgress?: number }>).detail?.totalProgress;
      if (typeof value !== "number" || !Number.isFinite(value)) return;
      const normalized = Math.max(0, Math.min(1, value));
      if (normalized > lastProgress) {
        lastProgress = normalized;
        watchForStall();
      }
      const percent = Math.round(normalized * 100);
      setProgress((previous) => Math.max(previous, percent));
    };
    const onContextRestored = () => {
      if (disposed) return;
      // Remount against the vendor's restored renderer and await a fresh load.
      setLoadStatus({ url: model.url, status: "loading" });
      setProgress(0);
      setAttempt((value) => value + 1);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (disposed) return;
      lostContext?.removeEventListener("webglcontextrestored", onContextRestored);
      lostContext = event.target;
      lostContext?.addEventListener("webglcontextrestored", onContextRestored);
      // Keep the canvas mounted so the browser can restore it. A temporary
      // context loss must not disable every subsequent jar for this page visit.
      settled = false;
      setLoadStatus({ url: model.url, status: "loading" });
      setProgress(0);
      watchForStall();
    };
    const onError = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string; sourceError?: Event }>).detail;
      if (detail?.type === "webglcontextlost") {
        onContextLost(detail.sourceError ?? event);
        return;
      }
      failed();
    };

    watchForStall();

    element.addEventListener("load", ready);
    element.addEventListener("error", onError);
    element.addEventListener("progress", onProgress);
    element.addEventListener("webglcontextlost", onContextLost);

    // Use the vendor's production bundle in dev too, avoiding Lit's debug runtime.
    import("@google/model-viewer/dist/model-viewer.js").then(({ ModelViewerElement }) => {
      // Active viewers are protected by the cache; release past carousel jars.
      ModelViewerElement.modelCacheSize = 1;
    }).catch(() => {
      if (!disposed) failed();
    });

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      window.clearTimeout(stallTimeout);
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(frame.current);
      element.removeEventListener("load", ready);
      element.removeEventListener("error", onError);
      element.removeEventListener("progress", onProgress);
      element.removeEventListener("webglcontextlost", onContextLost);
      lostContext?.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [model.url, activated, attempt]);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    element.toggleAttribute("auto-rotate", moving && autoRotate && !rotationPaused && status === "ready");
  }, [moving, autoRotate, rotationPaused, status]);

  const resetVisuals = useCallback(() => {
    const container = stage.current;
    if (!container) return;
    container.style.setProperty("--model-x", "0px");
    container.style.setProperty("--model-y", "0px");
    container.style.setProperty("--model-roll", "0deg");
    container.style.setProperty("--model-scale", "1");
    container.style.setProperty("--model-glow-x", "50%");
    container.style.setProperty("--model-glow-y", "50%");
    container.removeAttribute("data-hovered");
  }, []);

  const resetPosition = useCallback(() => {
    dragging.current = false;
    stage.current?.removeAttribute("data-interacting");
    if (!tracking.current) return;
    tracking.current = false;
    cancelAnimationFrame(frame.current);
    resetVisuals();
    viewer.current?.setAttribute("camera-orbit", `0deg 90deg ${cameraDistancePercent}%`);
  }, [cameraDistancePercent, resetVisuals]);

  useEffect(() => {
    if (!cursorEnabled || status !== "ready") resetPosition();
  }, [cursorEnabled, status, resetPosition]);

  const startDrag = () => {
    if (!showcase) return;
    // Native camera controls own the gesture until the pointer leaves the stage.
    dragging.current = true;
    stage.current?.setAttribute("data-interacting", "true");
    tracking.current = false;
    cancelAnimationFrame(frame.current);
    resetVisuals();
  };

  const followCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (!cursorEnabled || dragging.current || event.pointerType !== "mouse" || event.buttons || status !== "ready") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    tracking.current = true;
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const container = stage.current;
      if (!container) return;
      const strength = motion.intensity;
      container.style.setProperty("--model-x", `${x * (showcase ? 7 : 12) * strength}px`);
      container.style.setProperty("--model-y", `${(showcase ? y * 3 - 9 : y * 8) * strength}px`);
      if (showcase) {
        container.setAttribute("data-hovered", "true");
        container.style.setProperty("--model-roll", `${-x * 1.6 * strength}deg`);
        container.style.setProperty("--model-scale", `${1 + .035 * strength}`);
        container.style.setProperty("--model-glow-x", `${50 + x * 18}%`);
        container.style.setProperty("--model-glow-y", `${50 + y * 12}%`);
      }
      viewer.current?.setAttribute("camera-orbit", `${x * (showcase ? 14 : 25) * strength}deg ${90 + y * (showcase ? 7 : 12) * strength}deg ${cameraDistancePercent}%`);
    });
  };

  const fallback = poster?.url ? (
    <Image
      src={poster.url}
      alt={poster.altText || model.altText}
      fill
      loading={eager ? "eager" : "lazy"}
      sizes={presentation === "gallery" ? "(max-width: 960px) 95vw, 48vw" : "(max-width: 900px) 40vw, 28vw"}
      className={styles.poster}
      onLoad={onPosterReady}
    />
  ) : null;

  const retry = () => {
    setWebglSupported(null);
    setLoadStatus({ url: model.url, status: "loading" });
    setProgress(0);
    setAttempt((value) => value + 1);
  };

  if (webglSupported === false) {
    return (
      <div ref={stage} className={`${styles.stage} ${styles.unavailable}`} data-status="error">
        {fallback}
        <span className={styles.hint} role="status">3D view unavailable</span>
        <button type="button" className={styles.retry} onClick={retry}>Retry 3D view</button>
      </div>
    );
  }

  return (
    <div ref={stage} className={styles.stage} data-status={status} data-presentation={presentation} data-motion={cursorEnabled} data-transition={motion.enabled && settings.transition !== "none"} style={{ "--model-float-lift": `${-7 * motion.intensity}px`, "--model-float-tilt": `${.6 * motion.intensity}deg` } as CSSProperties} onPointerMove={followCursor} onPointerLeave={resetPosition} onPointerCancel={resetPosition} onPointerDown={startDrag} onPointerUp={() => stage.current?.removeAttribute("data-interacting")}>
      {fallback && <div className={styles.posterLayer} aria-hidden={status === "ready"}>{fallback}</div>}
      {activated && status !== "error" && <div className={styles.floatLayer} data-floating={floating} data-floating-running={floating && moving && !rotationPaused}><ModelViewer key={attempt} ref={viewer} {...{
        src: optimizedModelUrl(model.url),
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
        "interpolation-decay": showcase ? "100" : undefined,
        "min-field-of-view": "25deg",
        "max-field-of-view": "45deg",
        "rotation-per-second": `${settings.rotationSpeed}deg`,
        "auto-rotate-delay": presentation === "gallery" ? "3000" : "0",
        "shadow-intensity": "0.8",
        "shadow-softness": "1",
        "interaction-prompt": "none",
        // Activation already applies our viewport/near-viewport loading policy.
        loading: "eager",
        reveal: "auto",
      }} /></div>}
      {status === "ready" && (autoRotate || floating) && (
        <button className={styles.pause} type="button" onClick={() => setRotationPaused((value) => !value)} aria-pressed={rotationPaused} aria-label={`${rotationPaused ? "Resume" : "Pause"} product ${floating ? "floating" : "rotation"}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {rotationPaused ? <path d="M5 2.5 13 8l-8 5.5z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}
          </svg>
        </button>
      )}
      {activated && status === "loading" && (
        <span className={styles.hint} role="status">
          {progress >= 100 ? "Preparing 3D view…" : "Loading 3D view…"}
          <span className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></span>
        </span>
      )}
      {status === "error" && <button type="button" className={styles.retry} onClick={retry}>Retry 3D view</button>}
    </div>
  );
}
