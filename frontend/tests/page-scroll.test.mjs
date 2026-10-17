import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/shared/ui/page-scroll.ts", import.meta.url))],
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
}).outputFiles[0].text;

function fixture({ y = 400, reduced = false, motion = "on", padding = 80, browser = true } = {}) {
  const native = [];
  const document = { documentElement: { dataset: { siteMotion: motion }, scrollPaddingTop: `${padding}px` } };
  const view = {
    document,
    scrollY: y,
    scrollX: 0,
    innerHeight: 800,
    matchMedia: () => ({ matches: reduced }),
    getComputedStyle: (element) => element,
    scrollTo: (options) => native.push({ ...options }),
  };
  const context = vm.createContext({
    module: { exports: {} },
    ...(browser ? { window: view, document, getComputedStyle: view.getComputedStyle } : {}),
  });
  vm.runInContext(bundle, context);
  return {
    ...context.module.exports,
    view, document, native,
    element: ({ top = 600, height = 200, margin = 20 } = {}) => ({
      scrollMarginTop: `${margin}px`,
      getBoundingClientRect: () => ({ top, height, bottom: top + height }),
    }),
  };
}

test("section navigation clears the sticky header while numeric story positions stay exact", () => {
  const f = fixture();
  const requested = [];
  f.registerPageScroller((top, immediate) => requested.push({ top, immediate }));
  f.scrollPageTo(f.element());
  f.scrollPageTo(1234);
  assert.deepEqual(requested, [{ top: 900, immediate: false }, { top: 1234, immediate: false }]);
  assert.equal(f.native.length, 0, "registered Lenis driver owns page movement");
});

test("center navigation fits the target below the sticky header", () => {
  const f = fixture();
  const requested = [];
  f.registerPageScroller((top) => requested.push(top));
  f.scrollPageTo(f.element(), { block: "center" });
  assert.deepEqual(requested, [650]);
});

test("reduced-motion and site animation settings override smooth navigation", () => {
  for (const options of [{ reduced: true }, { motion: "off" }]) {
    const f = fixture(options);
    const requested = [];
    f.registerPageScroller((top, immediate) => requested.push({ top, immediate }));
    f.scrollPageTo(1200, { immediate: false });
    assert.deepEqual(requested, [{ top: 1200, immediate: true }]);
  }
  const f = fixture();
  f.scrollPageTo(1000, { immediate: true });
  assert.equal(f.native[0].behavior, "instant");
});

test("native fallback works before mount and after the Lenis owner unmounts", () => {
  const f = fixture();
  f.scrollPageTo(300);
  assert.equal(f.native[0].top, 300);
  assert.equal(f.native[0].behavior, "smooth");
  const requested = [];
  const dispose = f.registerPageScroller((top) => requested.push(top));
  f.scrollPageTo(500);
  dispose();
  f.scrollPageTo(700);
  assert.deepEqual(requested, [500]);
  assert.deepEqual(f.native.map(({ top }) => top), [300, 700]);
});

test("a stale route cleanup cannot unregister the current Lenis owner", () => {
  const f = fixture();
  const requested = [];
  const driver = (top) => requested.push(top);
  const previousCleanup = f.registerPageScroller(driver);
  const currentCleanup = f.registerPageScroller(driver);
  previousCleanup();
  f.scrollPageTo(900);
  assert.deepEqual(requested, [900]);
  assert.equal(f.native.length, 0);
  currentCleanup();
  f.scrollPageTo(1000);
  assert.equal(f.native[0].top, 1000);
});

test("missing sections and invalid positions never issue a scroll", () => {
  const f = fixture();
  f.scrollPageTo(null);
  for (const target of [NaN, Infinity, -Infinity, f.element({ top: NaN })]) f.scrollPageTo(target);
  assert.equal(f.native.length, 0);
  f.scrollPageTo(-50);
  assert.equal(f.native[0].top, 0);
  assert.doesNotThrow(() => fixture({ browser: false }).scrollPageTo(400));
});
