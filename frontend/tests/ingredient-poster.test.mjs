import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  stdin: { contents: 'export * from "./src/domain/ingredient-poster.ts"; export * from "./src/domain/shery-config.ts"; export * from "./src/features/poster/shery-frame-clock.ts"; export * from "./src/features/poster/shery-frame-document.ts";', resolveDir: root },
  bundle: true, platform: "node", format: "esm", write: false,
});
const { posterImages, parseIngredientPosterSettings, parseSheryConfig, sheryFrameDocument, createFrameClock } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

test("poster image order and fallback remain controlled by admin", () => {
  const a = { url: "a" }, b = { url: "b" };
  assert.deepEqual(posterImages([b, a, b], a), [b, a]);
  assert.deepEqual(posterImages([], a), [a]);
  assert.equal(parseIngredientPosterSettings({ ritualPosterAutoplay: { value: "false" } }).autoplay, false);
});

test("native Shery clipboard presets retain controls but cannot replace runtime fields", () => {
  const preset = parseSheryConfig('{"noise_speed":{"value":0.45},"metaball":{"value":0.6},"infiniteGooey":{"value":false},"uTexture":{"value":["bad"]},"zindex":{"value":999},"noise_scale":{"value":9000},"shapeScale":{"value":{"x":0.4,"y":0.5}}}');
  assert.deepEqual(preset.noise_speed, { value: .45, range: [0, 10] });
  assert.equal(preset.metaball.value, .6);
  assert.equal(preset.noise_scale.value, 100);
  assert.deepEqual(preset.shapeScale.value, { x: .4, y: .5 });
  assert.equal(preset.uTexture, undefined);
  assert.equal(preset.zindex, undefined);
  assert.deepEqual(parseSheryConfig("bad JSON"), {});
  assert.deepEqual(parseSheryConfig({ noise_speed: { value: Infinity } }), {});
});

test("iframe data cannot break out of its JSON script", () => {
  const html = sheryFrameDocument([{ url: "https://example.test/photo.png", altText: '</script><script>alert("bad")</script>' }], {}, true);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('\\u003c/script>'));
  assert.ok(html.includes('/vendor/shery/runtime.js'));
});

test("Shery animation callbacks pause, resume once, and stop completely on disposal", () => {
  const frames = new Map(); let next = 0, calls = 0;
  const clock = createFrameClock((callback) => { frames.set(++next, callback); return next; }, (id) => frames.delete(id));
  const tick = () => { calls++; clock.request(tick); };
  clock.request(tick); clock.request(() => calls++);
  assert.equal(frames.size, 1);
  clock.setActive(false);
  assert.equal(frames.size, 0);
  clock.setActive(true);
  const [id, callback] = [...frames][0]; frames.delete(id); callback(16);
  assert.equal(calls, 2);
  assert.equal(frames.size, 1);
  clock.dispose(); clock.setActive(true); clock.request(tick);
  assert.equal(frames.size, 0);
});

test("the installed Shery distribution creates its own Gooey Panel, sliders and clipboard button", async () => {
  const require = createRequire(import.meta.url);
  const fromShery = createRequire(require.resolve("sheryjs/package.json"));
  const THREE = fromShery("three");
  const calls = [];
  const panel = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return panel; } });
  function ControlKit() { return panel; }
  const stubNode = () => ({ nodeName: "DIV", style: { transform: "" }, classList: { add() {} }, children: [], parentElement: { style: {} },
    appendChild(child) { this.children.push(child); }, addEventListener() {}, getAttribute() { return null; }, getBoundingClientRect() { return { top: 0, left: 0, width: 480, height: 667 }; } });
  const poster = stubNode();
  poster.children = ["a", "b"].map((url) => ({ ...stubNode(), nodeName: "IMG", getAttribute: () => url }));
  const doc = { body: stubNode(), addEventListener() {}, createElement: () => ({ ...stubNode(), getContext: () => ({ drawImage() {} }) }), querySelectorAll: (selector) => selector === "#poster" ? [poster] : [], querySelector: () => stubNode() };
  class Renderer { domElement = stubNode(); setSize() {} setPixelRatio() {} render() {} }
  class TextureLoader { load() { return new THREE.Texture(); } }
  class Image { nodeName = "IMG"; width = 480; height = 667; set src(value) { this.url = value; queueMicrotask(() => this.onload?.()); } }
  const context = { ControlKit, THREE: { ...THREE, WebGLRenderer: Renderer, TextureLoader }, gsap: { to() {} },
    document: doc, Image, innerWidth: 1000, innerHeight: 800, devicePixelRatio: 1, navigator: { clipboard: { writeText: async () => {} } },
    console, performance, requestAnimationFrame: () => 1, addEventListener() {}, dispatchEvent: () => true,
    setTimeout: () => 1, Event: class {}, queueMicrotask };
  context.window = context; context.self = context;
  vm.createContext(context);
  vm.runInContext(readFileSync(fromShery.resolve("./dist/Shery.js"), "utf8"), context);
  context.Shery.imageEffect("#poster", { style: 6, gooey: true, debug: true, config: { zindex: { value: 1 } } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok(calls.some(([method, options]) => method === "addPanel" && options.label === "Gooey Panel"));
  assert.ok(calls.some(([method, options]) => method === "addPanel" && options.label === "Debug Panel"));
  for (const label of ["Speed", "GooeyBall", "Threshold", "Antialias", "Height", "Scale"]) {
    assert.ok(calls.some(([method, , , , options]) => method === "addSlider" && options.label === label), label);
  }
  assert.ok(calls.some(([method, label]) => method === "addButton" && label === "Save To Clipboard"));
});

test("srcdoc controller uses parent origin, survives paused loading, and keeps all three images", async () => {
  const runtime = buildSync({ entryPoints: [`${root}src/features/poster/shery-frame-runtime.ts`], bundle: true, platform: "browser", format: "iife", write: false }).outputFiles[0].text;
  const events = new Map(), documentEvents = new Map(), timers = new Map(), frames = new Map(), sent = [], images = [];
  const textureCanvases = [], drawCalls = [];
  const bounds = { width: 480, height: 667 };
  let textureDisposals = 0;
  class FrameTexture {
    constructor(canvas) { this.image = canvas; textureCanvases.push(canvas); }
    get id() { return this.image.source?.src.split("/").at(-1).replace(".png", ""); }
    dispose() { textureDisposals++; }
  }
  let next = 0, now = 0, options, finePointer = true;
  const textures = ["a", "b", "c"].map((id) => ({ id, dispose() {} }));
  const uniforms = { uTexture: { value: textures }, metaball: { value: .2 }, uIntercept: { value: 0 }, mousei: { value: { x: .5, y: .5 } } };
  const attrs = { meshes: [{ visible: false, geometry: { dispose() {} }, material: { dispose() {} } }], uniforms: [uniforms],
    renderer: { debug: {}, domElement: { addEventListener() {} }, render() {}, dispose() {}, forceContextLoss() {} } };
  const parent = { location: { origin: "https://naturemist.test", href: "https://naturemist.test/" }, postMessage: (message, origin) => sent.push({ message, origin }) };
  const poster = { appendChild: (image) => images.push(image), querySelectorAll: () => images, getBoundingClientRect: () => bounds };
  const document = { hidden: false, getElementById: (id) => id === "poster" ? poster : id === "shery-data" ? { textContent: JSON.stringify({ debug: false, images: ["/a.png", "/b.png", "/c.png"].map((url) => ({ url })), config: { infiniteGooey: { value: true } } }) } : {},
    addEventListener: (name, callback) => documentEvents.set(name, callback), createElement: (tag) => {
      if (tag === "canvas") {
        const canvas = { width: 0, height: 0, getContext: (kind) => kind === "2d" ? {
          drawImage: (...args) => { canvas.source = args[0]; drawCalls.push(args); },
        } : {} };
        return canvas;
      }
      return { naturalWidth: 1600, naturalHeight: 2000, decode: async () => {} };
    }, head: { appendChild: (script) => queueMicrotask(() => script.onload()) } };
  const context = { document, parent, location: { origin: "null", href: "about:srcdoc" }, URL, console, queueMicrotask,
    performance: { now: () => now }, matchMedia: () => ({ matches: finePointer }), THREE: { Texture: FrameTexture, LinearFilter: 1 }, Shery: { imageEffect: (_, config) => { options = config; config.setAttribute(attrs); } },
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; }, cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback) => { timers.set(++next, callback); return next; }, clearTimeout: (id) => timers.delete(id),
    addEventListener: (name, callback) => events.set(name, callback), dispatchEvent() {}, Event: class {}, Element: class {} };
  context.window = context;
  vm.createContext(context); vm.runInContext(runtime, context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(images[0].src, "https://naturemist.test/a.png");
  assert.equal(options.gooey, true); assert.equal(options.debug, false);
  assert.equal(options.config.infiniteGooey.value, true);
  const state = (active, selected, origin = parent.location.origin) => events.get("message")({ source: parent, origin, data: { channel: "naturemist-shery", type: "state", active, selected, cursor: true, duration: 1000 } });
  state(false, 0, "https://wrong.test"); assert.equal(timers.size, 1);
  state(false, 0); assert.equal(timers.size, 0);
  attrs.meshes[0].visible = true;
  state(true, 0); attrs.renderer.render();
  assert.ok(sent.some(({ message, origin }) => message.type === "ready" && origin === parent.location.origin));
  assert.equal(timers.size, 0);
  assert.equal(textureCanvases.length, 3);
  assert.deepEqual(textureCanvases.map(({ width, height }) => [width, height]), [[737, 1024], [737, 1024], [737, 1024]]);
  assert.equal(drawCalls[0][4], 2000);
  assert.ok(drawCalls[0][3] < 1600, "portrait cover crop trims sides without stretching");
  const beforeResize = textureDisposals;
  bounds.width = 600; bounds.height = 400;
  events.get("resize")({ stopImmediatePropagation() {} });
  assert.equal(textureCanvases.length, 3, "resize reuses Texture objects");
  assert.equal(textureDisposals, beforeResize + 3, "old GPU allocations are released before resize");
  assert.deepEqual(textureCanvases.map(({ width, height }) => [width, height]), [[1024, 683], [1024, 683], [1024, 683]]);
  // Explicit frame enter/leave fades both ways even when the parent cursor flag
  // stays true, as it does when crossing an iframe boundary.
  events.get("pointerenter")({ pointerType: "touch" }); attrs.renderer.render();
  now += 400; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0, "touch entry never leaves a hover reveal on the photo");
  finePointer = false;
  events.get("mousemove")(); attrs.renderer.render();
  now += 400; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0, "synthetic mouse movement on touch devices cannot enable hover");
  finePointer = true;
  events.get("pointerenter")({ pointerType: "mouse" }); attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0);
  now += 200; attrs.renderer.render();
  assert.ok(uniforms.uIntercept.value > 0 && uniforms.uIntercept.value < 1);
  now += 200; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 1);
  events.get("pointerleave")({ relatedTarget: null }); attrs.renderer.render();
  now += 250; attrs.renderer.render();
  assert.ok(uniforms.uIntercept.value > 0 && uniforms.uIntercept.value < 1);
  now += 250; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0);
  events.get("mousemove")(); attrs.renderer.render();
  now += 400; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 1, "movement recovers a missed iframe enter event");
  const parentPointer = (inside, origin = parent.location.origin) => events.get("message")({
    source: parent, origin, data: { channel: "naturemist-shery", type: "pointer", inside },
  });
  parentPointer(false, "https://wrong.test"); attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 1, "foreign pointer messages are ignored");
  parentPointer(false); attrs.renderer.render();
  now += 500; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0, "parent leave clears a missed iframe exit event");
  parentPointer(true); attrs.renderer.render();
  now += 400; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 1);
  events.get("blur")(); attrs.renderer.render();
  now += 500; attrs.renderer.render();
  assert.equal(uniforms.uIntercept.value, 0);

  state(true, 2); now += 1001; attrs.renderer.render();
  assert.equal(uniforms.uTexture.value[0].id, "c");
  state(true, 1); now += 1001; attrs.renderer.render();
  assert.equal(uniforms.uTexture.value[0].id, "b");

  // Default 1s expansion / 1.5s contraction becomes a 40% / 60% split.
  const click = (button = 0) => events.get("click")({ button });
  const indexMessages = () => sent.filter(({ message }) => message.type === "index");
  const beforeClick = indexMessages().length;
  click(); now += 399; attrs.renderer.render();
  assert.equal(indexMessages().length, beforeClick);
  now += 1; attrs.renderer.render();
  assert.deepEqual(Array.from(uniforms.uTexture.value, (texture) => texture.id), ["c", "c"]);
  assert.equal(indexMessages().at(-1).message.selected, 2);
  state(true, 2); // Parent acknowledges the peak without restarting the bloom.
  now += 350; attrs.renderer.render();
  assert.deepEqual(Array.from(uniforms.uTexture.value, (texture) => texture.id), ["c", "c"]);
  now += 251; attrs.renderer.render();
  assert.deepEqual(Array.from(uniforms.uTexture.value, (texture) => texture.id), ["c", "a"]);
  click(2); now += 1001; attrs.renderer.render();
  assert.equal(uniforms.uTexture.value[0].id, "c");

  // A rapid second selection starts from the image actually displayed and
  // settles the latest target when the frame goes offscreen before its peak.
  click(); now += 100; attrs.renderer.render(); click();
  assert.deepEqual(Array.from(uniforms.uTexture.value, (texture) => texture.id), ["c", "b"]);
  events.get("message")({ source: parent, origin: parent.location.origin,
    data: { channel: "naturemist-shery", type: "state", active: false, selected: 2, cursor: false, duration: 1000 } });
  assert.equal(uniforms.uTexture.value[0].id, "b");
  assert.equal(indexMessages().at(-1).message.selected, 1);
  const pausedCount = indexMessages().length;
  click(); now += 1001; attrs.renderer.render();
  assert.equal(indexMessages().length, pausedCount);
  assert.equal(uniforms.uTexture.value[0].id, "b");
  state(true, 1); state(true, 999); state(true, -1);
  assert.equal(uniforms.uTexture.value[0].id, "b");
  click(); document.hidden = true; documentEvents.get("visibilitychange")();
  assert.equal(uniforms.uTexture.value[0].id, "c");
  assert.equal(indexMessages().at(-1).message.selected, 2);
  events.get("pagehide")(); assert.equal(frames.size, 0); assert.equal(timers.size, 0);
});

test("a broken alternate image fails back to the HTML poster before starting WebGL", async () => {
  const runtime = buildSync({ entryPoints: [`${root}src/features/poster/shery-frame-runtime.ts`], bundle: true, platform: "browser", format: "iife", write: false }).outputFiles[0].text;
  const images = [], sent = [], timers = new Map();
  let next = 0;
  const parent = { location: { origin: "https://naturemist.test", href: "https://naturemist.test/" }, postMessage: (message) => sent.push(message) };
  const poster = { appendChild: (image) => images.push(image), querySelectorAll: () => images };
  const document = {
    hidden: false,
    getElementById: (id) => id === "poster" ? poster : id === "shery-data" ? {
      textContent: JSON.stringify({ debug: false, images: [{ url: "/a.png" }, { url: "/broken.png" }], config: {} }),
    } : {},
    addEventListener() {},
    createElement: () => ({ naturalWidth: 0, naturalHeight: 0, decode: async () => { throw new Error("broken image"); } }),
    head: { appendChild: (script) => queueMicrotask(() => script.onload()) },
  };
  const context = {
    document, parent, URL, console, queueMicrotask, performance,
    Shery: { imageEffect: () => assert.fail("WebGL must not start with missing images") },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout: (callback) => { timers.set(++next, callback); return next; }, clearTimeout: (id) => timers.delete(id),
    addEventListener() {},
  };
  context.window = context;
  vm.createContext(context); vm.runInContext(runtime, context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(sent.map(({ type }) => type), ["error"]);
  assert.equal(timers.size, 0);
});

async function shopifyTextureLoading(originalAvailable) {
  const runtime = buildSync({ entryPoints: [`${root}src/features/poster/shery-frame-runtime.ts`], bundle: true, platform: "browser", format: "iife", write: false }).outputFiles[0].text;
  const first = "https://cdn.shopify.com/s/files/1/0777/1291/6666/files/ritual.png?v=1";
  const alternate = "https://cdn.shopify.com/s/files/1/0777/1291/6666/files/preparation.png?v=2";
  const images = [], requests = [], sent = [], timers = new Map();
  let next = 0, started = 0;
  const parent = { location: { origin: "https://naturemist.test", href: "https://naturemist.test/" }, postMessage: (message) => sent.push(message) };
  const poster = { appendChild: (image) => images.push(image), querySelectorAll: () => images };
  const attrs = {
    meshes: [{ visible: true, material: {} }],
    uniforms: [{ uTexture: { value: [{}, {}] }, metaball: { value: .2 }, uIntercept: { value: 0 } }],
    renderer: { debug: {}, domElement: { addEventListener() {} }, render() {} },
  };
  const document = {
    hidden: false,
    getElementById: (id) => id === "poster" ? poster : id === "shery-data" ? {
      textContent: JSON.stringify({ debug: false, images: [{ url: first }, { url: alternate }], config: {} }),
    } : {},
    addEventListener() {},
    createElement: (tag) => {
      if (tag === "canvas") return { getContext: () => ({}) };
      if (tag !== "img") return {};
      return {
        naturalWidth: 0, naturalHeight: 0,
        set src(value) {
          this.source = value;
          this.naturalWidth = 0;
          this.naturalHeight = 0;
          requests.push({ url: value, crossOrigin: this.crossOrigin });
        },
        get src() { return this.source; },
        async decode() {
          const url = new URL(this.source);
          if (url.pathname.endsWith("/preparation.png")) {
            if (url.searchParams.has("width") || !originalAvailable) throw new Error("Shopify variant unavailable");
            this.naturalWidth = 1254;
            this.naturalHeight = 1254;
          } else {
            this.naturalWidth = 1024;
            this.naturalHeight = 1536;
          }
        },
      };
    },
    head: { appendChild: (script) => queueMicrotask(() => script.onload()) },
  };
  const context = {
    document, parent, URL, console, queueMicrotask, performance,
    Shery: { imageEffect: (_, options) => { started++; options.setAttribute(attrs); } },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout: (callback) => { timers.set(++next, callback); return next; }, clearTimeout: (id) => timers.delete(id),
    addEventListener() {},
  };
  context.window = context;
  vm.createContext(context); vm.runInContext(runtime, context);
  await new Promise((resolve) => setImmediate(resolve));
  if (started) attrs.renderer.render();
  return { first, alternate, images, requests, sent, started, timers };
}

test("a missing Shopify resized texture retries its original and keeps the gooey animation", async () => {
  const env = await shopifyTextureLoading(true);
  assert.deepEqual(env.requests.map(({ url }) => url), [env.first + "&width=1024", env.alternate + "&width=1024", env.alternate]);
  assert.ok(env.requests.every(({ crossOrigin }) => crossOrigin === "anonymous"), "every source request remains safe for WebGL canvas textures");
  assert.equal(env.images.length, 2, "retry replaces the source without adding another slide");
  assert.deepEqual(env.images.map(({ naturalWidth, naturalHeight }) => [naturalWidth, naturalHeight]), [[1024, 1536], [1254, 1254]]);
  assert.equal(env.started, 1);
  assert.deepEqual(env.sent.map(({ type }) => type), ["ready"]);
  assert.equal(env.timers.size, 0);
});

test("a Shopify texture with both resized and original files missing still falls back safely", async () => {
  const env = await shopifyTextureLoading(false);
  assert.deepEqual(env.requests.map(({ url }) => url), [env.first + "&width=1024", env.alternate + "&width=1024", env.alternate]);
  assert.ok(env.requests.every(({ crossOrigin }) => crossOrigin === "anonymous"));
  assert.equal(env.images[1].naturalWidth, 0);
  assert.equal(env.started, 0, "WebGL must not start with an undecodable original");
  assert.deepEqual(env.sent.map(({ type }) => type), ["error"]);
  assert.equal(env.timers.size, 0);
});
