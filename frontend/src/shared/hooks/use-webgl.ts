"use client";

import { useEffect, useState } from "react";

let cachedWebGL: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (cachedWebGL !== null) return cachedWebGL;
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    const supported = Boolean(gl);
    const ext = gl && "getExtension" in gl ? (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context") : null;
    if (ext) ext.loseContext();
    cachedWebGL = supported;
    return supported;
  } catch {
    cachedWebGL = false;
    return false;
  }
}

export function markWebGLUnavailable(): void {
  cachedWebGL = false;
}

export function useWebGL(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(isWebGLAvailable());
  }, []);

  return available;
}
