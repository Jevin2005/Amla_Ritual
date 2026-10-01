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

function fixture(tops, { reducedMotion = false, enabled = true, duration = 1 } = {}) {
  class Node extends EventTarget {
    children = [];
    contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
  }
  class Target extends Node {
    animations = [];
    revealStates = [];
    attributes = new Set();
    constructor(top) {
      super();
      this.top = top;
      this.dataset = new Proxy({ benefitReveal: "" }, {
        set: (data, key, value) => {
          if (key === "benefitReveal") this.revealStates.push(value);
          data[key] = value;
          return true;
        },
      });
    }
    getBoundingClientRect() { return { top: this.top }; }
    hasAttribute(attribute) { return this.attributes.has(attribute); }
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

  const media = Object.assign(new EventTarget(), { matches: reducedMotion });
  const document = Object.assign(new EventTarget(), { hidden: false, activeElement: null });
  const targets = tops.map((top) => new Target(top));
  const section = Object.assign(new Node(), {
    children: targets,
    querySelectorAll: () => targets.filter((target) => Object.hasOwn(target.dataset, "benefitReveal")),
  });
  const window = { innerHeight: 800, matchMedia: () => media, IntersectionObserver };
  const context = vm.createContext({ window, document, Node, IntersectionObserver });
  vm.runInContext(bundle, context);
  const setup = () => context.benefitsMotion.observeBenefitsEntrance(section, {
    enabled, cursor: true, intensity: 1, duration,
  });
  return { targets, section, document, media, observers, setup, Node };
}

test("fresh hydration never hides or animates content already in or above the viewport", () => {
  const { targets, observers, setup } = fixture([-180, 0, 300, 799, 900]);
  const cleanup = setup();

  for (const target of targets.slice(0, 4)) {
    assert.equal(target.dataset.benefitReveal, "done");
    assert.ok(!target.revealStates.includes("pending"), "painted content must remain visible");
    assert.equal(target.animations.length, 0);
    assert.ok(!observers[0].observed.has(target));
  }
  assert.equal(targets[4].dataset.benefitReveal, "pending");
  cleanup();
});

test("below-fold rows reveal separately only when each row intersects", () => {
  const { targets: [first, second, third], observers, setup } = fixture([900, 1200, 1500], { duration: 1.25 });
  const cleanup = setup();
  const observer = observers[0];

  observer.emit([{ target: first, isIntersecting: false }]);
  assert.equal(first.dataset.benefitReveal, "pending");
  assert.equal(first.animations.length, 0);
  observer.emit([{ target: first, isIntersecting: true }]);
  assert.equal(first.dataset.benefitReveal, "done");
  assert.equal(first.animations.length, 1);
  assert.equal(first.animations[0].options.duration, 775);
  assert.ok(!observer.observed.has(first));
  assert.equal(second.dataset.benefitReveal, "pending");
  assert.equal(third.dataset.benefitReveal, "pending");
  assert.equal(second.animations.length + third.animations.length, 0);

  observer.emit([{ target: third, isIntersecting: true }]);
  assert.equal(third.animations.length, 1);
  assert.equal(third.animations[0].options.delay, 0, "one newly visible row should not wait for offscreen rows");
  assert.equal(second.dataset.benefitReveal, "pending");
  cleanup();
});

test("enabling reduced motion exposes pending rows and cancels active entrances", () => {
  const { targets: [entering, pending], observers, media, setup } = fixture([900, 1200]);
  const cleanup = setup();
  observers[0].emit([{ target: entering, isIntersecting: true }]);
  media.matches = true;
  media.dispatch("change");

  assert.equal(entering.animations[0].cancelled, true);
  assert.equal(entering.dataset.benefitReveal, "done");
  assert.equal(pending.dataset.benefitReveal, "done");
  assert.equal(pending.animations.length, 0);
  assert.equal(observers[0].observed.size, 0);
  cleanup();
});

test("motion disabled or reduced on initial load leaves all content readable", () => {
  for (const preferences of [{ enabled: false }, { reducedMotion: true }]) {
    const { targets, observers, setup } = fixture([900, 1200], preferences);
    const cleanup = setup();
    for (const target of targets) {
      assert.equal(target.dataset.benefitReveal, "done");
      assert.ok(!target.revealStates.includes("pending"));
      assert.equal(target.animations.length, 0);
    }
    assert.equal(observers.length, 0);
    cleanup();
  }
});

test("keyboard focus immediately reveals its pending row and stops its entrance", () => {
  const { targets: [pending, entering], section, observers, setup, Node } = fixture([900, 1200]);
  const link = new Node();
  pending.children.push(link);
  const cleanup = setup();

  section.dispatch("focusin", { target: link });
  assert.equal(pending.dataset.benefitReveal, "done");
  assert.equal(pending.animations.length, 0);
  assert.ok(!observers[0].observed.has(pending));

  observers[0].emit([{ target: entering, isIntersecting: true }]);
  section.dispatch("focusin", { target: entering });
  assert.equal(entering.animations[0].cancelled, true);
  cleanup();
});

test("cleanup releases observers, listeners and animations and exposes pending content", () => {
  const { targets: [entering, pending], section, observers, media, document, setup } = fixture([900, 1200]);
  const cleanup = setup();
  observers[0].emit([{ target: entering, isIntersecting: true }]);
  assert.ok(section.listenerCount() + media.listenerCount() + document.listenerCount() > 0);
  cleanup();

  assert.equal(observers[0].disconnected, true);
  assert.equal(observers[0].observed.size, 0);
  assert.equal(entering.animations[0].cancelled, true);
  assert.notEqual(pending.dataset.benefitReveal, "pending");
  assert.ok(Object.hasOwn(pending.dataset, "benefitReveal"), "cleanup preserves the marker for React effect re-setup");
  assert.equal(section.listenerCount() + media.listenerCount() + document.listenerCount(), 0);
});

test("repeated setup preserves completed entrances while observing unrevealed rows again", () => {
  const { targets: [completed, pending], observers, setup } = fixture([900, 1200]);
  const cleanupFirst = setup();
  observers[0].emit([{ target: completed, isIntersecting: true }]);
  completed.animations[0].finish();
  cleanupFirst();
  const cleanupSecond = setup();

  assert.equal(completed.dataset.benefitReveal, "done");
  assert.equal(completed.animations.length, 1);
  assert.ok(!observers[1].observed.has(completed));
  assert.equal(pending.dataset.benefitReveal, "pending");
  assert.ok(observers[1].observed.has(pending));
  cleanupSecond();
});

function pointerFixture({ loaded = true, rowWidth = 1040, detailsLeft = 680 } = {}) {
  const writes = [];
  const frames = new Map();
  let nextFrame = 0;
  let now = 0;
  let rowMeasurements = 0;
  const reduced = Object.assign(new EventTarget(), { matches: false });
  const fine = Object.assign(new EventTarget(), { matches: true });
  const image = Object.assign(new EventTarget(), { complete: loaded, naturalWidth: loaded ? 460 : 0 });
  const preview = {
    offsetWidth: 230, offsetHeight: 280,
    getBoundingClientRect: () => ({ width: 230, height: 280 }),
    querySelector: () => image,
    style: new Proxy({ removeProperty(property) { delete this[property]; } }, {
      set(object, property, value) { writes.push({ property, value }); object[property] = value; return true; },
    }),
  };
  const details = { getBoundingClientRect: () => ({ left: detailsLeft, width: 300 }) };
  const row = Object.assign(new EventTarget(), {
    dataset: {},
    querySelector: (selector) => selector === "[data-benefit-preview]" ? preview : details,
    getBoundingClientRect: () => {
      rowMeasurements++;
      return { top: 200, left: 40, width: rowWidth, height: 182 };
    },
  });
  const section = {
    querySelectorAll: () => [row],
    querySelector: () => null,
  };
  const document = Object.assign(new EventTarget(), { hidden: false });
  const window = Object.assign(new EventTarget(), {
    innerWidth: 1200,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reduced : fine,
  });
  const context = vm.createContext({
    window, document,
    performance: { now: () => now },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(bundle, context);
  const cleanup = context.benefitsMotion.installBenefitsPointer(section, {
    enabled: true, cursor: true, intensity: 1, duration: 1,
  });
  const tick = (elapsed = 16) => {
    now += elapsed;
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((callback) => callback(now));
  };
  const mouse = (x, y = 280) => ({ clientX: x, clientY: y, buttons: 0 });
  return { row, image, preview, writes, frames, reduced, fine, document, window, tick, mouse, cleanup,
    rowMeasurements: () => rowMeasurements };
}

test("pointer moves coalesce into a single frame and update only transforms without measuring each move", () => {
  const { row, writes, frames, tick, mouse, rowMeasurements, cleanup } = pointerFixture();
  row.dispatch("mouseenter", mouse(220));
  assert.equal(row.dataset.previewVisible, "true");
  const initialTransform = writes.at(-1).value;
  const measurementsAtEnter = rowMeasurements();
  writes.length = 0;

  row.dispatch("mousemove", mouse(300));
  row.dispatch("mousemove", mouse(360));
  row.dispatch("mousemove", mouse(420));
  assert.equal(frames.size, 1);
  assert.equal(writes.length, 0, "mouse events should only update targets until the next frame");
  tick();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].property, "transform");
  assert.ok(writes[0].value.startsWith("translate3d("));
  assert.notEqual(writes[0].value, initialTransform);
  assert.equal(rowMeasurements(), measurementsAtEnter);
  assert.equal(frames.size, 1, "trailing movement continues on a single frame loop");

  let remaining = 200;
  while (frames.size && remaining-- > 0) tick();
  assert.equal(frames.size, 0, "settled pointers stop consuming animation frames");
  assert.ok(writes.every(({ property }) => property === "transform"));
  cleanup();
});

test("preview stays hidden for unloaded or broken images and never appears after the pointer leaves", () => {
  const { row, image, mouse, cleanup } = pointerFixture({ loaded: false });
  row.dispatch("mouseenter", mouse(220));
  assert.notEqual(row.dataset.previewVisible, "true");
  image.complete = true;
  image.dispatch("load");
  assert.notEqual(row.dataset.previewVisible, "true", "a failed image has zero natural width");
  image.naturalWidth = 460;
  image.dispatch("load");
  assert.equal(row.dataset.previewVisible, "true");

  row.dispatch("mouseleave");
  image.dispatch("load");
  assert.notEqual(row.dataset.previewVisible, "true");
  cleanup();
});

test("preview uses the measured description boundary at wide and narrow desktop sizes", () => {
  for (const geometry of [{ rowWidth: 1040, detailsLeft: 680 }, { rowWidth: 721, detailsLeft: 417 }]) {
    const { row, preview, mouse, cleanup } = pointerFixture(geometry);
    row.dispatch("mouseenter", mouse(1100));
    const x = Number(preview.style.transform.match(/^translate3d\(([-\d.]+)px/)[1]);
    const halfRotatedWidth = (230 * Math.cos(8 * Math.PI / 180) + 280 * Math.sin(8 * Math.PI / 180)) / 2;
    assert.ok(x + halfRotatedWidth < geometry.detailsLeft - 40, "even a tilted image stays before the description");
    cleanup();
  }
});

test("pointer leave and scroll cancel queued frames, while disposal releases every listener", () => {
  const { row, image, preview, writes, frames, tick, mouse, window, document, reduced, fine, cleanup } = pointerFixture();
  row.dispatch("mouseenter", mouse(220));
  row.dispatch("mousemove", mouse(420));
  assert.equal(frames.size, 1);
  row.dispatch("mouseleave");
  assert.equal(frames.size, 0);
  assert.notEqual(row.dataset.previewVisible, "true");
  const writesAfterLeave = writes.length;
  tick();
  assert.equal(writes.length, writesAfterLeave);

  row.dispatch("mouseenter", mouse(220));
  row.dispatch("mousemove", mouse(420));
  window.dispatch("scroll");
  assert.equal(frames.size, 0);
  assert.notEqual(row.dataset.previewVisible, "true");

  row.dispatch("mouseenter", mouse(220));
  row.dispatch("mousemove", mouse(420));
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(preview.style.transform, undefined);
  for (const target of [row, image, window, document, reduced, fine]) {
    assert.equal(target.listenerCount(), 0);
  }
});
