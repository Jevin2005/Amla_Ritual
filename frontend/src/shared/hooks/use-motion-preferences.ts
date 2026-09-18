"use client";

import { useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
const finePointerQuery = "(hover: hover) and (pointer: fine)";
const compactViewportQuery = "(max-width: 900px)";
function subscribeCompactViewport(callback: () => void) {
  const media = window.matchMedia(compactViewportQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeFinePointer(callback: () => void) {
  const media = window.matchMedia(finePointerQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
}

export function useFinePointer() {
  return useSyncExternalStore(subscribeFinePointer, () => window.matchMedia(finePointerQuery).matches, () => false);
}

export function usePageVisible() {
  return useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
}

export function useCompactViewport() {
  return useSyncExternalStore(subscribeCompactViewport, () => window.matchMedia(compactViewportQuery).matches, () => false);
}
