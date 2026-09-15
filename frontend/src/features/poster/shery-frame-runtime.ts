import { createFrameClock } from "./shery-frame-clock";
import type { Mesh, Scene, Camera, Texture, WebGLRenderer } from "three";
import type { SheryConfig } from "@/domain/shery-config";

type Uniforms = Record<string, { value: number | boolean | Texture[] | { x: number; y: number } }>;
type Attributes = { renderer: WebGLRenderer; scene: Scene; camera: Camera; meshes: Mesh[]; uniforms: Uniforms[] };
declare global {
  interface Window {
    Shery: {
      imageEffect: (
        selector: string,
        options: {
          style: number;
          gooey?: boolean;
          debug?: boolean;
          config?: SheryConfig;
          slideStyle?: (setScroll: (x: number) => void, setLerp?: (y: number) => void) => void;
          setAttribute?: (attributes: Attributes) => void;
        }
      ) => void;
    };
  }
}

const data = JSON.parse(document.getElementById("shery-data")!.textContent!) as { images: { url: string; altText?: string }[]; config: SheryConfig; debug: boolean };
const poster = document.getElementById("poster")!;
// about:srcdoc has a "null" location.origin despite inheriting our origin.
const parentOrigin = parent.location.origin;
const parentUrl = parent.location.href;
const clock = createFrameClock(window.requestAnimationFrame.bind(window), window.cancelAnimationFrame.bind(window));
window.requestAnimationFrame = clock.request;
window.cancelAnimationFrame = clock.cancel;
let attributes: Attributes | undefined;
let textures: Texture[] = [];
let pair: Texture[] | undefined;
let selected = 0, current = 0, duration = 1100;
let cursor = true, active = true, ready = false, disposed = false, failed = false;
let prevCursor = true;
let cursorFadeStart: number | undefined;
let cursorFadeFrom = 0;
const CURSOR_FADE_MS = 500;
let cursorFadeInStart: number | undefined;
const CURSOR_FADE_IN_MS = 400;
let transition:
  | {
      start: number;
      target: number;
      duration: number;
      radius: number;
      growSize: number;
      swapped: boolean;
    }
  | undefined;
let loadTimeout: ReturnType<typeof setTimeout> | undefined;
let resizePending = false;
const send = (type: string) => parent.postMessage({ channel: "naturemist-shery", type }, parentOrigin);
const fail = () => {
  if (disposed || failed) return;
  failed = true;
  clock.setActive(false);
  const error = document.getElementById("error")!;
  error.textContent = "The Shery preview could not load. Refresh to retry, or use the regular poster gallery.";
  if (data.debug) error.hidden = false;
  send("error");
};
function watchLoading() {
  if (ready || disposed || failed || !active || document.hidden) {
    clearTimeout(loadTimeout); loadTimeout = undefined;
  } else if (loadTimeout === undefined) {
    loadTimeout = setTimeout(() => { loadTimeout = undefined; if (!ready && active && !document.hidden) fail(); }, 20000);
  }
}

function setPair(fromIndex: number, toIndex: number) {
  if (!attributes || !textures.length) return;
  const from = ((fromIndex % textures.length) + textures.length) % textures.length;
  const to = ((toIndex % textures.length) + textures.length) % textures.length;
  if (textures[from]) textures[from].needsUpdate = true;
  if (textures[to]) textures[to].needsUpdate = true;
  pair = [textures[from], textures[to]];
  attributes.uniforms[0].uTexture.value = pair;
}
function settle() {
  if (!attributes || !textures.length) return;
  if (transition) attributes.uniforms[0].metaball.value = transition.radius;
  transition = undefined; current = selected;
  setPair(current, (current + 1) % textures.length);
  attributes.uniforms[0].uIntercept.value = 0;
}
function select(index: number) {
  const next = ((index % data.images.length) + data.images.length) % data.images.length;
  if (transition && transition.target === next) return;
  selected = next;
  if (!ready || data.debug || !attributes) return;
  if (transition) settle();
  if (!active || current === selected) { settle(); return; }
  setPair(current, selected);
  const growSize = Math.max(4, Number(data.config?.growSize?.value) || 8);
  transition = {
    start: performance.now(),
    target: selected,
    duration,
    radius: Number(attributes.uniforms[0].metaball?.value) || 0.2,
    growSize,
    swapped: false,
  };
}

window.addEventListener("message", (event) => {
  if (event.source !== parent || event.origin !== parentOrigin || event.data?.channel !== "naturemist-shery") return;
  const state = event.data;
  if (state.type !== "state") return;
  cursor = state.cursor === true;
  active = state.active === true;
  duration = Number.isFinite(state.duration) ? Math.max(100, Math.min(5500, state.duration)) : 1100;
  if (Number.isInteger(state.selected) && selected !== state.selected) select(state.selected);
  if (!active && ready && !data.debug) settle();
  clock.setActive(active && !document.hidden && !failed);
  watchLoading();
});
document.addEventListener("visibilitychange", () => { clock.setActive(active && !document.hidden && !failed); watchLoading(); });
window.addEventListener("error", fail);
window.addEventListener("unhandledrejection", fail);
window.addEventListener("pagehide", () => {
  disposed = true; clock.dispose();
  clearTimeout(loadTimeout);
  const seen = new Set<Texture>(textures);
  for (const mesh of attributes?.meshes || []) {
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => material.dispose());
  }
  (attributes?.uniforms[0].uTexture.value as Texture[] | undefined)?.forEach((texture) => seen.add(texture));
  seen.forEach((texture) => texture.dispose());
  attributes?.renderer.dispose(); attributes?.renderer.forceContextLoss();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") send("close"); });

// Prevent Shery's uncoordinated native mousedown listener from starting an unsynced GSAP loop
if (poster && typeof poster.addEventListener === "function") {
  poster.addEventListener(
    "mousedown",
    (event) => {
      if (!data.debug) event.stopImmediatePropagation();
    },
    true
  );
}

window.addEventListener("click", (event) => {
  if (!ready || data.debug || data.images.length < 2) return;
  if (event?.target instanceof Element && event.target.closest("#controlKit")) return;
  const next = (selected + 1) % data.images.length;
  select(next);
  // Do NOT send "index" here — settle() sends it after the bloom transition
  // finishes so React's <Image> only swaps once, hidden at the bloom peak.
});
// Shery's shared image-loading flag cannot safely recrop half-loaded images.
window.addEventListener("resize", (event) => {
  if (!ready) { resizePending = true; event.stopImmediatePropagation(); }
}, true);

// Shery 1.0.0-beta.0.1.8 reads the legacy window.event in one mouse listener.
// Supply it only in this frame on browsers which do not expose that property.
if (!("event" in window)) {
  let currentEvent: MouseEvent | undefined;
  Object.defineProperty(window, "event", { configurable: true, get: () => currentEvent });
  document.addEventListener("mousemove", (event) => { currentEvent = event; }, true);
}

async function loadScript(name: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `/vendor/shery/${name}`;
    script.onload = () => resolve(); script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function start() {
  watchLoading();
  await loadScript("three.min.js");
  await loadScript("gsap.min.js");
  if (data.debug) await loadScript("controlkit.js");
  await loadScript("Shery.js");
  if (disposed) return;
  for (const image of data.images) {
    const element = document.createElement("img");
    const url = new URL(image.url, parentUrl);
    if (url.hostname === "cdn.shopify.com") url.searchParams.set("width", "1024");
    element.crossOrigin = "anonymous"; element.src = url.href; element.alt = image.altText || "Botanical ritual";
    poster.appendChild(element);
  }
  await Promise.all(Array.from(poster.querySelectorAll("img"), (image) => image.decode().catch(() => {})));
  if (disposed) return;

  // Build uniform 1024x1280 textures with aspect-ratio cover to eliminate
  // WebGL glTexSubImage2D dimension mismatch errors on posters.
  const imgElements = Array.from(poster.querySelectorAll("img"));
  const testCanvas = typeof document.createElement === "function" ? document.createElement("canvas") : null;
  const has2D = testCanvas && typeof testCanvas.getContext === "function" && Boolean(testCanvas.getContext("2d"));

  if (has2D && typeof (window as unknown as { THREE?: { Texture?: unknown } }).THREE?.Texture === "function" && imgElements.length > 0) {
    const THREE = (window as unknown as { THREE: typeof import("three") }).THREE;
    textures = imgElements.map((img) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const natW = img.naturalWidth || img.width || 1024;
        const natH = img.naturalHeight || img.height || 1280;
        const imgAspect = natW / natH;
        const targetAspect = 1024 / 1280;
        let sx = 0, sy = 0, sw = natW, sh = natH;
        if (imgAspect > targetAspect) {
          sw = natH * targetAspect;
          sx = (natW - sw) / 2;
        } else {
          sh = natW / targetAspect;
          sy = (natH - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1024, 1280);
      }
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });
  }

  const canWebGL = (() => {
    try {
      const canvas = typeof document.createElement === "function" ? document.createElement("canvas") : null;
      if (!canvas || typeof canvas.getContext !== "function") {
        return true;
      }
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      const ok = Boolean(gl);
      if (gl && typeof (gl as unknown as { getExtension?: (name: string) => { loseContext?: () => void } }).getExtension === "function") {
        (gl as unknown as { getExtension: (name: string) => { loseContext?: () => void } }).getExtension("WEBGL_lose_context")?.loseContext?.();
      }
      return ok;
    } catch {
      return false;
    }
  })();
  if (!canWebGL) {
    fail();
    return;
  }

  // The panels and their sliders are created by Shery itself, unchanged.
  try {
    window.Shery.imageEffect("#poster", {
      style: 6, gooey: true, debug: data.debug,
      config: data.config,
      setAttribute(value) {
        attributes = value;
        value.renderer.debug.onShaderError = fail;
        value.renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          fail();
        });
        const render = value.renderer.render.bind(value.renderer);
        value.renderer.render = (scene, camera) => {
          if (failed || disposed) return;
        const uniforms = value.uniforms[0];
        if (value.meshes[0].visible) {
          if (!ready) {
            if (!textures.length && Array.isArray(uniforms.uTexture.value)) {
              textures = [...uniforms.uTexture.value as Texture[]];
            }
            ready = true;
            watchLoading();
            if (!data.debug) settle();
            send("ready");
            if (resizePending) { resizePending = false; queueMicrotask(() => window.dispatchEvent(new Event("resize"))); }
          }

          // Keep active texture pair attached to avoid fallback
          if (pair && uniforms.uTexture.value !== pair) {
            uniforms.uTexture.value = pair;
          }

          if (!data.debug && transition) {
            const elapsed = performance.now() - transition.start;
            const progress = Math.min(1, elapsed / transition.duration);
            uniforms.uIntercept.value = 1;
            uniforms.mousei.value = { x: .5, y: .5 };

            if (progress < 0.5) {
              // Phase 1: Bloom expands outward from center (0 -> 1)
              const p = progress * 2;
              const eased = p * p * (3 - 2 * p);
              uniforms.metaball.value = transition.radius + eased * (transition.growSize - transition.radius);
            } else {
              // At halfway peak (progress >= 0.5): blob is at full size — swap textures
              // and notify React to switch its <Image> while it is completely hidden.
              if (!transition.swapped) {
                transition.swapped = true;
                current = transition.target;
                setPair(current, (current + 1) % textures.length);
                // Switch React's fallback <Image> now, hidden behind the full-size bloom.
                // Phase 2 will shrink the blob over the already-correct image.
                parent.postMessage({ channel: "naturemist-shery", type: "index", selected: current }, parentOrigin);
              }
              // Phase 2: Bloom contracts back down smoothly (1 -> 0)
              const p = (progress - 0.5) * 2;
              const eased = 1 - (p * p * (3 - 2 * p));
              uniforms.metaball.value = transition.radius + eased * (transition.growSize - transition.radius);
            }

            if (progress >= 1) {
              settle();
              // postMessage already sent at the swap peak; settle() is a no-op for React here.
            }
          } else {
            // Detect the moment cursor goes false and begin a smooth fade-out
            if (prevCursor && !cursor) {
              cursorFadeStart = performance.now();
              cursorFadeFrom = Number(uniforms.uIntercept.value) || 0;
            }
            prevCursor = cursor;
            if (!cursor) {
              if (cursorFadeStart !== undefined && cursorFadeFrom > 0) {
                const elapsed = performance.now() - cursorFadeStart;
                const t = Math.min(1, elapsed / CURSOR_FADE_MS);
                // ease-out cubic: fast start, gentle finish
                const eased = 1 - Math.pow(1 - t, 3);
                uniforms.uIntercept.value = cursorFadeFrom * (1 - eased);
                if (t >= 1) { uniforms.uIntercept.value = 0; cursorFadeStart = undefined; }
              } else {
                uniforms.uIntercept.value = 0;
              }
            } else {
              // Cursor active — reset fade-out bookkeeping
              cursorFadeStart = undefined;
              cursorFadeFrom = 0;
              // Detect the moment cursor goes true and begin a smooth fade-in
              if (!prevCursor && cursor) {
                cursorFadeInStart = performance.now();
              }
              prevCursor = true;
              // Scale Shery's uIntercept by the fade-in envelope (0 → 1)
              if (cursorFadeInStart !== undefined) {
                const elapsed = performance.now() - cursorFadeInStart;
                const t = Math.min(1, elapsed / CURSOR_FADE_IN_MS);
                // cubic ease-in: slow start, snappy finish
                const scale = t * t * t;
                uniforms.uIntercept.value = Number(uniforms.uIntercept.value) * scale;
                if (t >= 1) cursorFadeInStart = undefined;
              }
            }
          }
        }
        render(scene, camera);
      };
    },
  });
} catch {
  fail();
}
}
start().catch(fail);
