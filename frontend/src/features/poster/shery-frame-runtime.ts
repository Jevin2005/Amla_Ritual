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
let parentSelected: number | undefined;
let cursor = true, active = true, ready = false, disposed = false, failed = false;
let pointerInside = false;
let prevCursor = false;
let cursorVisibility = 0;
let cursorFadeStart: number | undefined;
let cursorFadeFrom = 0;
const CURSOR_FADE_MS = 500;
const CURSOR_FADE_IN_MS = 400;
let repaintTextures: (() => void) | undefined;
let transition:
  | {
      start: number;
      target: number;
      duration: number;
      radius: number;
      growSize: number;
      expansionFraction: number;
      swapped: boolean;
    }
  | undefined;
let loadTimeout: ReturnType<typeof setTimeout> | undefined;
let resizePending = false;
const send = (type: string) => parent.postMessage({ channel: "naturemist-shery", type }, parentOrigin);
const fail = () => {
  if (disposed || failed) return;
  failed = true;
  clearTimeout(loadTimeout); loadTimeout = undefined;
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
function settle(notify = false) {
  if (!attributes || !textures.length) return;
  const notifySelection = notify && transition && !transition.swapped;
  if (transition) attributes.uniforms[0].metaball.value = transition.radius;
  transition = undefined; current = selected;
  setPair(current, (current + 1) % textures.length);
  attributes.uniforms[0].uIntercept.value = 0;
  cursorVisibility = 0; prevCursor = false; cursorFadeStart = undefined;
  if (notifySelection) parent.postMessage({ channel: "naturemist-shery", type: "index", selected: current }, parentOrigin);
}
function select(index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= data.images.length) return;
  const next = ((index % data.images.length) + data.images.length) % data.images.length;
  if (transition && transition.target === next) return;
  if (transition && attributes) {
    attributes.uniforms[0].metaball.value = transition.radius;
    transition = undefined;
  }
  selected = next;
  if (!ready || data.debug || !attributes) return;
  if (!active || current === selected) { settle(); return; }
  setPair(current, selected);
  const growSize = Math.max(4, Number(data.config?.growSize?.value) || 8);
  const out = Math.max(.1, Number(data.config?.durationOut?.value) || 1);
  const inside = Math.max(.1, Number(data.config?.durationIn?.value) || 1.5);
  transition = {
    start: performance.now(),
    target: selected,
    duration,
    radius: Number(attributes.uniforms[0].metaball?.value) || 0.2,
    growSize,
    expansionFraction: out / (out + inside),
    swapped: false,
  };
}

window.addEventListener("message", (event) => {
  if (event.source !== parent || event.origin !== parentOrigin || event.data?.channel !== "naturemist-shery") return;
  const state = event.data;
  if (state.type === "pointer") {
    if (!data.debug && typeof state.inside === "boolean") pointerInside = state.inside;
    return;
  }
  if (state.type !== "state") return;
  cursor = state.cursor === true;
  active = state.active === true;
  duration = Number.isFinite(state.duration) ? Math.max(100, Math.min(5500, state.duration)) : 1100;
  // Cursor/visibility updates repeat the parent's last committed index while a
  // local click is still blooming. Only a changed parent index is a new command.
  if (Number.isInteger(state.selected) && state.selected >= 0 && state.selected < data.images.length && state.selected !== parentSelected) {
    parentSelected = state.selected;
    if (selected !== state.selected) select(state.selected);
  }
  if (!active && ready && !data.debug) settle(true);
  clock.setActive(active && !document.hidden && !failed);
  watchLoading();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && ready && !data.debug) settle(true);
  clock.setActive(active && !document.hidden && !failed); watchLoading();
});
window.addEventListener("error", fail);
window.addEventListener("unhandledrejection", fail);
window.addEventListener("pagehide", () => {
  disposed = true; clock.dispose();
  repaintTextures = undefined; pointerInside = false;
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

// Wheel events inside this same-origin srcDoc do not bubble to the storefront.
// Let its document scroller handle them, preserving native input when disabled.
window.addEventListener("wheel", (event) => {
  if (data.debug || event.defaultPrevented || !event.cancelable || !window.frameElement) return;
  const forwarded = new WheelEvent("wheel", {
    bubbles: true, cancelable: true, composed: true,
    deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode,
    ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, altKey: event.altKey,
  });
  window.frameElement.dispatchEvent(forwarded);
  if (forwarded.defaultPrevented) event.preventDefault();
}, { passive: false });

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
  if (!ready || data.debug || !active || document.hidden || failed || disposed || event.button !== 0 || data.images.length < 2) return;
  if (event?.target instanceof Element && event.target.closest("#controlKit")) return;
  const next = (selected + 1) % data.images.length;
  select(next);
  parent.postMessage({ channel: "naturemist-shery", type: "click", selected: next }, parentOrigin);
});
window.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") pointerInside = true; }, true);
// An iframe can become interactive under an already stationary pointer, so its
// first movement may arrive without a matching pointerenter event.
window.addEventListener("mousemove", () => {
  const canHover = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && active && !document.hidden) pointerInside = true;
}, true);
window.addEventListener("pointerleave", (event) => {
  if (!event.relatedTarget) pointerInside = false;
}, true);
window.addEventListener("mouseleave", (event) => {
  if (!event.relatedTarget) pointerInside = false;
}, true);
window.addEventListener("blur", () => { pointerInside = false; });
// Shery's shared image-loading flag cannot safely recrop half-loaded images.
window.addEventListener("resize", (event) => {
  if (!ready) { resizePending = true; event.stopImmediatePropagation(); }
  else repaintTextures?.();
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
  await Promise.all(data.images.map(async (image) => {
    const element = document.createElement("img");
    const original = new URL(image.url, parentUrl);
    const url = new URL(original.href);
    if (url.hostname === "cdn.shopify.com") url.searchParams.set("width", "1024");
    element.crossOrigin = "anonymous"; element.src = url.href; element.alt = image.altText || "Botanical ritual";
    poster.appendChild(element);
    await element.decode().catch(() => {});
    // Shopify can serve the original before a resized variant is available.
    // Keep the gooey transition when the same photo can still load in full.
    if ((!element.naturalWidth || !element.naturalHeight) && url.href !== original.href && !disposed && !failed) {
      element.src = original.href;
      await element.decode().catch(() => {});
    }
  }));
  if (disposed || failed) return;

  // All textures share the actual frame aspect, preserving the same cover crop
  // as the HTML fallback without stretching jars or labels.
  const imgElements = Array.from(poster.querySelectorAll("img"));
  if (!imgElements.length || imgElements.some((image) => !image.naturalWidth || !image.naturalHeight)) {
    fail();
    return;
  }
  const testCanvas = typeof document.createElement === "function" ? document.createElement("canvas") : null;
  const has2D = testCanvas && typeof testCanvas.getContext === "function" && Boolean(testCanvas.getContext("2d"));

  if (has2D && typeof (window as unknown as { THREE?: { Texture?: unknown } }).THREE?.Texture === "function" && imgElements.length > 0) {
    const THREE = (window as unknown as { THREE: typeof import("three") }).THREE;
    const surfaces = imgElements.map((img) => {
      const canvas = document.createElement("canvas");
      const tex = new THREE.Texture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return { img, canvas, tex };
    });
    let paintedWidth = 0, paintedHeight = 0;
    repaintTextures = () => {
      const bounds = poster.getBoundingClientRect();
      const aspect = bounds.width > 0 && bounds.height > 0 ? bounds.width / bounds.height : .8;
      const width = Math.max(1, Math.round(1024 * Math.min(1, aspect)));
      const height = Math.max(1, Math.round(1024 / Math.max(1, aspect)));
      if (width === paintedWidth && height === paintedHeight) return;
      paintedWidth = width; paintedHeight = height;
      surfaces.forEach(({ img, canvas, tex }) => {
        // Dispose the old GPU allocation before changing source dimensions.
        if (canvas.width !== width || canvas.height !== height) tex.dispose();
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx || !img.naturalWidth || !img.naturalHeight) return;
        const natW = img.naturalWidth || img.width || 1024;
        const natH = img.naturalHeight || img.height || 1280;
        const imgAspect = natW / natH;
        const targetAspect = width / height;
        let sx = 0, sy = 0, sw = natW, sh = natH;
        if (imgAspect > targetAspect) {
          sw = natH * targetAspect;
          sx = (natW - sw) / 2;
        } else {
          sh = natW / targetAspect;
          sy = (natH - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        tex.needsUpdate = true;
      });
    };
    repaintTextures();
    textures = surfaces.map(({ tex }) => tex);
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
        if (!data.debug) {
          // Shery's reversed/equal smoothstep edges are undefined in GLSL;
          // make the same mask well-defined, especially at zero hover radius.
          for (const mesh of value.meshes) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) {
              const shader = material as typeof material & { fragmentShader?: string };
              if (typeof shader.fragmentShader !== "string") continue;
              shader.fragmentShader = shader.fragmentShader
                .replace("smoothstep(interpole.x,.0,distance(mouse,pos))", "(1.0 - smoothstep(0.0, max(interpole.x, 0.00001), distance(mouse,pos)))")
                .replace("smoothstep(discard_threshold-antialias_threshold,discard_threshold,val)", "(uIntercept > 0.0 ? smoothstep(discard_threshold-max(antialias_threshold,0.0001),discard_threshold,val) : 0.0)");
              shader.needsUpdate = true;
            }
          }
        }
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

            const split = transition.expansionFraction;
            const ease = (value: number) => value < .5 ? 16 * value ** 5 : 1 - (-2 * value + 2) ** 5 / 2;
            if (progress < split) {
              // Phase 1: Bloom expands outward from center (0 -> 1)
              const p = progress / split;
              const eased = ease(p);
              uniforms.metaball.value = transition.radius + eased * (transition.growSize - transition.radius);
            } else {
              // At the configured expansion peak the blob fills the frame.
              // Both slots then hold the selected image throughout contraction.
              // and notify React to switch its <Image> while it is completely hidden.
              if (!transition.swapped) {
                transition.swapped = true;
                current = transition.target;
                setPair(current, current);
                // Switch React's fallback <Image> now, hidden behind the full-size bloom.
                // Phase 2 will shrink the blob over the already-correct image.
                parent.postMessage({ channel: "naturemist-shery", type: "index", selected: current }, parentOrigin);
              }
              // Phase 2: Bloom contracts back down smoothly (1 -> 0)
              const p = (progress - split) / (1 - split);
              const eased = 1 - ease(p);
              uniforms.metaball.value = transition.radius + eased * (transition.growSize - transition.radius);
            }

            if (progress >= 1) {
              settle();
              // postMessage already sent at the swap peak; settle() is a no-op for React here.
            }
          } else if (!data.debug) {
            const showCursor = cursor && pointerInside && active && !document.hidden;
            if (prevCursor !== showCursor) {
              cursorFadeStart = performance.now();
              cursorFadeFrom = cursorVisibility;
              prevCursor = showCursor;
            }
            if (cursorFadeStart !== undefined) {
              const elapsed = performance.now() - cursorFadeStart;
              const t = Math.min(1, elapsed / (showCursor ? CURSOR_FADE_IN_MS : CURSOR_FADE_MS));
              const eased = 1 - (1 - t) ** 3;
              cursorVisibility = cursorFadeFrom + ((showCursor ? 1 : 0) - cursorFadeFrom) * eased;
              if (t >= 1) cursorFadeStart = undefined;
            }
            uniforms.uIntercept.value = cursorVisibility;
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
