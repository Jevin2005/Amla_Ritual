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

function fixture(tops = [900, 950, 1000, 1050, 1100, 1150], preferences = {}) {
  class Node extends EventTarget {
    children = [];
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
  }
  class RevealTarget extends Node {
    animations = [];
    revealStates = [];
    constructor(top) {
      super();
      this.top = top;
      this.dataset = new Proxy({ ritualReveal: "" }, {
        set: (data, property, value) => {
          if (property === "ritualReveal") this.revealStates.push(value);
          data[property] = value;
          return true;
        },
      });
    }
    getBoundingClientRect() { return { top: this.top }; }
    animate(keyframes, options) {
      const animation = {
        keyframes, options, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); },
        finish() { this.onfinish?.(); },
      };
      this.animations.push(animation);
      return animation;
    }
  }

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
    unobserve(target) { this.observed.delete(target); }
    disconnect() { this.disconnected = true; this.observed.clear(); }
    emit(entries) { this.callback(entries); }
  }

  const writes = [];
  const frames = new Map();
  let nextFrame = 0;
  let panelMeasurements = 0;
  const spotlight = {
    style: new Proxy({}, {
      set(style, property, value) { writes.push({ property, value }); style[property] = value; return true; },
    }),
  };
  const targets = tops.map((top) => new RevealTarget(top));
  const panel = Object.assign(new Node(), {
    dataset: {},
    children: targets,
    querySelectorAll: () => targets.filter((target) => Object.hasOwn(target.dataset, "ritualReveal")),
    querySelector: () => spotlight,
    getBoundingClientRect: () => {
      panelMeasurements++;
      return { left: 48, top: 120, width: 1200, height: 540 };
    },
  });
  const reduced = Object.assign(new EventTarget(), { matches: preferences.reducedMotion ?? false });
  const fine = Object.assign(new EventTarget(), { matches: preferences.finePointer ?? true });
  const document = Object.assign(new EventTarget(), { hidden: preferences.hidden ?? false, activeElement: null });
  const window = Object.assign(new EventTarget(), {
    innerHeight: 800,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reduced : fine,
    ...(preferences.intersectionObserver === false ? {} : { IntersectionObserver }),
  });
  const context = vm.createContext({
    window, document, Node, IntersectionObserver,
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(bundle, context);
  const setup = () => context.ritualMotion.installRitualSectionMotion(panel, {
    enabled: true, cursor: true, duration: 1, intensity: 1, ...preferences.settings,
  });
  const tick = () => {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((callback) => callback());
  };
  const mouse = (clientX = 400, clientY = 320) => ({ clientX, clientY, buttons: 0 });
  const entranceObserver = () => observers.findLast((observer) => observer.options?.rootMargin);
  const visibilityObserver = () => observers.findLast((observer) => !observer.options);
  return { Node, targets, panel, spotlight, writes, frames, reduced, fine, document, window, observers,
    setup, tick, mouse, entranceObserver, visibilityObserver, panelMeasurements: () => panelMeasurements };
}

test("fresh hydration keeps already painted content visible without replaying its entrance", () => {
  const { targets, entranceObserver, setup } = fixture([-120, 0, 300, 799, 900]);
  const cleanup = setup();
  for (const target of targets.slice(0, 4)) {
    assert.equal(target.dataset.ritualReveal, "done");
    assert.ok(!target.revealStates.includes("pending"), "content must never disappear after hydration");
    assert.equal(target.animations.length, 0);
    assert.ok(!entranceObserver().observed.has(target));
  }
  assert.equal(targets[4].dataset.ritualReveal, "pending");
  cleanup();
});

test("offscreen content rises 28px in ordered 120ms staggers exactly once", () => {
  const { targets, entranceObserver, setup } = fixture(undefined, { settings: { duration: 1.25 } });
  const cleanup = setup();
  const observer = entranceObserver();
  observer.emit(targets.map((target) => ({ target, isIntersecting: false })));
  assert.ok(targets.every((target) => target.animations.length === 0));
  observer.emit(targets.map((target) => ({ target, isIntersecting: true })));
  targets.forEach((target, index) => {
    assert.equal(target.dataset.ritualReveal, "done");
    assert.equal(target.animations.length, 1);
    const { keyframes, options } = target.animations[0];
    assert.equal(keyframes[0].opacity, 0);
    assert.equal(keyframes[0].transform, "translate3d(0, 28px, 0)");
    assert.equal(keyframes[1].opacity, 1);
    assert.equal(keyframes[1].transform, "none");
    assert.equal(options.duration, 950);
    assert.equal(options.delay, index * 120);
    assert.equal(options.easing, "cubic-bezier(.2,.8,.2,1)");
    assert.equal(options.fill, "backwards");
    assert.ok(!observer.observed.has(target));
    target.animations[0].finish();
  });
  observer.emit(targets.map((target) => ({ target, isIntersecting: true })));
  assert.ok(targets.every((target) => target.animations.length === 1));
  cleanup();
});

test("StrictMode cleanup preserves reveal markers and does not replay completed entrances", () => {
  const { targets: [completed, pending], observers, entranceObserver, setup } = fixture([900, 1200]);
  const cleanupFirst = setup();
  entranceObserver().emit([{ target: completed, isIntersecting: true }]);
  cleanupFirst();
  assert.equal(completed.animations[0].cancelled, true);
  assert.ok(observers.every((observer) => observer.disconnected));
  assert.equal(completed.dataset.ritualReveal, "done");
  assert.notEqual(pending.dataset.ritualReveal, "pending");
  assert.ok(Object.hasOwn(pending.dataset, "ritualReveal"));

  const cleanupSecond = setup();
  assert.equal(completed.animations.length, 1);
  assert.ok(!entranceObserver().observed.has(completed));
  assert.equal(pending.dataset.ritualReveal, "pending");
  assert.ok(entranceObserver().observed.has(pending));
  cleanupSecond();
});

test("spotlight coalesces pointer events into one transform-only write centered on its 380px glow", () => {
  const { panel, writes, frames, tick, mouse, panelMeasurements, setup } = fixture();
  const cleanup = setup();
  panel.dispatch("mouseenter", mouse());
  const initialMeasurements = panelMeasurements();
  panel.dispatch("mousemove", mouse(410, 310));
  panel.dispatch("mousemove", mouse(470, 350));
  panel.dispatch("mousemove", mouse(538, 410));
  assert.equal(frames.size, 1);
  assert.equal(writes.length, 0);
  tick();
  assert.deepEqual(writes, [{ property: "transform", value: "translate3d(300px, 100px, 0)" }]);
  assert.equal(panel.dataset.spotlight, "true");
  assert.equal(panelMeasurements(), initialMeasurements, "moves reuse the measured panel bounds");
  assert.equal(frames.size, 0, "stationary pointers do not consume animation frames");
  cleanup();
});

test("pointer leave, scroll, resize and blur cancel the spotlight without a delayed flash", () => {
  const { panel, window, frames, writes, tick, mouse, setup } = fixture();
  const cleanup = setup();
  for (const [target, event] of [[panel, "mouseleave"], [window, "scroll"], [window, "resize"], [window, "blur"]]) {
    panel.dispatch("mouseenter", mouse());
    panel.dispatch("mousemove", mouse());
    tick();
    assert.equal(panel.dataset.spotlight, "true");
    panel.dispatch("mousemove", mouse(500));
    assert.equal(frames.size, 1);
    const previousWrites = writes.length;
    target.dispatch(event);
    assert.equal(frames.size, 0);
    assert.notEqual(panel.dataset.spotlight, "true");
    tick();
    assert.equal(writes.length, previousWrites);
  }
  cleanup();
});

test("reduced motion immediately cancels entrances and spotlight, exposing pending content", () => {
  const { panel, targets: [entering, pending], reduced, frames, writes, tick, mouse, entranceObserver, setup } = fixture([900, 1200]);
  const cleanup = setup();
  entranceObserver().emit([{ target: entering, isIntersecting: true }]);
  panel.dispatch("mousemove", mouse());
  reduced.matches = true;
  reduced.dispatch("change");
  assert.equal(entering.animations[0].cancelled, true);
  assert.equal(pending.dataset.ritualReveal, "done");
  assert.equal(pending.animations.length, 0);
  assert.equal(entranceObserver().observed.size, 0);
  assert.equal(panel.dataset.ambient, "false");
  assert.notEqual(panel.dataset.spotlight, "true");
  assert.equal(frames.size, 0);
  panel.dispatch("mousemove", mouse());
  tick();
  assert.equal(writes.length, 0);
  cleanup();
});

test("ambient motion pauses outside the viewport and in hidden tabs", () => {
  const { panel, document, reduced, visibilityObserver, setup } = fixture();
  const cleanup = setup();
  const observer = visibilityObserver();
  assert.equal(panel.dataset.ambient, "false");
  observer.emit([{ target: panel, isIntersecting: true }]);
  assert.equal(panel.dataset.ambient, "true");
  document.hidden = true;
  document.dispatch("visibilitychange");
  assert.equal(panel.dataset.ambient, "false");
  document.hidden = false;
  document.dispatch("visibilitychange");
  assert.equal(panel.dataset.ambient, "true");
  observer.emit([{ target: panel, isIntersecting: false }]);
  assert.equal(panel.dataset.ambient, "false");
  reduced.matches = true;
  reduced.dispatch("change");
  observer.emit([{ target: panel, isIntersecting: true }]);
  assert.equal(panel.dataset.ambient, "false");
  cleanup();
});

test("keyboard focus reveals a pending quiz immediately and cancels a running entrance", () => {
  const { Node, panel, targets: [quiz, entering], entranceObserver, setup } = fixture([900, 1200]);
  const option = new Node();
  quiz.children.push(option);
  const cleanup = setup();
  panel.dispatch("focusin", { target: option });
  assert.equal(quiz.dataset.ritualReveal, "done");
  assert.equal(quiz.animations.length, 0);
  assert.ok(!entranceObserver().observed.has(quiz));
  entranceObserver().emit([{ target: entering, isIntersecting: true }]);
  panel.dispatch("focusin", { target: entering });
  assert.equal(entering.animations[0].cancelled, true);
  cleanup();
});

test("initial motion restrictions and missing observer support never hide section content", () => {
  for (const preferences of [{ reducedMotion: true }, { hidden: true }, { settings: { enabled: false } }, { intersectionObserver: false }]) {
    const { panel, targets, writes, frames, mouse, setup } = fixture([900, 1200], preferences);
    const cleanup = setup();
    for (const target of targets) {
      assert.equal(target.dataset.ritualReveal, "done");
      assert.ok(!target.revealStates.includes("pending"));
      assert.equal(target.animations.length, 0);
    }
    if (preferences.intersectionObserver !== false) {
      panel.dispatch("mousemove", mouse());
      assert.equal(frames.size, 0);
      assert.equal(writes.length, 0);
    }
    cleanup();
  }
});

test("fine-pointer and cursor settings restrict spotlight; disposal releases every resource", () => {
  for (const preferences of [{ finePointer: false }, { settings: { cursor: false } }, { settings: { intensity: 0 } }]) {
    const { panel, frames, mouse, setup } = fixture([], preferences);
    const cleanup = setup();
    panel.dispatch("mousemove", mouse());
    assert.equal(frames.size, 0);
    assert.notEqual(panel.dataset.spotlight, "true");
    cleanup();
  }
  const { panel, targets, observers, entranceObserver, window, document, reduced, fine, frames, mouse, setup } = fixture();
  const cleanup = setup();
  entranceObserver().emit([{ target: targets[0], isIntersecting: true }]);
  panel.dispatch("mousemove", mouse());
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(targets[0].animations[0].cancelled, true);
  assert.ok(observers.every((observer) => observer.disconnected && observer.observed.size === 0));
  assert.ok(targets.every((target) => target.dataset.ritualReveal !== "pending"));
  for (const target of [panel, window, document, reduced, fine]) assert.equal(target.listenerCount(), 0);
  assert.equal(panel.dataset.ambient, undefined);
  assert.equal(panel.dataset.spotlight, undefined);
});
