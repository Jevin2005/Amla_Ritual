import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = buildSync({
  stdin: {
    contents: 'export { installLenisScroll } from "./src/shared/ui/lenis-scroll"; export { scrollPageTo } from "./src/shared/ui/page-scroll";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, platform: "node", format: "cjs", write: false, external: ["lenis"],
}).outputFiles[0].text;

class Events {
  listeners = new Map();
  addEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    const listeners = this.listeners.get(type) ?? [];
    listeners.push({ callback, capture, once: options.once });
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((item) => item.callback !== callback || item.capture !== capture));
  }
  emit(type, event = {}) {
    for (const item of [...this.listeners.get(type) ?? []].sort((a, b) => Number(b.capture) - Number(a.capture))) {
      item.callback(event);
      if (item.once) this.removeEventListener(type, item.callback, item.capture);
    }
  }
  get listenerCount() { return [...this.listeners.values()].reduce((total, entries) => total + entries.length, 0); }
}

class Element extends Events {
  constructor(tagName = "div", attributes = {}) {
    super();
    this.tagName = tagName;
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = {};
    this.overflowY = "visible";
    this.scrollHeight = 200;
    this.clientHeight = 200;
    this.scrollPaddingTop = "0px";
    this.scrollMarginTop = "0px";
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  matches() {
    return ["dialog", "input", "textarea", "select"].includes(this.tagName)
      || this.getAttribute("role") === "dialog" || this.hasAttribute("data-native-scroll")
      || (this.hasAttribute("contenteditable") && this.getAttribute("contenteditable") !== "false");
  }
  closest() { return this.tagName === "a" && this.hasAttribute("href") ? this : this.parentElement?.closest() ?? null; }
  getBoundingClientRect() { return { top: this.top ?? 600, height: 200 }; }
  focus(options) { this.focusOptions = { ...options }; }
}

function fixture({ y = 0, reduced = false, phone = false } = {}) {
  const frames = new Map();
  const instances = [];
  const mutations = [];
  const native = [];
  const destinations = new Map();
  let nextFrame = 0;
  let time = 0;
  const media = Object.assign(new Events(), { matches: reduced });
  const body = new Element("body");
  const root = new Element("html");
  root.scrollHeight = 10000;
  const document = Object.assign(new Events(), { body, documentElement: root, hidden: false, getElementById: (id) => destinations.get(id) ?? null });
  const view = Object.assign(new Events(), {
    document, scrollY: y, scrollX: 0, innerHeight: 800,
    location: new URL("https://naturemist.test/products?view=all"),
    matchMedia: (query) => query.includes("reduce") ? media : { matches: !phone },
    getComputedStyle: (element) => element,
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    scrollTo(options) { native.push({ ...options }); this.scrollY = options.top; },
  });
  view.history = { state: { route: "current" }, updates: [], pushState(state, title, url) {
    this.updates.push({ state, title, url }); view.location = new URL(url, view.location);
  } };

  // Mock only the library boundary. The real owner, listeners, clock and
  // page-scroll registration run here; Lenis's easing is tested upstream.
  class FakeLenis extends Events {
    isScrolling = false;
    isStopped = false;
    destroyed = false;
    times = [];
    calls = [];
    resizes = 0;
    constructor(options) { super(); this.options = options; this.targetScroll = view.scrollY; instances.push(this); }
    on(type, callback) { this.addEventListener(type, callback); return () => this.removeEventListener(type, callback); }
    stop() { this.isStopped = true; this.isScrolling = false; this.targetScroll = view.scrollY; }
    start() { this.isStopped = false; }
    resize() { this.resizes++; this.targetScroll = view.scrollY; }
    destroy() { this.destroyed = true; this.listeners.clear(); }
    scrollTo(top, options = {}) {
      this.calls.push({ top, ...options });
      if (this.isStopped) return;
      // Lenis skips an unchanged target. resize() alone leaves any existing
      // animation alive, so the app must explicitly cancel before replacing it.
      if (top === this.targetScroll) return;
      this.targetScroll = top;
      this.animationTarget = top;
      if (options.immediate) { view.scrollY = top; this.isScrolling = false; }
      else this.isScrolling = "smooth";
    }
    raf(timestamp) {
      this.times.push(timestamp);
      if (this.isScrolling !== "smooth") return;
      const remaining = this.animationTarget - view.scrollY;
      if (Math.abs(remaining) < 1) { view.scrollY = this.animationTarget; this.isScrolling = false; }
      else view.scrollY += remaining * 0.4;
    }
    input(event) {
      const data = { event, deltaX: event.deltaX, deltaY: event.deltaY };
      if (this.options.virtualScroll(data) === false) return;
      this.emit("virtual-scroll", data);
      const prevented = event.composedPath().some((node) => node !== root && node !== body && (this.options.prevent(node)
        || node.hasAttribute("data-lenis-prevent")
        || (this.options.allowNestedScroll && /^(auto|scroll)$/.test(node.overflowY) && node.scrollHeight > node.clientHeight)));
      if (prevented || !event.deltaY) return;
      if (this.isStopped) { event.preventDefault(); return; }
      if (event.type.includes("touch") && !this.options.syncTouch) { this.isScrolling = "native"; return; }
      if (!event.type.includes("wheel")) return;
      event.preventDefault();
      this.scrollTo(this.targetScroll + event.deltaY);
    }
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const context = vm.createContext({ module: { exports: {} }, window: view, document, MutationObserver, URL,
    require: (name) => { assert.equal(name, "lenis"); return FakeLenis; } });
  vm.runInContext(bundle, context);
  const { installLenisScroll, scrollPageTo } = context.module.exports;
  const dispose = installLenisScroll(view);
  const step = (elapsed = 1000 / 60) => {
    time += elapsed;
    const pending = [...frames.values()]; frames.clear();
    for (const callback of pending) callback(time);
  };
  const settle = () => {
    for (let i = 0; frames.size && i < 100; i++) step();
    assert.equal(frames.size, 0, "app must stop scheduling frames when motion settles");
  };
  const input = (options = {}) => {
    const event = { type: "wheel", deltaX: 0, deltaY: 120, cancelable: true, defaultPrevented: false,
      composedPath: () => [body, root], preventDefault() { this.defaultPrevented = true; }, ...options };
    instances.at(-1)?.input(event);
    return event;
  };
  const click = (link, options = {}) => {
    const event = { target: link, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
    view.emit("click", event);
    return event;
  };
  return { view, document, media, frames, instances, mutations, native, destinations, input, click, step, settle, dispose, scrollPageTo,
    get lenis() { return instances.at(-1); } };
}

test("one Lenis driver owns document scrolling and sleeps after movement settles", () => {
  const f = fixture();
  assert.equal(f.lenis.options.autoRaf, false);
  assert.equal(f.frames.size, 0);
  assert.equal(f.input().defaultPrevented, true);
  f.step();
  assert.ok(f.view.scrollY > 0 && f.view.scrollY < 120);
  f.settle();
  assert.equal(f.view.scrollY, 120);
  const previousTime = f.lenis.times.at(-1);
  f.input();
  f.step(60000);
  assert.ok(f.lenis.times.at(-1) - previousTime < 17, "an idle interval must not jump the animation clock");
  f.settle();
  f.dispose();
  assert.equal(f.lenis.destroyed, true);
  assert.equal(f.view.listenerCount + f.document.listenerCount + f.media.listenerCount, 0);
  assert.equal(f.mutations[0].disconnected, true);
});

test("phones retain native touch momentum while button navigation uses Lenis", () => {
  const f = fixture({ phone: true });
  assert.equal(f.lenis.options.syncTouch, false);
  assert.equal(f.input({ type: "touchmove" }).defaultPrevented, false);
  assert.equal(f.frames.size, 0);
  f.scrollPageTo(1200);
  assert.equal(f.lenis.resizes, 1);
  assert.equal(f.lenis.calls.at(-1).top, 1200);
  f.settle();
  assert.equal(f.view.scrollY, 1200);
  f.dispose();
});

test("zoom, horizontal gestures and claimed events cancel pending movement", () => {
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { deltaX: 200 }, { defaultPrevented: true }, { cancelable: false }, { deltaY: NaN }]) {
    const f = fixture();
    f.input();
    f.input(options);
    assert.equal(f.frames.size, 0);
    assert.equal(f.lenis.isScrolling, false);
    assert.equal(f.view.scrollY, 0);
    f.dispose();
  }
});

test("an immediate request for the current position cancels a previous wheel destination", () => {
  const f = fixture({ y: 100 });
  f.input();
  f.step();
  const currentPosition = f.view.scrollY;
  assert.equal(f.lenis.isScrolling, "smooth");
  f.scrollPageTo(currentPosition, { immediate: true });
  assert.equal(f.lenis.isScrolling, false);
  assert.equal(f.frames.size, 0);
  f.step();
  assert.equal(f.view.scrollY, currentPosition);
  f.dispose();
});

test("editable controls, dialogs and nested scroll areas keep their own scrolling", () => {
  const nested = new Element();
  nested.overflowY = "auto"; nested.scrollHeight = 1000;
  for (const element of [nested, new Element("input"), new Element("dialog"), new Element("div", { contenteditable: "" }), new Element("div", { "data-native-scroll": "" })]) {
    const f = fixture({ y: 300 });
    const event = f.input({ composedPath: () => [element, f.document.body, f.document.documentElement] });
    assert.equal(event.defaultPrevented, false);
    f.settle();
    assert.equal(f.view.scrollY, 300);
    f.dispose();
  }
});

test("opening a modal cancels movement and blocks page navigation until it closes", () => {
  const f = fixture({ y: 300 });
  f.input();
  f.document.body.overflowY = "hidden";
  f.mutations[0].callback();
  assert.equal(f.lenis.isStopped, true);
  assert.equal(f.frames.size, 0);
  f.scrollPageTo(2000);
  assert.equal(f.view.scrollY, 300);
  f.document.body.overflowY = "visible";
  f.mutations[0].callback();
  f.scrollPageTo(1000);
  f.settle();
  assert.equal(f.view.scrollY, 1000);
  f.dispose();
});

test("keyboard, touch and browser navigation cancel stale destinations", () => {
  for (const name of ["pointerdown", "touchstart", "keydown", "blur", "pagehide", "popstate", "hashchange", "pageshow", "resize"]) {
    const f = fixture({ y: 1000 });
    f.input();
    f.view.scrollY = 400;
    f.view.emit(name);
    assert.equal(f.frames.size, 0);
    assert.equal(f.lenis.targetScroll, 400, `${name} must preserve the restored position`);
    f.input();
    f.settle();
    assert.equal(f.view.scrollY, 520);
    f.dispose();
  }
});

test("hidden tabs release animation work and resume from the actual scroll position", () => {
  const f = fixture();
  f.input();
  f.document.hidden = true;
  f.document.emit("visibilitychange");
  assert.equal(f.frames.size, 0);
  assert.equal(f.lenis.isStopped, true);
  f.view.scrollY = 700;
  f.document.hidden = false;
  f.document.emit("visibilitychange");
  f.input();
  f.settle();
  assert.equal(f.view.scrollY, 820);
  f.dispose();
});

test("reduced motion destroys Lenis immediately and restores it when allowed", () => {
  const initial = fixture({ reduced: true });
  assert.equal(initial.instances.length, 0);
  initial.scrollPageTo(500);
  assert.equal(initial.native[0].behavior, "instant");
  initial.dispose();
  const f = fixture();
  f.input();
  const first = f.lenis;
  f.media.matches = true;
  f.media.emit("change");
  assert.equal(first.destroyed, true);
  assert.equal(f.frames.size, 0);
  f.scrollPageTo(600);
  assert.equal(f.native.at(-1).behavior, "instant");
  f.media.matches = false;
  f.media.emit("change");
  assert.equal(f.instances.length, 2);
  f.scrollPageTo(900);
  f.settle();
  assert.equal(f.view.scrollY, 900);
  f.dispose();
});

test("same-page links preserve deep links, focus and sticky-header spacing", () => {
  const f = fixture({ y: 100 });
  const target = new Element("section");
  f.document.documentElement.scrollPaddingTop = "80px";
  target.scrollMarginTop = "20px";
  f.destinations.set("section one", target);
  const event = f.click(new Element("a", { href: "#section%20one" }));
  assert.equal(event.defaultPrevented, true);
  assert.equal(f.view.history.updates[0].url, "#section%20one");
  assert.deepEqual(target.focusOptions, { preventScroll: true });
  assert.equal(target.getAttribute("tabindex"), "-1");
  f.settle();
  assert.equal(f.view.scrollY, 600);
  target.emit("blur");
  assert.equal(target.hasAttribute("tabindex"), false);
  f.dispose();
});

test("modified, downloaded, external and handled links retain browser behavior", () => {
  const cases = [
    [{ href: "#details" }, { ctrlKey: true }],
    [{ href: "#details" }, { button: 1 }],
    [{ href: "#details" }, { defaultPrevented: true }],
    [{ href: "#details", download: "file" }, {}],
    [{ href: "#details", target: "_blank" }, {}],
    [{ href: "https://other.test/products?view=all#details" }, {}],
    [{ href: "/other#details" }, {}],
    [{ href: "?view=one#details" }, {}],
    [{ href: "#missing" }, {}],
    [{ href: "#%E0%A4%A" }, {}],
  ];
  for (const [attributes, options] of cases) {
    const f = fixture();
    f.destinations.set("details", new Element("section"));
    f.click(new Element("a", attributes), options);
    assert.equal(f.lenis.calls.length, 0);
    assert.equal(f.view.history.updates.length, 0);
    f.dispose();
  }
});
