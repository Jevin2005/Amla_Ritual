"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./product-hero.module.css";

/** A visual link hint only: the jar itself remains the interactive target. */
export function HeroDiscoverHint({ animated }: { animated: boolean }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hint = root.current;
    const section = hint?.closest<HTMLElement>("[data-ritual-hero]");
    if (!hint || !section) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let shown = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let hintWidth = 0, hintHeight = 0;
    let hoveredJar: Element | null = null;

    const hide = () => {
      shown = false;
      hoveredJar = null;
      hint.dataset.visible = "false";
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const paint = (time: number) => {
      frame = 0;
      if (!shown) return;
      const delta = lastTime ? Math.min(48, Math.max(0, time - lastTime)) : 16.7;
      lastTime = time;
      const ease = animated && !reducedMotion.matches ? 1 - Math.exp(-delta / 65) : 1;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      const moving = Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1;
      if (!moving) { x = targetX; y = targetY; }
      hint.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (moving) frame = requestAnimationFrame(paint);
      else lastTime = 0;
    };
    const follow = (event: PointerEvent) => {
      const jar = (event.target as Element | null)?.closest?.("[data-hero-product]");
      if (event.pointerType !== "mouse" || !finePointer.matches || event.buttons || document.hidden
        || section.dataset.dragging === "true" || section.dataset.revealing === "true"
        || !jar || !section.contains(jar)) {
        hide();
        return;
      }
      if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
      hoveredJar = jar;
      if (!shown) {
        hintWidth = hint.offsetWidth;
        hintHeight = hint.offsetHeight;
      }
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const right = event.clientX + 22;
      const left = right + hintWidth <= viewportWidth - 12 ? right : event.clientX - hintWidth - 22;
      targetX = Math.max(12, Math.min(left, viewportWidth - hintWidth - 12));
      targetY = Math.max(12, Math.min(event.clientY - hintHeight / 2, viewportHeight - hintHeight - 12));
      if (!shown) {
        // Start beside this cursor, never fly in from the previous hovered jar.
        x = targetX;
        y = targetY;
        hint.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        shown = true;
        hint.dataset.visible = "true";
      }
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leaveJar = (event: PointerEvent) => {
      const next = (event.relatedTarget as Element | null)?.closest?.("[data-hero-product]");
      if (next !== hoveredJar) hide();
    };
    const observer = new MutationObserver(() => {
      if (section.dataset.dragging === "true" || section.dataset.revealing === "true") hide();
    });
    observer.observe(section, { attributes: true, attributeFilter: ["data-dragging", "data-revealing"] });
    section.addEventListener("pointerover", follow, { passive: true });
    section.addEventListener("pointermove", follow, { passive: true });
    section.addEventListener("pointerout", leaveJar, { passive: true });
    section.addEventListener("pointerleave", hide);
    section.addEventListener("pointerdown", hide);
    section.addEventListener("wheel", hide, { passive: true });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    document.addEventListener("keydown", hide);
    finePointer.addEventListener("change", hide);
    reducedMotion.addEventListener("change", hide);
    return () => {
      hide();
      observer.disconnect();
      section.removeEventListener("pointerover", follow);
      section.removeEventListener("pointermove", follow);
      section.removeEventListener("pointerout", leaveJar);
      section.removeEventListener("pointerleave", hide);
      section.removeEventListener("pointerdown", hide);
      section.removeEventListener("wheel", hide);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      document.removeEventListener("keydown", hide);
      finePointer.removeEventListener("change", hide);
      reducedMotion.removeEventListener("change", hide);
    };
  }, [animated]);

  return (
    <span ref={root} className={styles.discover} data-hero-discover data-animated={animated} aria-hidden="true">
      <span className={styles.discoverText}>
        <span className={styles.discoverWord}>
          {Array.from("Discover").map((letter, index) => (
            <span className={styles.discoverLetter} style={{ "--letter-index": index } as CSSProperties} key={index}>{letter}</span>
          ))}
        </span>
        <span className={styles.discoverArrow} aria-hidden="true">↗</span>
      </span>
    </span>
  );
}
