import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  stdin: { contents: 'export * from "./src/shared/ui/media-image"; export * from "./src/shared/media/image-delivery";', resolveDir: fileURLToPath(new URL("../", import.meta.url)) },
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{ name: "image-harness", setup(builder) {
    builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|next\/image)$/ }, ({ path }) => ({ path, namespace: "mock" }));
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
});
