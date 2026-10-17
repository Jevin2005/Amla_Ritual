import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  entryPoints: [`${root}src/widgets/home/product-benefits-motion.ts`],
  bundle: true,
  platform: "browser",
  format: "iife",
  globalName: "benefitsMotion",
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

function observerFixture() {
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
  return { observers, IntersectionObserver };
}

function entranceFixture(tops, {
  reducedMotion = false, enabled = true, duration = 1, hidden = false, supportsObserver = true,
  kinds = tops.map(() => "card"),
} = {}) {
  class Node extends EventTarget {
    children = [];
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
  }
  class Target extends Node {
    animations = [];
    revealStates = [];
    style = {};
    constructor(top, kind) {
      super();
      this.top = top;
      this.dataset = new Proxy({ benefitReveal: kind }, {
        set: (data, key, value) => {
          if (key === "benefitRevealState") this.revealStates.push(value);
          data[key] = value;
          return true;
        },
      });
    }
    getBoundingClientRect() { return { top: this.top, bottom: this.top + 180 }; }
    animate(keyframes, options) {
      const animation = {
        keyframes, options, cancelled: false, finished: false,
        cancel() { this.cancelled = true; this.oncancel?.(); },
        finish() { this.finished = true; this.onfinish?.(); },
      };
      this.animations.push(animation);
      return animation;
    }
  }

  const { observers, IntersectionObserver } = observerFixture();
  const media = Object.assign(new EventTarget(), { matches: reducedMotion });
  const document = Object.assign(new EventTarget(), { hidden, activeElement: null });
  const targets = tops.map((top, index) => new Target(top, kinds[index]));
  const section = Object.assign(new Node(), {
    children: targets,
    querySelectorAll: () => targets,
  });
  const window = { innerHeight: 800, matchMedia: () => media };
  if (supportsObserver) window.IntersectionObserver = IntersectionObserver;
  const context = vm.createContext({ window, document, Node, IntersectionObserver });
  vm.runInContext(bundle, context);
  const setup = () => context.benefitsMotion.observeBenefitsEntrance(section, {
    enabled, cursor: true, intensity: 1, duration,
  });
  const enter = (...items) => {
    items.forEach((target) => { target.top = 300; });
    observers.at(-1).emit(items.map((target) => ({ target, isIntersecting: true })));
  };
  return { targets, section, document, media, observers, setup, enter, Node };
}

test("hydration preserves already painted content and leaves below-fold HTML readable", () => {
  const { targets, observers, setup } = entranceFixture([-200, 0, 300, 799, 900]);
  const cleanup = setup();
  for (const target of targets.slice(0, 4)) {
    assert.equal(target.dataset.benefitRevealState, "done");
    assert.ok(!target.revealStates.includes("pending"));
    assert.equal(target.animations.length, 0);
    assert.ok(!observers[0].observed.has(target));
  }
  assert.equal(targets[4].dataset.benefitRevealState, "pending");
  for (const target of targets) {
    assert.deepEqual(target.style, {}, "pending content must not be hidden with inline styles");
    assert.equal(target.dataset.benefitReveal, "card", "the original kind survives setup");
  }
  cleanup();
});

test("header and cards use their specified distances, durations and card-only stagger", () => {
  const { targets: [heading, first, second, third], setup, enter } = entranceFixture(
    [900, 1200, 1500, 1800], { kinds: ["header", "card", "card", "card"] },
  );
  const cleanup = setup();
  enter(second, heading, first);
  assert.equal(heading.animations[0].keyframes[0].transform, "translate3d(0, 12px, 0)");
  assert.equal(heading.animations[0].options.duration, 450);
  assert.equal(heading.animations[0].options.delay, 0);
  assert.equal(first.animations[0].keyframes[0].transform, "translate3d(0, 16px, 0)");
  assert.equal(first.animations[0].options.duration, 550);
  assert.equal(first.animations[0].options.delay, 0);
  assert.equal(second.animations[0].options.delay, 60);
  assert.equal(first.animations[0].options.fill, "backwards");
  assert.equal(third.animations.length, 0);
  enter(third);
  assert.equal(third.animations[0].options.delay, 0, "a separate batch never waits for earlier cards");
  cleanup();
});

test("each target reveals once across duplicate observations and repeated setup", () => {
  const { targets: [completed, pending], observers, setup, enter } = entranceFixture([900, 1200], { duration: 1.25 });
  const cleanupFirst = setup();
  enter(completed);
  assert.equal(completed.animations[0].options.duration, 687.5);
  enter(completed);
  assert.equal(completed.animations.length, 1);
  completed.animations[0].finish();
  cleanupFirst();
  assert.equal(pending.dataset.benefitReveal, "card");
  assert.equal(pending.dataset.benefitRevealState, undefined);
  const cleanupSecond = setup();
  assert.equal(completed.dataset.benefitRevealState, "done");
  assert.ok(!observers[1].observed.has(completed));
  assert.ok(observers[1].observed.has(pending));
  enter(pending);
  assert.equal(pending.animations[0].options.duration, 687.5);
  assert.equal(completed.animations.length, 1);
  cleanupSecond();
});

test("stale callbacks after a fast scroll reveal cards immediately without hiding them again", () => {
  const { targets: [passed, entering, later], observers, setup } = entranceFixture([900, 1200, 1500]);
  const cleanup = setup();
  passed.top = -200;
  entering.top = 700;
  observers[0].emit([
    { target: passed, isIntersecting: true },
    { target: entering, isIntersecting: true },
    { target: later, isIntersecting: false },
  ]);
  assert.equal(passed.dataset.benefitRevealState, "done");
  assert.equal(passed.animations.length, 0);
  assert.equal(entering.animations[0].options.delay, 0);
  assert.equal(later.dataset.benefitRevealState, "pending");
  assert.deepEqual(later.style, {});
  cleanup();
});

test("reduced motion or a hidden page cancels entrances and exposes every pending card", () => {
  for (const change of ["preference", "visibility"]) {
    const { targets: [entering, pending], observers, media, document, setup, enter } = entranceFixture([900, 1200]);
    const cleanup = setup();
    enter(entering);
    if (change === "preference") {
      media.matches = true;
      media.dispatch("change");
    } else {
      document.hidden = true;
      document.dispatch("visibilitychange");
    }
    assert.equal(entering.animations[0].cancelled, true);
    assert.equal(entering.dataset.benefitRevealState, "done");
    assert.equal(pending.dataset.benefitRevealState, "done");
    assert.equal(pending.animations.length, 0);
    assert.equal(observers[0].observed.size, 0);
    cleanup();
  }
});

test("disabled motion, reduced motion, hidden documents and absent observers remain static", () => {
  for (const preferences of [{ enabled: false }, { reducedMotion: true }, { hidden: true }, { supportsObserver: false }]) {
    const { targets, observers, setup } = entranceFixture([900, 1200], preferences);
    const cleanup = setup();
    for (const target of targets) {
      assert.equal(target.dataset.benefitRevealState, "done");
      assert.ok(!target.revealStates.includes("pending"));
      assert.equal(target.animations.length, 0);
    }
    assert.equal(observers.length, 0);
    cleanup();
  }
});

test("missing Web Animations support still exposes observed content", () => {
  const { targets: [target], setup, enter } = entranceFixture([900]);
  target.animate = undefined;
  const cleanup = setup();
  enter(target);
  assert.equal(target.dataset.benefitRevealState, "done");
  assert.deepEqual(target.style, {});
  cleanup();
});

test("keyboard focus immediately reveals its target and cancels active entrance", () => {
  const { targets: [pending, entering], section, observers, setup, enter, Node } = entranceFixture([900, 1200]);
  const link = new Node();
  pending.children.push(link);
  const cleanup = setup();
  section.dispatch("focusin", { target: link });
  assert.equal(pending.dataset.benefitRevealState, "done");
  assert.equal(pending.animations.length, 0);
  assert.ok(!observers[0].observed.has(pending));
  enter(entering);
  section.dispatch("focusin", { target: entering });
  assert.equal(entering.animations[0].cancelled, true);
  cleanup();
});

test("entrance cleanup releases all resources and ignores callbacks already queued", () => {
  const { targets: [entering, pending], section, observers, media, document, setup, enter } = entranceFixture([900, 1200]);
  const cleanup = setup();
  enter(entering);
  assert.ok(section.listenerCount() + media.listenerCount() + document.listenerCount() > 0);
  cleanup();
  assert.equal(observers[0].disconnected, true);
  assert.equal(observers[0].observed.size, 0);
  assert.equal(entering.animations[0].cancelled, true);
  assert.equal(pending.dataset.benefitRevealState, undefined);
  assert.equal(pending.dataset.benefitReveal, "card");
  assert.equal(section.listenerCount() + media.listenerCount() + document.listenerCount(), 0);
  enter(pending);
  assert.equal(pending.animations.length, 0);
  assert.equal(pending.dataset.benefitRevealState, undefined);
});

function pointerFixture({
  intensity = 1, enabled = true, cursor = true, reducedMotion = false, finePointer = true,
  width = 1200, hidden = false, sectionTop = 100, supportsObserver = true,
} = {}) {
  const writes = [];
  const frames = new Map();
  const values = new Map();
  let nextFrame = 0;
  let cardMeasurements = 0;
  const reduced = Object.assign(new EventTarget(), { matches: reducedMotion });
  const fine = Object.assign(new EventTarget(), { matches: finePointer });
  const depth = {
    style: {
      setProperty(property, value) { writes.push({ property, value }); values.set(property, value); },
      removeProperty(property) { values.delete(property); },
    },
  };
  const card = Object.assign(new EventTarget(), {
    querySelector: (selector) => selector === "[data-benefit-depth]" ? depth : null,
    getBoundingClientRect: () => {
      cardMeasurements++;
      return { top: 200, left: 40, width: 320, height: 400 };
    },
  });
  const section = {
    querySelectorAll: (selector) => selector === "[data-benefit-card]" ? [card] : [],
    getBoundingClientRect: () => ({ top: sectionTop, bottom: sectionTop + 1000 }),
  };
  const { observers, IntersectionObserver } = observerFixture();
  const document = Object.assign(new EventTarget(), { hidden });
  const window = Object.assign(new EventTarget(), {
    innerWidth: width, innerHeight: 800,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reduced : fine,
  });
  if (supportsObserver) window.IntersectionObserver = IntersectionObserver;
  const context = vm.createContext({
    window, document, IntersectionObserver,
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(bundle, context);
  const cleanup = context.benefitsMotion.installBenefitsPointer(section, {
    enabled, cursor, intensity, duration: 1,
  });
  const tick = () => {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((callback) => callback());
  };
  const pointer = (x = 200, y = 400, extra = {}) => ({ clientX: x, clientY: y, buttons: 0, pointerType: "mouse", ...extra });
  return { card, depth, writes, values, frames, observers, reduced, fine, document, window, tick, pointer, cleanup,
    cardMeasurements: () => cardMeasurements };
}

test("pointer events coalesce into one frame, update only image variables and stop when idle", () => {
  const { card, writes, frames, values, tick, pointer, cardMeasurements, cleanup } = pointerFixture();
  card.dispatch("pointerenter", pointer());
  card.dispatch("pointermove", pointer(280, 500));
  card.dispatch("pointermove", pointer(360, 600));
  assert.equal(frames.size, 1);
  assert.equal(writes.length, 0);
  assert.equal(cardMeasurements(), 1);
  tick();
  assert.equal(frames.size, 0, "a stationary pointer must not run an animation loop");
  assert.equal(values.get("--specimen-x"), "3.00px");
  assert.equal(values.get("--specimen-y"), "3.00px");
  assert.equal(values.get("--specimen-tilt"), "1.50deg");
  assert.deepEqual(writes.map(({ property }) => property), ["--specimen-x", "--specimen-y", "--specimen-tilt"]);
  card.dispatch("pointermove", pointer(40, 200));
  tick();
  assert.equal(values.get("--specimen-x"), "-3.00px");
  assert.equal(cardMeasurements(), 1, "pointer moves never force layout measurement");
  cleanup();
});

test("depth clamps extreme input and administrator intensity to the specified limits", () => {
  for (const [intensity, movement, tilt] of [[1.5, 3, 1.5], [50, 3, 1.5], [.5, 1.5, .75]]) {
    const { card, values, tick, pointer, cleanup } = pointerFixture({ intensity });
    card.dispatch("pointerenter", pointer(10000, -10000));
    tick();
    assert.equal(Number.parseFloat(values.get("--specimen-x")), movement);
    assert.equal(Number.parseFloat(values.get("--specimen-y")), -movement);
    assert.equal(Number.parseFloat(values.get("--specimen-tilt")), tilt);
    cleanup();
  }
});

test("phone, coarse pointer, motion preferences and unavailable visibility disable depth", () => {
  for (const options of [
    { width: 767 }, { finePointer: false }, { reducedMotion: true }, { enabled: false },
    { cursor: false }, { intensity: 0 }, { intensity: -1 }, { intensity: Number.NaN },
    { hidden: true }, { sectionTop: 1000 },
  ]) {
    const { card, writes, frames, pointer, tick, cleanup } = pointerFixture(options);
    card.dispatch("pointerenter", pointer(360, 600));
    card.dispatch("pointermove", pointer(40, 200));
    tick();
    assert.equal(frames.size, 0, JSON.stringify(options));
    assert.equal(writes.length, 0, JSON.stringify(options));
    cleanup();
  }
  const { card, frames, pointer, cleanup } = pointerFixture({ width: 768 });
  card.dispatch("pointerenter", pointer());
  assert.equal(frames.size, 1, "fine-pointer tablets can use depth from 768px");
  cleanup();
});

test("touch and pressed pointers cannot start depth on a hybrid device", () => {
  const { card, writes, frames, pointer, tick, cleanup } = pointerFixture();
  for (const extra of [{ pointerType: "touch" }, { buttons: 1 }]) {
    card.dispatch("pointerenter", pointer(360, 600, extra));
    card.dispatch("pointermove", pointer(40, 200, extra));
    tick();
    assert.equal(frames.size, 0);
    assert.equal(writes.length, 0);
  }
  cleanup();
});

test("leave, cancellation, interaction and global changes restore rest and cancel queued frames", () => {
  for (const event of ["pointerleave", "pointercancel", "pointerdown", "focusin", "scroll", "resize", "blur", "visibilitychange", "reduced", "fine", "outside"]) {
    const { card, writes, values, frames, observers, tick, pointer, window, document, reduced, fine, cleanup } = pointerFixture();
    card.dispatch("pointerenter", pointer(360, 600));
    tick();
    assert.equal(values.size, 3);
    card.dispatch("pointermove", pointer(40, 200));
    assert.equal(frames.size, 1);
    if (["scroll", "resize", "blur"].includes(event)) window.dispatch(event);
    else if (event === "visibilitychange") { document.hidden = true; document.dispatch(event); }
    else if (event === "reduced") { reduced.matches = true; reduced.dispatch("change"); }
    else if (event === "fine") { fine.matches = false; fine.dispatch("change"); }
    else if (event === "outside") observers[0].emit([{ isIntersecting: false }]);
    else card.dispatch(event);
    assert.equal(frames.size, 0, event);
    assert.equal(values.size, 0, event);
    const writeCount = writes.length;
    tick();
    card.dispatch("pointermove", pointer(360, 600));
    tick();
    assert.equal(writes.length, writeCount, "movement resumes only after a fresh pointer entry");
    cleanup();
  }
});

test("preference changes between a pointer event and its frame prevent late motion", () => {
  const { card, writes, frames, fine, pointer, tick, cleanup } = pointerFixture();
  card.dispatch("pointerenter", pointer(360, 600));
  fine.matches = false;
  tick();
  assert.equal(frames.size, 0);
  assert.equal(writes.length, 0);
  cleanup();
});

test("pointer cleanup removes its styles, observers, frames and every listener", () => {
  const { card, values, frames, observers, window, document, reduced, fine, pointer, tick, cleanup } = pointerFixture();
  card.dispatch("pointerenter", pointer(360, 600));
  tick();
  card.dispatch("pointermove", pointer(40, 200));
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(values.size, 0);
  assert.equal(observers[0].disconnected, true);
  for (const target of [card, window, document, reduced, fine]) assert.equal(target.listenerCount(), 0);
  observers[0].emit([{ isIntersecting: true }]);
  card.dispatch("pointerenter", pointer(360, 600));
  assert.equal(frames.size, 0);
});
