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
  const events = new Map(), timers = new Map(), frames = new Map(), sent = [], images = [];
  let next = 0, now = 0, options;
  const textures = ["a", "b", "c"].map((id) => ({ id, dispose() {} }));
  const uniforms = { uTexture: { value: textures }, metaball: { value: .2 }, uIntercept: { value: 0 }, mousei: { value: { x: .5, y: .5 } } };
  const attrs = { meshes: [{ visible: false, geometry: { dispose() {} }, material: { dispose() {} } }], uniforms: [uniforms],
    renderer: { debug: {}, domElement: { addEventListener() {} }, render() {}, dispose() {}, forceContextLoss() {} } };
  const parent = { location: { origin: "https://naturemist.test", href: "https://naturemist.test/" }, postMessage: (message, origin) => sent.push({ message, origin }) };
  const poster = { appendChild: (image) => images.push(image), querySelectorAll: () => images };
  const document = { hidden: false, getElementById: (id) => id === "poster" ? poster : id === "shery-data" ? { textContent: JSON.stringify({ debug: false, images: ["/a.png", "/b.png", "/c.png"].map((url) => ({ url })), config: { infiniteGooey: { value: true } } }) } : {},
    addEventListener() {}, createElement: () => ({ decode: async () => {} }), head: { appendChild: (script) => queueMicrotask(() => script.onload()) } };
  const context = { document, parent, location: { origin: "null", href: "about:srcdoc" }, URL, console, queueMicrotask,
    performance: { now: () => now }, Shery: { imageEffect: (_, config) => { options = config; config.setAttribute(attrs); } },
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; }, cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback) => { timers.set(++next, callback); return next; }, clearTimeout: (id) => timers.delete(id),
    addEventListener: (name, callback) => events.set(name, callback), dispatchEvent() {}, Event: class {} };
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
  state(true, 2); now = 1001; attrs.renderer.render();
  assert.equal(uniforms.uTexture.value[0].id, "c");
  state(true, 1); now = 2002; attrs.renderer.render();
  assert.equal(uniforms.uTexture.value[0].id, "b");
  events.get("pagehide")(); assert.equal(frames.size, 0); assert.equal(timers.size, 0);
});
