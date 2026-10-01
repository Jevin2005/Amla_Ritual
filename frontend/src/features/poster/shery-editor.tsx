"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { StoreImage } from "@/domain/catalog/products";
import type { SheryConfig } from "@/domain/shery-config";
import { SheryPoster } from "./shery-poster";
import styles from "./ingredient-poster.module.css";

export function SheryEditor({ images, config, active, onClose }: { images: StoreImage[]; config: SheryConfig; active: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return createPortal(<dialog ref={dialog} className={styles.editor} onClose={onClose} aria-label="Shery.js effect editor">
    <header className={styles.editorHeader}>
      <div><strong>Shery.js native controls</strong><p>Expand Gooey Panel to adjust. Use Debug Panel → Save To Clipboard, then paste into store hero preset (JSON) field.</p></div>
      <button type="button" onClick={() => dialog.current?.close()} autoFocus>Close</button>
    </header>
    <div className={styles.editorPreview}><SheryPoster images={images} config={config} selected={0} active={active} cursor duration={1100} debug onClose={() => dialog.current?.close()} /></div>
  </dialog>, document.body);
}
