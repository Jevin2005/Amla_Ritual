import { createFrameClock } from "./shery-frame-clock";
import type { Mesh, Scene, Camera, Texture, WebGLRenderer } from "three";
import type { SheryConfig } from "@/domain/shery-config";

type Uniforms = Record<string, { value: number | boolean | Texture[] | { x: number; y: number } }>;
type Attributes = { renderer: WebGLRenderer; scene: Scene; camera: Camera; meshes: Mesh[]; uniforms: Uniforms[] };
declare global {
  interface Window { Shery: { imageEffect: (selector: string, options: { style: number; gooey: boolean; debug: boolean; config: SheryConfig; setAttribute: (attributes: Attributes) => void }) => void }; }
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
let transition: { start: number; target: number; duration: number; radius: number; growSize?: number } | undefined;
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

function setPair(index: number, next: number) {
  if (!attributes || !textures.length) return;
  pair = [textures[index % textures.length], textures[next % textures.length]];
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
  selected = ((index % data.images.length) + data.images.length) % data.images.length;
  if (!ready || data.debug || !attributes) return;
  if (transition) settle();
  if (!active || current === selected) { settle(); return; }
  setPair(current, selected);
  const growSize = Number(data.config?.growSize?.value) || 8;
  transition = { start: performance.now(), target: selected, duration, radius: Number(attributes.uniforms[0].metaball.value), growSize };
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
window.addEventListener("click", (event) => {
  if (!ready || data.debug || data.images.length < 2) return;
  if (event?.target instanceof Element && event.target.closest("#controlKit")) return;
  const next = (selected + 1) % data.images.length;
  select(next);
  parent.postMessage({ channel: "naturemist-shery", type: "index", selected: next }, parentOrigin);
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
  await Promise.all(Array.from(poster.querySelectorAll("img"), (image) => image.decode()));
  if (disposed) return;
  // The panels and their sliders are created by Shery itself, unchanged.
  window.Shery.imageEffect("#poster", {
    style: 6, gooey: true, debug: data.debug,
    config: data.config,
    setAttribute(value) {
      attributes = value;
      value.renderer.debug.onShaderError = fail;
      value.renderer.domElement.addEventListener("webglcontextlost", fail);
      const render = value.renderer.render.bind(value.renderer);
      value.renderer.render = (scene, camera) => {
        if (failed || disposed) return;
        const uniforms = value.uniforms[0];
        if (value.meshes[0].visible) {
          if (!ready) {
            textures = [...uniforms.uTexture.value as Texture[]];
            ready = true;
            watchLoading();
            if (!data.debug) settle();
            send("ready");
            if (resizePending) { resizePending = false; queueMicrotask(() => window.dispatchEvent(new Event("resize"))); }
          }
          if (!data.debug && transition) {
            const progress = Math.min(1, (performance.now() - transition.start) / transition.duration);
            uniforms.uIntercept.value = 1;
            uniforms.mousei.value = { x: .5, y: .5 };
            uniforms.metaball.value = progress * progress * (3 - 2 * progress) * (transition.growSize || 8);
            if (progress === 1) {
              settle();
              parent.postMessage({ channel: "naturemist-shery", type: "index", selected: current }, parentOrigin);
            }
          } else if (!cursor) {
            uniforms.uIntercept.value = 0;
          }

          // Detect native Shery mousedown click transition to the next image
          if (ready && !transition && Array.isArray(uniforms.uTexture.value) && uniforms.uTexture.value.length >= 2) {
            const currentBase = uniforms.uTexture.value[0];
            const activeIdx = textures.indexOf(currentBase);
            if (activeIdx !== -1 && activeIdx !== current) {
              current = activeIdx;
              selected = activeIdx;
              pair = [textures[current], textures[(current + 1) % textures.length]];
              parent.postMessage({ channel: "naturemist-shery", type: "index", selected: current }, parentOrigin);
            }
          }
        }
        render(scene, camera);
      };
    },
  });
}
start().catch(fail);
