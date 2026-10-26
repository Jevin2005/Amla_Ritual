import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const bundle = buildSync({
  stdin: {
    contents: 'export { VideoReviewsSection } from "./src/widgets/home/video-reviews-section"; export { VideoReviewModal } from "./src/features/reviews/video-review-modal";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true, platform: "node", format: "cjs", write: false,
  external: ["react", "react/jsx-runtime", "next/image", "next/link", "@/features/store/store-provider", "@/features/reviews/review-card"],
}).outputFiles[0].text;

const videos = Array.from({ length: 6 }, (_, index) => ({
  id: `video-${index}`, creator: `Customer ${index}`, title: `Story ${index}`,
  duration: "0:45", image: `/poster-${index}.jpg`, videoUrl: `/story-${index}.mp4`,
  productTag: "Amla", productSlug: "amla-powder", testimonial: "Test fixture",
}));
const store = { content: { customerReviews: [], videoReviews: videos }, products: [], addToCart() {} };

function events(extra = {}) {
  const listeners = new Map();
  return {
    ...extra, listeners,
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) || new Set();
      callbacks.add(callback); listeners.set(type, callbacks);
    },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    emit(type) { for (const callback of listeners.get(type) || []) callback(); },
  };
}

function fixture({ hooks = false, reduced = false } = {}) {
  const effects = [], refs = [], stateChanges = [], observers = [], frames = new Map();
  let frameId = 0;
  const document = events({ hidden: false, body: { style: { overflow: "" } }, activeElement: null });
  const window = events({ matchMedia: () => ({ matches: reduced }) });
  const react = hooks ? {
    ...React,
    useRef(initial) { const ref = { current: initial }; refs.push(ref); return ref; },
    useState(initial) {
      let value = typeof initial === "function" ? initial() : initial;
      return [value, (next) => {
        const result = typeof next === "function" ? next(value) : next;
        if (!Object.is(result, value)) stateChanges.push(result);
        value = result;
      }];
    },
    useMemo: (fn) => fn(), useCallback: (fn) => fn,
    useEffect: (fn) => effects.push(fn),
  } : React;
  const context = vm.createContext({
    module: { exports: {} }, URL, console, document, window,
    HTMLElement: class {}, localStorage: { getItem: () => null },
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {} disconnect() { this.disconnected = true; }
    },
    require(name) {
      if (name === "react") return react;
      if (name === "@/features/store/store-provider") return { useStore: () => store };
      if (name === "@/features/reviews/review-card") return { ReviewCard: () => null };
      if (name === "next/image") return ({ fill, ...props }) => React.createElement("img", props);
      if (name === "next/link") return (props) => React.createElement("a", props);
      return require(name);
    },
  });
  vm.runInContext(bundle, context);
  return {
    ...context.module.exports, effects, refs, stateChanges, observers, frames, document, window,
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); },
  };
}

function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

test("six home stories render posters without loading any video or iframe", () => {
  const { VideoReviewsSection } = fixture();
  const html = renderToStaticMarkup(React.createElement(VideoReviewsSection));
  assert.equal((html.match(/aria-label="Play Story/g) || []).length, 6);
  assert.equal((html.match(/<img /g) || []).length, 6);
  assert.doesNotMatch(html, /<video|<iframe|story-\d\.mp4|preload="auto"/);
});

test("scroll and resize bursts share one frame and unchanged boundaries do not redraw", () => {
  const env = fixture({ hooks: true });
  const tree = env.VideoReviewsSection();
  const carousel = nodes(tree).find((node) => node.props?.id === "home-video-stories");
  const element = events({ scrollWidth: 1800, clientWidth: 900, scrollLeft: 0, style: {} });
  carousel.props.ref.current = element;
  const cleanup = env.effects.map((effect) => effect()).filter(Boolean);
  assert.equal(env.frames.size, 1);
  env.flush();
  assert.equal(env.stateChanges.length, 1);
  for (let i = 0; i < 100; i++) { element.emit("scroll"); env.observers[0].callback(); }
  assert.equal(env.frames.size, 1);
  env.flush();
  assert.equal(env.stateChanges.length, 1, "idle bounds must retain the existing state object");
  element.scrollLeft = 400; element.emit("scroll"); env.flush();
  assert.equal(env.stateChanges.length, 2);
  element.scrollLeft = 450; element.emit("scroll"); env.flush();
  assert.equal(env.stateChanges.length, 2, "scrolling within the same bounds must not redraw cards");
  carousel.props.onMouseDown({ button: 0, clientX: 200 });
  assert.equal(element.style.scrollSnapType, "none");
  env.window.emit("blur");
  assert.equal(element.style.scrollSnapType, "");
  element.emit("scroll");
  cleanup.forEach((dispose) => dispose());
  assert.equal(env.frames.size, 0);
  assert.equal(element.listeners.get("scroll").size, 0);
  assert.ok(env.observers.every((observer) => observer.disconnected));
});

test("carousel arrows respect reduced motion and a story opens only on click", () => {
  const env = fixture({ hooks: true, reduced: true });
  const tree = env.VideoReviewsSection();
  const elements = nodes(tree);
  const carousel = elements.find((node) => node.props?.id === "home-video-stories");
  let movement;
  carousel.props.ref.current = { clientWidth: 900, scrollBy: (options) => { movement = options; } };
  elements.find((node) => node.props?.controls === "home-video-stories").props.onNext();
  assert.equal(movement.behavior, "instant");
  elements.find((node) => node.props?.video === videos[0]).props.onOpen();
  assert.equal(env.stateChanges.at(-1), videos[0]);
});

test("the selected modal owns one player and releases it on close or hides it on tab switch", () => {
  const env = fixture({ hooks: true });
  const tree = env.VideoReviewModal({ video: videos[0], onClose() {} });
  const mediaNodes = nodes(tree).filter((node) => node.type === "video");
  assert.equal(mediaNodes.length, 1);
  assert.equal(mediaNodes[0].props.preload, "none");
  const player = {
    src: videos[0].videoUrl, pauses: 0, loads: 0,
    getAttribute() { return this.src; },
    removeAttribute() { this.src = null; },
    pause() { this.pauses++; }, load() { this.loads++; },
  };
  mediaNodes[0].props.ref.current = player;
  const cleanup = env.effects.map((effect) => effect()).filter(Boolean);
  assert.equal(env.document.body.style.overflow, "hidden");
  env.document.hidden = true; env.document.emit("visibilitychange");
  assert.equal(player.pauses, 1);
  cleanup.forEach((dispose) => dispose());
  assert.equal(player.src, null);
  assert.equal(player.loads, 1);
  assert.equal(env.document.body.style.overflow, "");
  assert.equal(env.document.listeners.get("visibilitychange").size, 0);
  // Effect replay must restore a source released by React Strict Mode.
  const replayCleanup = env.effects[1]();
  assert.equal(player.src, videos[0].videoUrl);
  replayCleanup();
});
