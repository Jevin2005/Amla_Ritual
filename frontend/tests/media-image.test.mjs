import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  stdin: { contents: 'export * from "./src/shared/ui/media-image"; export * from "./src/shared/media/image-delivery";', resolveDir: fileURLToPath(new URL("../", import.meta.url)) },
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{ name: "image-harness", setup(builder) {
    builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|next\/image)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    builder.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "styles" }));
    builder.onLoad({ filter: /.*/, namespace: "styles" }, () => ({ contents: 'export default { loading: "image-loading" };' }));
    builder.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => ({ contents: path === "next/image"
      ? 'export default "img";'
      : path === "react/jsx-runtime"
        ? 'export const jsx = (type, props) => typeof type === "function" ? type(props) : ({ type, props }); export const jsxs = jsx;'
        : `export function useState(initial) {
            const h = globalThis.__mediaImageTest;
            h.value ??= initial;
            return [h.value, (update) => { h.value = typeof update === "function" ? update(h.value) : update; }];
          }` }));
  } }],
});
const { MediaImage, isShopifyImage, shopifyImageLoader } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const src = "https://cdn.shopify.com/s/files/1/123/files/amla.png?v=123";

test("responsive CDN delivery keeps asset versions and bounds large texture requests", () => {
  const mobile = new URL(shopifyImageLoader({ src, width: 384 }));
  assert.equal(mobile.searchParams.get("width"), "384");
  assert.equal(mobile.searchParams.get("v"), "123");
  assert.equal(new URL(shopifyImageLoader({ src, width: 6000 })).searchParams.get("width"), "2560");
  for (const other of ["/poster.jpg", "https://example.com/photo.jpg", "https://cdn.shopify.com.evil.test/s/files/photo.jpg"]) {
    assert.equal(isShopifyImage(other), false);
    assert.equal(shopifyImageLoader({ src: other, width: 400 }), other);
  }
});

test("failed transformed images retry their original, then the product photo, without an endless retry", (t) => {
  globalThis.__mediaImageTest = {};
  t.after(() => delete globalThis.__mediaImageTest);
  const render = () => MediaImage({ src, fallbackSrc: "/product.jpg", alt: "Amla", fill: true, sizes: "40vw" });
  assert.equal(render().props.loader, shopifyImageLoader);
  render().props.onError({});
  assert.equal(render().props.unoptimized, true);
  assert.equal(render().props.src, src);
  render().props.onError({});
  assert.equal(render().props.src, "/product.jpg");
  render().props.onError({}); render().props.onError({});
  assert.equal(render().props.src, "/images/product-placeholder.svg");
  render().props.onError({});
  assert.equal(render().type, "span");
  assert.equal(render().props["aria-label"], "Amla");
  assert.equal(render().props["aria-busy"], undefined);
  assert.equal(render().props.className, undefined);
});

test("loading images keep layout, ref and caller callbacks, then remove the shimmer after load", (t) => {
  globalThis.__mediaImageTest = {};
  t.after(() => delete globalThis.__mediaImageTest);
  const ref = { current: null };
  const style = { objectFit: "contain", opacity: 0.8 };
  const event = { target: { complete: true, naturalWidth: 640 } };
  const loads = [];
  const render = () => MediaImage({
    src, alt: "Amla", fill: true, sizes: "40vw", ref, style,
    className: "product-artwork", onLoad: (loadedEvent) => loads.push(loadedEvent),
  });
  const pending = render();
  assert.equal(pending.type, "img");
  assert.equal(pending.props.fill, true);
  assert.equal(pending.props.sizes, "40vw");
  assert.equal(pending.props.ref, ref);
  assert.equal(pending.props.style, style);
  assert.equal(pending.props["aria-busy"], true);
  assert.equal(pending.props.className, "product-artwork image-loading");

  pending.props.onLoad(event);
  assert.deepEqual(loads, [event]);
  assert.equal(render().props.className, "product-artwork");
  assert.equal(render().props["aria-busy"], undefined);
});

test("fallback attempts stay loading until success and forward failure events", (t) => {
  globalThis.__mediaImageTest = {};
  t.after(() => delete globalThis.__mediaImageTest);
  const failures = [];
  const error = { target: { complete: true, naturalWidth: 0 } };
  const render = () => MediaImage({ src, alt: "Amla", width: 320, height: 400, onError: (event) => failures.push(event) });
  render().props.onError(error);
  assert.deepEqual(failures, [error]);
  assert.equal(render().props.unoptimized, true);
  assert.equal(render().props["aria-busy"], true);
  assert.equal(render().props.width, 320);
  assert.equal(render().props.height, 400);
  render().props.onLoad({ target: { complete: true, naturalWidth: 320 } });
  assert.equal(render().props["aria-busy"], undefined);
  assert.equal(render().props.className, undefined);
});
