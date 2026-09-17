"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoreImage } from "@/domain/catalog/products";
import type { SheryConfig } from "@/domain/shery-config";
import { sheryFrameDocument } from "./shery-frame-document";
import styles from "./ingredient-poster.module.css";

type Props = { images: StoreImage[]; config: SheryConfig; selected: number; active: boolean; cursor: boolean; duration: number; debug?: boolean; className?: string; onClose?: () => void; onSelect?: (index: number) => void };

export function SheryPoster({ images, config, selected, active, cursor, duration, debug = false, className, onClose, onSelect }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const pointerInside = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const document = useMemo(() => sheryFrameDocument(images, config, debug), [images, config, debug]);
  const sendState = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ channel: "naturemist-shery", type: "state", selected, active, cursor, duration }, window.location.origin);
  }, [selected, active, cursor, duration]);
  const sendPointer = useCallback((inside: boolean) => {
    pointerInside.current = inside;
    frame.current?.contentWindow?.postMessage({ channel: "naturemist-shery", type: "pointer", inside }, window.location.origin);
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== window.location.origin || event.data?.channel !== "naturemist-shery") return;
      if (event.data.type === "ready") { setReady(true); sendState(); sendPointer(pointerInside.current); }
      if (event.data.type === "error") setFailed(true);
      if (event.data.type === "close") onClose?.();
      if (event.data.type === "index" && Number.isInteger(event.data.selected) && event.data.selected >= 0 && event.data.selected < images.length) onSelect?.(event.data.selected);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [sendState, sendPointer, onClose, onSelect, images.length]);
  useEffect(sendState, [sendState]);

  if (failed && !debug) return null;
  return <iframe ref={frame} title={debug ? "Shery.js native Gooey Panel and Debug Panel" : "Interactive botanical poster"}
    className={[styles.sheryFrame, className].filter(Boolean).join(" ")} data-ready={ready} data-debug={debug} srcDoc={document} onLoad={sendState}
    onPointerEnter={() => sendPointer(true)} onPointerLeave={() => sendPointer(false)}
    allow={debug ? "clipboard-write" : undefined} tabIndex={debug ? 0 : -1} aria-hidden={debug ? undefined : true} />;
}
