"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultSheryBackgroundConfig, type SheryConfig } from "@/domain/shery-config";
import { sheryBackgroundDocument } from "./shery-background-document";
import type { BackgroundFit } from "./background-fit";
import type { StoreImage } from "@/domain/catalog/products";
import styles from "./shery-background.module.css";

type Props = {
  images: StoreImage[];
  config?: SheryConfig;
  selected: number;
  active: boolean;
  duration: number;
  fit?: BackgroundFit;
  className?: string;
};

export function SheryBackground({
  images,
  config = defaultSheryBackgroundConfig,
  selected,
  active,
  duration,
  fit = "cover",
  className,
}: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const documentHtml = useMemo(() => sheryBackgroundDocument(images, config, fit), [images, config, fit]);

  const sendState = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      {
        channel: "naturemist-shery-bg",
        type: "state",
        selected,
        active,
        duration,
      },
      window.location.origin
    );
  }, [selected, active, duration]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.channel !== "naturemist-shery-bg"
      )
        return;

      if (event.data.type === "ready") {
        setReady(true);
        sendState();
      }
      if (event.data.type === "error") {
        setFailed(true);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [sendState]);

  useEffect(sendState, [sendState]);

  if (failed) return null;

  return (
    <iframe
      ref={frame}
      title="SheryJS botanical hero background"
      className={[styles.sheryBackgroundFrame, className].filter(Boolean).join(" ")}
      data-ready={ready}
      srcDoc={documentHtml}
      onLoad={sendState}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
