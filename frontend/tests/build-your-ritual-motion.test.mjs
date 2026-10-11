import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  entryPoints: [`${root}src/widgets/home/build-your-ritual-motion.ts`],
  bundle: true,
  platform: "browser",
  format: "iife",
  globalName: "ritualMotion",
  write: false,
}).outputFiles[0].text;

class EventTarget {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
  listenerCount() {
    return [...this.listeners.values()].reduce((count, listeners) => count + listeners.size, 0);
  }
}

function fixture(preferences = {}) {
  const observers = [];
  class IntersectionObserver {
    observed = new Set();
    disconnected = false;
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      observers.push(this);
    }
    observe(target) { this.observed.add(target); }
    disconnect() { this.disconnected = true; this.observed.clear(); }
    emit(inView) { this.callback([{ isIntersecting: inView }]); }
  }
  const mutations = [];
  class MutationObserver {
    disconnected = false;
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe(target, options) { this.target = target; this.options = options; }
    disconnect() { this.disconnected = true; }
    emit() { this.callback([]); }
  }
  const focusTarget = {};
  const panel = Object.assign(new EventTarget(), {
    dataset: {},
    animations: [],
    contains: (target) => target === focusTarget,
    getBoundingClientRect: () => ({ top: preferences.top ?? 1200 }),
    animate(keyframes, options) {
      const animation = {
        keyframes, options, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); },
        finish() { this.onfinish?.(); },
      };
      this.animations.push(animation);
      return animation;
    },
  });
  const reduced = Object.assign(new EventTarget(), { matches: preferences.reducedMotion ?? false });
  const desktop = Object.assign(new EventTarget(), { matches: preferences.desktop ?? true });
  const document = Object.assign(new EventTarget(), {
    hidden: preferences.hidden ?? false,
    activeElement: preferences.focused ? focusTarget : null,
    documentElement: { dataset: { siteMotion: preferences.siteMotion ?? "on" } },
  });
  const window = {
    innerHeight: 800,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reduced : desktop,
    MutationObserver,
    ...(preferences.intersectionObserver === false ? {} : { IntersectionObserver }),
  };
  const context = vm.createContext({ window, document, IntersectionObserver, MutationObserver });
  vm.runInContext(bundle, context);
  const setup = () => context.ritualMotion.installRitualSectionMotion(panel, {
    enabled: true, cursor: true, duration: 1, intensity: 1, ...preferences.settings,
  });
  return { panel, reduced, desktop, document, observers, mutations, setup, observer: () => observers.at(-1) };
}

test("section enters once, rising 16px over 520ms with the requested easing", () => {
  const { panel, observer, setup } = fixture({ settings: { duration: 1.5 } });
  const cleanup = setup();
  assert.equal(panel.dataset.ritualReveal, "pending");
  observer().emit(false);
  assert.equal(panel.animations.length, 0);
  observer().emit(true);
  assert.equal(panel.dataset.ritualReveal, "done");
  assert.equal(panel.animations.length, 1);
  const { keyframes, options } = panel.animations[0];
  assert.equal(keyframes[0].opacity, 0);
  assert.equal(keyframes[0].transform, "translate3d(0, 16px, 0)");
  assert.equal(keyframes[1].opacity, 1);
  assert.equal(keyframes[1].transform, "none");
  assert.equal(options.duration, 520);
  assert.equal(options.easing, "cubic-bezier(0.22, 1, 0.36, 1)");
  assert.equal(options.fill, "backwards");
  observer().emit(false);
  observer().emit(true);
  assert.equal(panel.animations.length, 1);
  cleanup();
});

test("painted content, focused content and missing observers never start hidden", () => {
  for (const preferences of [
    { top: 0 }, { top: -300 }, { top: 799 }, { focused: true }, { intersectionObserver: false },
  ]) {
    const { panel, setup } = fixture(preferences);
    const cleanup = setup();
    assert.equal(panel.dataset.ritualReveal, "done");
    assert.equal(panel.animations.length, 0);
    cleanup();
  }
});

test("StrictMode cleanup preserves completed entrances and re-arms pending ones", () => {
  const complete = fixture();
  const cleanupFirst = complete.setup();
  complete.observer().emit(true);
  cleanupFirst();
  assert.equal(complete.panel.animations[0].cancelled, true);
  const cleanupSecond = complete.setup();
  complete.observer().emit(true);
  assert.equal(complete.panel.animations.length, 1);
  assert.equal(complete.panel.dataset.ritualReveal, "done");
  cleanupSecond();

  const pending = fixture();
  pending.setup()();
  assert.notEqual(pending.panel.dataset.ritualReveal, "pending");
  const cleanupPending = pending.setup();
  assert.equal(pending.panel.dataset.ritualReveal, "pending");
  pending.observer().emit(true);
  assert.equal(pending.panel.animations.length, 1);
  cleanupPending();
});

test("keyboard focus exposes pending content and cancels an active entrance immediately", () => {
  for (const entering of [false, true]) {
    const { panel, setup, observer } = fixture();
    const cleanup = setup();
    if (entering) observer().emit(true);
    panel.dispatch("focusin");
    assert.equal(panel.dataset.ritualReveal, "done");
    if (entering) assert.equal(panel.animations[0].cancelled, true);
    observer().emit(true);
    assert.equal(panel.animations.length, entering ? 1 : 0);
    cleanup();
  }
});

test("ambient decoration runs only on desktop while visible in the active tab", () => {
  const { panel, document, desktop, observer, setup } = fixture();
  const cleanup = setup();
  assert.equal(panel.dataset.ambient, "false");
  observer().emit(true);
  assert.equal(panel.dataset.ambient, "true");
  observer().emit(false);
  assert.equal(panel.dataset.ambient, "false");
  observer().emit(true);
  document.hidden = true;
  document.dispatch("visibilitychange");
  assert.equal(panel.dataset.ambient, "false");
  document.hidden = false;
  document.dispatch("visibilitychange");
  assert.equal(panel.dataset.ambient, "true");
  desktop.matches = false;
  desktop.dispatch("change");
  assert.equal(panel.dataset.ambient, "false");
  desktop.matches = true;
  desktop.dispatch("change");
  assert.equal(panel.dataset.ambient, "true");
  cleanup();
});

test("reduced motion and a changed global motion switch cancel animation immediately", () => {
  for (const preference of ["reduced", "global"]) {
    const { panel, document, reduced, mutations, observer, setup } = fixture();
    const cleanup = setup();
    observer().emit(true);
    assert.equal(panel.animations.length, 1);
    if (preference === "reduced") {
      reduced.matches = true;
      reduced.dispatch("change");
    } else {
      document.documentElement.dataset.siteMotion = "off";
      mutations[0].emit();
    }
    assert.equal(panel.animations[0].cancelled, true);
    assert.equal(panel.dataset.ritualReveal, "done");
    assert.equal(panel.dataset.ambient, "false");
    cleanup();
  }
});

test("initial motion restrictions keep all content visible and decoration static", () => {
  for (const preferences of [
    { reducedMotion: true }, { hidden: true }, { settings: { enabled: false } },
    { settings: { intensity: 0 } }, { siteMotion: "off" },
  ]) {
    const { panel, observer, setup } = fixture(preferences);
    const cleanup = setup();
    assert.equal(panel.dataset.ritualReveal, "done");
    observer().emit(true);
    assert.equal(panel.animations.length, 0);
    assert.equal(panel.dataset.ambient, "false");
    cleanup();
  }
});

test("cleanup releases observers, animation and every listener", () => {
  const { panel, document, desktop, reduced, observers, mutations, observer, setup } = fixture();
  const cleanup = setup();
  observer().emit(true);
  cleanup();
  assert.equal(panel.animations[0].cancelled, true);
  assert.ok(observers.every((item) => item.disconnected && item.observed.size === 0));
  assert.ok(mutations.every((item) => item.disconnected));
  for (const target of [panel, document, desktop, reduced]) assert.equal(target.listenerCount(), 0);
  assert.equal(panel.dataset.ambient, undefined);
  assert.equal(panel.dataset.ritualReveal, "done");
});
