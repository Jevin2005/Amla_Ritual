import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/shared/ui/page-loading.ts", import.meta.url))],
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
}).outputFiles[0].text;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fixture({ href = "https://naturemist.test/", fonts = "loaded", contentPresent = true } = {}) {
  let now = 0;
  let sequence = 0;
  const timers = new Map();
  const listeners = new Map();
  const phases = [];
  const content = {
    images: [],
    pending: [],
    querySelectorAll: (selector) => selector === "img" ? content.images : content.pending,
  };
  const document = {
    fonts: { status: fonts },
    contentPresent,
    getElementById: (id) => id === "site-content" && document.contentPresent ? content : null,
  };
  const view = {
    document,
    location: { href },
    innerHeight: 800,
    innerWidth: 1200,
    getComputedStyle: (element) => element.style,
    setTimeout(callback, delay = 0) {
      const id = ++sequence;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener: (type, callback) => listeners.get(type)?.delete(callback),
  };
  const context = vm.createContext({
    module: { exports: {} },
    URL,
    Date: class extends Date { static now() { return now; } },
  });
  vm.runInContext(bundle, context);
  const api = context.module.exports;
  const cleanup = api.installPageLoading(view, (phase) => phases.push(phase));
  const emit = (type, event) => {
    for (const listener of listeners.get(type) ?? []) listener(event);
  };
  return {
    ...api,
    view, document, content, phases, timers, listeners, cleanup,
    element({ top = 0, left = 0, width = 200, height = 200, parent = null, style = {}, ...attributes } = {}) {
      return {
        parentElement: parent,
        style: { display: "block", visibility: "visible", opacity: "1", ...style },
        getBoundingClientRect: () => ({ top, left, width, height, bottom: top + height, right: left + width }),
        ...attributes,
      };
    },
    start: (href) => emit(api.NAVIGATION_START, { detail: href }),
    commit(href) {
      view.location.href = new URL(href, view.location.href).href;
      emit(api.NAVIGATION_COMMIT, { detail: href });
    },
    emitCommit: (href) => emit(api.NAVIGATION_COMMIT, { detail: href }),
    restore: (persisted) => emit("pageshow", { persisted }),
    async advance(milliseconds) {
      const end = now + milliseconds;
      for (;;) {
        const next = [...timers].filter(([, timer]) => timer.at <= end)
          .sort(([firstId, first], [secondId, second]) => first.at - second.at || firstId - secondId)[0];
        if (!next) break;
        const [id, timer] = next;
        now = timer.at;
        timers.delete(id);
        timer.callback();
        await Promise.resolve();
      }
      now = end;
      await Promise.resolve();
    },
  };
}

test("startup waits for streamed fallback, fonts, and the visible image to decode", async () => {
  const f = fixture({ fonts: "loading" });
  const decode = deferred();
  const image = f.element({ complete: false, naturalWidth: 1200, src: "/hero.webp", decode: () => decode.promise });
  f.content.pending.push(f.element());
  f.content.images.push(image);
  await f.advance(200);
  assert.deepEqual(f.phases, []);
  f.content.pending.length = 0;
  await f.advance(200);
  assert.deepEqual(f.phases, [], "font loading still owns the initial gate");
  f.document.fonts.status = "loaded";
  await f.advance(200);
  assert.deepEqual(f.phases, [], "an unfinished image still blocks readiness");
  image.complete = true;
  await f.advance(160);
  assert.deepEqual(f.phases, [], "download completion is not image decode completion");
  decode.resolve();
  await f.advance(240);
  assert.deepEqual(f.phases, ["idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("cached images finish promptly while hidden preloads and below-fold media do not block", async () => {
  const f = fixture();
  const hidden = f.element({ style: { opacity: "0" } });
  f.content.pending.push(f.element({ style: { display: "none" } }));
  f.content.images.push(
    f.element({ complete: true, naturalWidth: 600, src: "/cached.webp" }),
    f.element({ complete: false, parent: hidden }),
    f.element({ complete: false, top: 1000 }),
    f.element({ complete: false, width: 1, height: 1 }),
    f.element({ complete: false, style: { visibility: "hidden" } }),
  );
  await f.advance(160);
  assert.deepEqual(f.phases, ["idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("visually important decorative images still block even when aria-hidden", async () => {
  const f = fixture();
  const image = f.element({ complete: false, naturalWidth: 0, ariaHidden: "true" });
  f.content.images.push(image);
  await f.advance(200);
  assert.deepEqual(f.phases, []);
  image.complete = true;
  await f.advance(160);
  assert.deepEqual(f.phases, ["idle"], "failed images settle so fallback handling cannot trap browsing");
  f.cleanup();
});

test("decode failure settles and source replacement requires a new decode", async () => {
  const f = fixture();
  const replacement = deferred();
  let calls = 0;
  const image = f.element({
    complete: true, naturalWidth: 600, src: "/first.webp",
    decode: () => { calls++; return calls === 1 ? Promise.reject(new Error("decode failed")) : replacement.promise; },
  });
  f.content.images.push(image);
  await f.advance(0);
  image.src = "/replacement.webp";
  await f.advance(240);
  assert.equal(calls, 2);
  assert.deepEqual(f.phases, []);
  replacement.resolve();
  await f.advance(240);
  assert.deepEqual(f.phases, ["idle"]);
  f.cleanup();
});

test("visible image decoding starts together and newly streamed fallback resets readiness", async () => {
  const f = fixture();
  const decodes = [deferred(), deferred(), deferred()];
  const started = [];
  f.content.images.push(...decodes.map((decode, index) => f.element({
    complete: true, naturalWidth: 600, src: `/image-${index}.webp`,
    decode: () => { started.push(index); return decode.promise; },
  })));
  await f.advance(0);
  assert.deepEqual(started, [0, 1, 2], "one slow image must not serialize every other decode");
  for (const decode of decodes) decode.resolve();
  await f.advance(80);
  f.content.pending.push(f.element());
  await f.advance(160);
  assert.deepEqual(f.phases, [], "streamed fallback arriving between settled checks keeps loading active");
  f.content.pending.length = 0;
  await f.advance(160);
  assert.deepEqual(f.phases, ["idle"]);
  f.cleanup();
});

test("missing content and a stuck font or image request have bounded startup waits", async () => {
  const missing = fixture({ contentPresent: false });
  await missing.advance(2499);
  assert.deepEqual(missing.phases, []);
  await missing.advance(1);
  assert.deepEqual(missing.phases, ["idle"]);
  assert.equal(missing.timers.size, 0);
  missing.cleanup();

  const fonts = fixture({ fonts: "loading" });
  await fonts.advance(999);
  assert.deepEqual(fonts.phases, []);
  await fonts.advance(201);
  assert.deepEqual(fonts.phases, ["idle"], "font grace period cannot hold the site forever");
  fonts.cleanup();

  const image = fixture();
  image.content.images.push(image.element({ complete: false }));
  await image.advance(1199);
  assert.deepEqual(image.phases, [], "briefly allow the hero image to settle");
  await image.advance(161);
  assert.deepEqual(image.phases, ["idle"]);
  assert.equal(image.timers.size, 0);
  image.cleanup();
});

test("navigation feedback waits briefly, then remains until route and media commit", async () => {
  const f = fixture();
  await f.advance(160);
  f.phases.length = 0;
  f.start("/shop");
  await f.advance(139);
  assert.deepEqual(f.phases, []);
  await f.advance(1);
  assert.deepEqual(f.phases, ["navigation"]);
  const image = f.element({ complete: false });
  f.content.images.push(image);
  f.commit("/shop");
  await f.advance(200);
  assert.deepEqual(f.phases, ["navigation"]);
  image.complete = true;
  await f.advance(160);
  assert.deepEqual(f.phases, ["navigation", "idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("fast cached navigation completes without flashing the route indicator", async () => {
  const f = fixture();
  await f.advance(160);
  f.phases.length = 0;
  f.start("/contact");
  f.commit("/contact");
  await f.advance(300);
  assert.deepEqual(f.phases, ["idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("same route, anchors and external URLs do not start navigation feedback", async () => {
  const f = fixture({ href: "https://naturemist.test/shop?goal=growth" });
  await f.advance(160);
  f.phases.length = 0;
  for (const href of ["#collection", "/shop?goal=growth", "https://outside.test/shop", "mailto:hello@example.test", "javascript:void(0)"]) f.start(href);
  await f.advance(13000);
  assert.deepEqual(f.phases, []);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("back and forward navigation track the last committed URL even after history changed", async () => {
  const f = fixture({ href: "https://naturemist.test/shop" });
  await f.advance(160);
  f.phases.length = 0;
  for (const path of ["/", "/shop"]) {
    f.view.location.href = new URL(path, f.view.location.href).href;
    f.start(path);
    await f.advance(200);
    assert.equal(f.phases.at(-1), "navigation");
    f.emitCommit(path);
    await f.advance(160);
    assert.equal(f.phases.at(-1), "idle");
  }
  assert.deepEqual(f.phases, ["navigation", "idle", "navigation", "idle"]);
  f.cleanup();
});

test("query commits compare equivalent URL encoding and still track query-only changes", async () => {
  const f = fixture({ href: "https://naturemist.test/shop" });
  await f.advance(160);
  f.phases.length = 0;
  f.start("/shop?goal=hair%20growth");
  await f.advance(200);
  f.view.location.href = "https://naturemist.test/shop?goal=hair%20growth";
  f.emitCommit("/shop?goal=hair+growth");
  await f.advance(160);
  assert.deepEqual(f.phases, ["navigation", "idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("a superseded route commit cannot finish the newest pending navigation", async () => {
  const f = fixture();
  await f.advance(160);
  f.phases.length = 0;
  f.start("/shop");
  await f.advance(150);
  f.start("/reviews");
  f.commit("/shop");
  await f.advance(300);
  assert.ok(!f.phases.includes("idle"), "the superseded shop commit must not release the reviews loader");
  f.commit("/reviews");
  await f.advance(160);
  assert.equal(f.phases.at(-1), "idle");
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("a redirect can finish on a different destination and obsolete URL effects are ignored", async () => {
  const f = fixture();
  await f.advance(160);
  f.phases.length = 0;
  f.start("/combos");
  await f.advance(200);
  f.view.location.href = "https://naturemist.test/shop?type=combos";
  f.emitCommit("/combos");
  await f.advance(160);
  assert.deepEqual(f.phases, ["navigation"]);
  f.emitCommit("/shop?type=combos");
  await f.advance(160);
  assert.deepEqual(f.phases, ["navigation", "idle"]);
  f.cleanup();
});

test("failed navigation expires, and a BFCache restore cancels a pending cycle", async () => {
  const f = fixture();
  await f.advance(160);
  f.phases.length = 0;
  f.start("/unresponsive");
  await f.advance(11999);
  assert.deepEqual(f.phases, ["navigation"]);
  await f.advance(1);
  assert.deepEqual(f.phases, ["navigation", "idle"]);
  assert.equal(f.timers.size, 0);
  f.phases.length = 0;
  f.start("/reviews");
  await f.advance(200);
  f.restore(false);
  assert.deepEqual(f.phases, ["navigation"]);
  f.restore(true);
  assert.deepEqual(f.phases, ["navigation", "idle"]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("cleanup removes timers and subscriptions and ignores later decode completion", async () => {
  const f = fixture();
  const decode = deferred();
  f.content.images.push(f.element({ complete: true, naturalWidth: 600, src: "/hero.webp", decode: () => decode.promise }));
  await f.advance(0);
  f.cleanup();
  assert.equal(f.timers.size, 0);
  assert.equal([...f.listeners.values()].reduce((sum, handlers) => sum + handlers.size, 0), 0);
  decode.resolve();
  f.start("/shop");
  f.commit("/shop");
  f.restore(true);
  await f.advance(13000);
  assert.deepEqual(f.phases, []);
});
