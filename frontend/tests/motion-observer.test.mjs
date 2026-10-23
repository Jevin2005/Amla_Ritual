import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  stdin: {
    contents: 'import { MotionObserver } from "./src/shared/ui/motion-observer"; export function setup() { MotionObserver(); }',
    resolveDir: root,
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  external: ["react", "@/features/store/store-provider"],
}).outputFiles[0].text;

class Events {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emit(type, event = {}) { for (const listener of this.listeners.get(type) ?? []) listener(event); }
}

function fixture({ reduced = false, enabled = true, animationSupport = true } = {}) {
  const immutable = () => new Proxy({}, { set() { throw new Error("Mutated React-owned HTML before hydration"); } });
  class Element {
    dataset = immutable();
    style = immutable();
    children = [];
    parentElement = null;
    isConnected = true;
    animations = [];
    constructor(top) { this.top = top; if (!animationSupport) this.animate = undefined; }
    matches() { return true; }
    closest() { return null; }
    hasAttribute() { return false; }
    setAttribute() { throw new Error("Mutated React-owned HTML before hydration"); }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    contains(node) { return node === this || this.children.includes(node); }
    getBoundingClientRect() { return { top: this.top }; }
    animate(keyframes, options) {
      const animation = {
        keyframes, options, paused: false, cancelled: false,
        pause() { this.paused = true; },
        cancel() { this.cancelled = true; this.oncancel?.(); },
      };
      this.animations.push(animation);
      return animation;
    }
  }
  const above = new Element(100);
  const below = new Element(1200);
  const targets = [above, below];
  const body = { dataset: immutable() };
  const document = Object.assign(new Events(), { body, hidden: false, activeElement: null, querySelectorAll: () => targets });
  const media = Object.assign(new Events(), { matches: reduced });
  const frames = new Map();
  const observers = [];
  const mutations = [];
  let id = 0;
  let cleanup;
  class IntersectionObserver {
    observed = new Set();
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.observed.add(element); }
    unobserve(element) { this.observed.delete(element); }
    disconnect() { this.observed.clear(); }
    reveal(element) { this.callback([{ target: element, isIntersecting: true }]); }
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe() {}
    disconnect() {}
  }
  const context = vm.createContext({
    module: { exports: {} }, document, HTMLElement: Element, IntersectionObserver, MutationObserver,
    window: { innerHeight: 800, IntersectionObserver, matchMedia: (query) => query.includes("reduced-motion") ? media : { matches: true } },
    requestAnimationFrame: (callback) => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: (frame) => frames.delete(frame),
    require: (name) => name === "react"
      ? { useEffect: (effect) => { cleanup = effect(); } }
      : { useStore: () => ({ content: { motionSettings: { enabled, duration: 1 } } }) },
  });
  vm.runInContext(bundle, context);
  const flush = () => { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(); };
  const setup = () => { context.module.exports.setup(); flush(); };
  setup();
  return { above, below, targets, Element, document, media, observers, mutations, frames, flush, setup, cleanup: () => cleanup() };
}

test("reveal registration never mutates markup, including streamed elements awaiting hydration", () => {
  const f = fixture();
  assert.equal(f.above.animations.length, 0, "already-visible content must not flash");
  assert.equal(f.below.animations[0].paused, true);
  const streamed = new f.Element(1600);
  f.targets.push(streamed);
  f.mutations[0].callback([{ addedNodes: [streamed], removedNodes: [] }]);
  f.flush();
  assert.equal(streamed.animations[0].paused, true);
  f.observers[0].reveal(streamed);
  assert.equal(streamed.animations[0].cancelled, true);
  assert.equal(streamed.animations[1].options.duration, 480);
  f.mutations[0].callback([{ addedNodes: [streamed], removedNodes: [] }]);
  f.flush();
  assert.equal(streamed.animations.length, 2, "a revealed element does not replay");
  f.cleanup();
});

test("keyboard focus and reduced motion immediately expose pending content", () => {
  const f = fixture();
  f.document.emit("focusin", { target: f.below });
  assert.equal(f.below.animations[0].cancelled, true);
  assert.equal(f.below.animations.length, 1, "focus reveals without an entrance animation");
  f.cleanup();
  const reduced = fixture();
  reduced.media.matches = true;
  reduced.media.emit("change");
  assert.equal(reduced.below.animations[0].cancelled, true);
  reduced.cleanup();
});

test("cleanup and StrictMode remounts cannot leave content hidden or replay it", () => {
  const f = fixture();
  f.cleanup();
  assert.equal(f.below.animations[0].cancelled, true);
  f.setup();
  assert.equal(f.below.animations.length, 1);
  f.cleanup();
});

test("removed route content releases its pending animation", () => {
  const f = fixture();
  f.below.isConnected = false;
  f.mutations[0].callback([{ addedNodes: [], removedNodes: [f.below], target: f.document }]);
  f.flush();
  assert.equal(f.below.animations[0].cancelled, true);
  assert.equal(f.observers[0].observed.has(f.below), false);
  f.cleanup();
});

test("animated text replacements do not schedule reveal scans", () => {
  const f = fixture();
  for (let frame = 0; frame < 120; frame++) {
    f.mutations[0].callback([{ addedNodes: [{ nodeType: 3 }], removedNodes: [{ nodeType: 3 }], target: f.above }]);
  }
  assert.equal(f.frames.size, 0);
  f.cleanup();
});

test("reduced motion, disabled motion and unsupported browsers keep content visible", () => {
  for (const options of [{ reduced: true }, { enabled: false }, { animationSupport: false }]) {
    const f = fixture(options);
    assert.equal(f.below.animations.length, 0);
    f.cleanup();
  }
});
