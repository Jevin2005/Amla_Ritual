"use client";

import { createElement, useEffect, useRef, useState, type PointerEvent } from "react";
import { defaultHeroSettings, type HeroSettings } from "@/domain/catalog/hero";
import { usePageVisible, useReducedMotion } from "@/shared/hooks/use-motion-preferences";
import styles from "./product-model.module.css";

type Props = {
  model: { url: string; altText: string };
  settings?: HeroSettings;
  paused?: boolean;
  eager?: boolean;
};

export function ProductModel(props: Props) {
  return <ModelStage key={props.model.url} {...props} />;
}

function ModelStage({ model, settings = defaultHeroSettings, paused = false, eager = false }: Props) {
  const viewer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const tracking = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [visible, setVisible] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const moving = !paused && !reducedMotion && pageVisible && visible;

  useEffect(() => {
    const element = viewer.current;
    const container = stage.current;
    if (!element || !container) return;
    let disposed = false;
    const ready = () => setStatus("ready");
    const failed = () => setStatus("error");
    element.addEventListener("load", ready);
    element.addEventListener("error", failed);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(container);
    import("@google/model-viewer").catch(() => { if (!disposed) failed(); });
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      element.removeEventListener("load", ready);
      element.removeEventListener("error", failed);
    };
  }, []);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    element.toggleAttribute("auto-rotate", moving && settings.autoRotate && !rotationPaused && status === "ready");
  }, [moving, settings.autoRotate, rotationPaused, status]);

  const resetPosition = () => {
    if (!tracking.current) return;
    tracking.current = false;
    cancelAnimationFrame(frame.current);
    stage.current?.style.setProperty("--model-x", "0px");
    stage.current?.style.setProperty("--model-y", "0px");
    viewer.current?.setAttribute("camera-orbit", "0deg 75deg 105%");
  };

  const followCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (!moving || !settings.cursorMotion || event.pointerType !== "mouse" || event.buttons || status !== "ready") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tracking.current = true;
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      stage.current?.style.setProperty("--model-x", `${x * 12}px`);
      stage.current?.style.setProperty("--model-y", `${y * 8}px`);
      viewer.current?.setAttribute("camera-orbit", `${x * 25}deg ${75 + y * 12}deg 105%`);
    });
  };

  return (
    <div ref={stage} className={styles.stage} data-status={status} onPointerMove={followCursor} onPointerLeave={resetPosition}>
      {createElement("model-viewer", {
        ref: viewer,
        src: model.url,
        alt: model.altText,
        className: styles.viewer,
        style: { opacity: status === "ready" ? 1 : 0, pointerEvents: status === "ready" ? "auto" : "none" },
        "aria-hidden": status !== "ready",
        inert: status !== "ready",
        "camera-controls": "",
        "disable-zoom": "",
        "disable-pan": "",
        "touch-action": "pan-y",
        "camera-orbit": "0deg 75deg 105%",
        "rotation-per-second": `${settings.rotationSpeed}deg`,
        "auto-rotate-delay": "0",
        "shadow-intensity": "0.7",
        "shadow-softness": "1",
        "interaction-prompt": "none",
        loading: eager ? "eager" : "lazy",
        reveal: "auto",
      })}
      {status === "ready" && settings.autoRotate && !reducedMotion && (
        <button className={styles.pause} type="button" onClick={() => setRotationPaused((value) => !value)} aria-pressed={rotationPaused} aria-label={rotationPaused ? "Resume product rotation" : "Pause product rotation"}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {rotationPaused ? <path d="M5 2.5 13 8l-8 5.5z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}
          </svg>
        </button>
      )}
      {status !== "ready" && <span className={styles.hint} role="status">
        {status === "error" ? "3D view unavailable" : "Loading 3D view…"}
      </span>}
    </div>
  );
}
