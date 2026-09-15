import { createFrameClock } from "../poster/shery-frame-clock";
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

const data = JSON.parse(document.getElementById("shery-data")!.textContent!) as {
  images: { url: string; altText?: string }[];
  config: SheryConfig;
  debug: boolean;
};
const background = document.getElementById("background")!;
const parentOrigin = parent.location.origin;
const parentUrl = parent.location.href;
const clock = createFrameClock(window.requestAnimationFrame.bind(window), window.cancelAnimationFrame.bind(window));
window.requestAnimationFrame = clock.request;
window.cancelAnimationFrame = clock.cancel;

let attributes: Attributes | undefined;
let textures: Texture[] = [];
let pair: Texture[] | undefined;
let selected = 0;
let current = 0;
let duration = 1100;
let active = true;
let ready = false;
let disposed = false;
let failed = false;
let transition: { start: number; target: number; duration: number } | undefined;
let loadTimeout: ReturnType<typeof setTimeout> | undefined;
let resizePending = false;
let setScrollCallback: ((val: number) => void) | undefined;
let setLerpCallback: ((val: number) => void) | undefined;

const send = (type: string, extra: Record<string, unknown> = {}) =>
  parent.postMessage({ channel: "naturemist-shery-bg", type, ...extra }, parentOrigin);

const fail = () => {
  if (disposed || failed) return;
  failed = true;
  clock.setActive(false);
  const error = document.getElementById("error")!;
  error.textContent = "The Shery background could not load.";
  if (data.debug) error.hidden = false;
  send("error");
};

function watchLoading() {
  if (ready || disposed || failed || !active || document.hidden) {
    clearTimeout(loadTimeout);
    loadTimeout = undefined;
  } else if (loadTimeout === undefined) {
    loadTimeout = setTimeout(() => {
      loadTimeout = undefined;
      if (!ready && active && !document.hidden) fail();
    }, 20000);
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
  transition = undefined;
  current = selected;
  // Settle base to the selected product, paired with the next one in the loop.
  // This guarantees when uScroll resets to rest, it renders textures[selected] completely static.
  setPair(current, (current + 1) % textures.length);
  const isWipe = attributes.uniforms[0].scrollType?.value === 0;
  const restScroll = isWipe ? -0.15 : 0;
  if (setScrollCallback) setScrollCallback(restScroll);
  attributes.uniforms[0].uScroll.value = restScroll;
  attributes.uniforms[0].uSection.value = 0;
  if (attributes.uniforms[0].time) attributes.uniforms[0].time.value = 0;
  if (attributes.uniforms[0].onMouse) attributes.uniforms[0].onMouse.value = 1;
  if (attributes.uniforms[0].uIntercept) attributes.uniforms[0].uIntercept.value = 0;
  if (attributes.uniforms[0].currentScroll) {
    attributes.uniforms[0].currentScroll.value = -1;
  }
}

function select(index: number) {
  const next = ((index % data.images.length) + data.images.length) % data.images.length;
  if (transition && transition.target === next) return;
  selected = next;
  if (!ready || !attributes || !textures.length) return;
  if (transition) settle();
  if (!active || current === selected) {
    settle();
    return;
  }
  setPair(current, selected);
  if (attributes.uniforms[0].currentScroll) {
    attributes.uniforms[0].currentScroll.value = -1;
  }
  transition = { start: performance.now(), target: selected, duration };
}

window.addEventListener("message", (event) => {
  if (event.source !== parent || event.origin !== parentOrigin || event.data?.channel !== "naturemist-shery-bg") return;
  const state = event.data;
  if (state.type !== "state") return;
  active = state.active === true;
  duration = Number.isFinite(state.duration) ? Math.max(100, Math.min(5500, state.duration)) : 1100;
  if (Number.isInteger(state.selected) && (selected !== state.selected || (transition && transition.target !== state.selected))) {
    select(state.selected);
  }
  if (!active && ready) settle();
  clock.setActive(active && !document.hidden && !failed);
  watchLoading();
});

document.addEventListener("visibilitychange", () => {
  clock.setActive(active && !document.hidden && !failed);
  watchLoading();
});

window.addEventListener("error", fail);
window.addEventListener("unhandledrejection", fail);

window.addEventListener("pagehide", () => {
  disposed = true;
  clock.dispose();
  clearTimeout(loadTimeout);
  const seen = new Set<Texture>(textures);
  for (const mesh of attributes?.meshes || []) {
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((m) => m.dispose());
  }
  (attributes?.uniforms[0]?.uTexture?.value as Texture[] | undefined)?.forEach((t) => seen.add(t));
  seen.forEach((t) => t.dispose());
  attributes?.renderer.dispose();
  attributes?.renderer.forceContextLoss();
});

window.addEventListener(
  "resize",
  (event) => {
    if (!ready) {
      resizePending = true;
      event.stopImmediatePropagation();
    }
  },
  true
);

if (!("event" in window)) {
  let currentEvent: MouseEvent | undefined;
  Object.defineProperty(window, "event", { configurable: true, get: () => currentEvent });
  document.addEventListener("mousemove", (e) => { currentEvent = e; }, true);
}

async function loadScript(name: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `/vendor/shery/${name}`;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function start() {
  watchLoading();
  await loadScript("three.min.js");
  await loadScript("gsap.min.js");
  await loadScript("Shery.js");
  if (disposed) return;

  for (const image of data.images) {
    const element = document.createElement("img");
    const url = new URL(image.url, parentUrl);
    if (url.hostname === "cdn.shopify.com") url.searchParams.set("width", "1920");
    element.crossOrigin = "anonymous";
    element.src = url.href;
    element.alt = image.altText || "Botanical background";
    background.appendChild(element);
  }

  await Promise.all(
    Array.from(background.querySelectorAll("img"), (img) => img.decode().catch(() => {}))
  );
  if (disposed) return;

  // Build uniform 1920x1080 textures with aspect-ratio cover to eliminate
  // WebGL glTexSubImage2D dimension mismatch errors.
  const imgElements = Array.from(background.querySelectorAll("img"));
  if (typeof (window as unknown as { THREE?: { Texture?: unknown } }).THREE?.Texture === "function" && imgElements.length > 0) {
    const THREE = (window as unknown as { THREE: typeof import("three") }).THREE;
    textures = imgElements.map((img) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const natW = img.naturalWidth || img.width || 1920;
        const natH = img.naturalHeight || img.height || 1080;
        const imgAspect = natW / natH;
        const targetAspect = 1920 / 1080;
        let sx = 0, sy = 0, sw = natW, sh = natH;
        if (imgAspect > targetAspect) {
          sw = natH * targetAspect;
          sx = (natW - sw) / 2;
        } else {
          sh = natW / targetAspect;
          sy = (natH - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1920, 1080);
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

  // Initialize Multiple Image Scroll Effect using Style 5 and Custom Scroll Trigger Callback (slideStyle)
  try {
    window.Shery.imageEffect("#background", {
      style: 5,
      config: {
        scrollType: { value: 0 },
        displaceAmount: { value: 0.08 },
        noise_speed: { value: 0 },
        noise_scale: { value: 10 },
        shapeEdgeSoftness: { value: 0 },
        onMouse: { value: 1 },
        a: { value: 0 },
        b: { value: 0 },
        ...data.config,
      },
      slideStyle: (setScroll, setLerp) => {
        setScrollCallback = setScroll;
        setLerpCallback = setLerp;
        if (setLerpCallback) setLerpCallback(1.0);
      },
      setAttribute(value) {
        attributes = value;
        value.renderer.debug.onShaderError = fail;
        value.renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          fail();
        });

      // Ensure crisp alpha
      const mesh = value.meshes[0];
      if (mesh && mesh.material) {
        mesh.visible = true;
      }

      // Intercept currentScroll to prevent Shery from fighting custom slideStyle
      if (value.uniforms[0]?.currentScroll) {
        try {
          Object.defineProperty(value.uniforms[0].currentScroll, "value", {
            get: () => -1,
            set: () => {},
            configurable: true,
          });
        } catch {
          value.uniforms[0].currentScroll.value = -1;
        }
      }

      const render = value.renderer.render.bind(value.renderer);
      value.renderer.render = (scene, camera) => {
        if (failed || disposed) return;
        const uniforms = value.uniforms[0];
        if (value.meshes[0]) {
          value.meshes[0].visible = true;

          if (!ready) {
            if (!textures.length && Array.isArray(uniforms.uTexture.value)) {
              textures = [...(uniforms.uTexture.value as Texture[])];
            }
            ready = true;
            watchLoading();
            settle();
            send("ready");
            if (resizePending) {
              resizePending = false;
              queueMicrotask(() => window.dispatchEvent(new Event("resize")));
            }
          }

          // Keep active texture pair attached
          if (pair && uniforms.uTexture.value !== pair) {
            uniforms.uTexture.value = pair;
          }

          // Disable static liquid wobble when not transitioning
          if (uniforms.onMouse) uniforms.onMouse.value = 1;
          if (uniforms.uIntercept) uniforms.uIntercept.value = 0;

          // Handle smooth scroll trigger transition
          if (transition) {
            const progress = Math.min(1, (performance.now() - transition.start) / transition.duration);
            // Smooth cubic easing
            const eased = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const isWipe = uniforms.scrollType?.value === 0;
            const scrollVal = isWipe ? -0.15 + eased * 1.3 : eased;

            if (setScrollCallback) {
              setScrollCallback(scrollVal);
            }
            uniforms.uScroll.value = scrollVal;
            uniforms.uSection.value = 0;

            if (progress >= 1) {
              settle();
            }
          } else {
            const isWipe = uniforms.scrollType?.value === 0;
            const restScroll = isWipe ? -0.15 : 0;
            if (uniforms.uScroll) uniforms.uScroll.value = restScroll;
            if (uniforms.uSection) uniforms.uSection.value = 0;
            if (uniforms.time) uniforms.time.value = 0;
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
