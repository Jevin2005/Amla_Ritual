import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/cart/cart-product-image.tsx", import.meta.url))],
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{
    name: "image-failure-harness",
    setup(builder) {
      builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|next\/image)$/ }, ({ path }) => ({ path, namespace: "harness" }));
      builder.onLoad({ filter: /.*/, namespace: "harness" }, ({ path }) => ({
        contents: path === "next/image" ? 'export default "Image";' : path === "react/jsx-runtime"
          ? "export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx;"
          : `export function useState(initial) {
              const state = globalThis.__cartImageTest;
              const index = state.cursor++;
              state.slots[index] ??= initial;
              return [state.slots[index], (update) => { state.slots[index] = update(state.slots[index]); }];
            }`,
      }));
    },
  }],
});
const { CartProductImage } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

function setup(t, props) {
  const previous = globalThis.__cartImageTest;
  globalThis.__cartImageTest = { cursor: 0, slots: [] };
  t.after(() => {
    if (previous === undefined) delete globalThis.__cartImageTest;
    else globalThis.__cartImageTest = previous;
  });
  return () => {
    globalThis.__cartImageTest.cursor = 0;
    return CartProductImage(props);
  };
}

test("a restored item displays its variant image without a matching catalogue product", (t) => {
  const render = setup(t, { item: { productName: "Amla", image: { url: "/variant.jpg" } } });
  assert.equal(render().props.src, "/variant.jpg");
  assert.equal(render().props.alt, "Amla");
});

test("an optimizer failure retries the original image before falling back to the product photo", (t) => {
  const render = setup(t, {
    item: { productName: "Amla", image: { url: "/variant.jpg" } },
    product: { featuredImage: { url: "/product.jpg" }, images: [{ url: "/product.jpg" }] },
  });
  render().props.onError();
  assert.equal(render().props.src, "/variant.jpg");
  assert.equal(render().props.unoptimized, true);
  render().props.onError();
  assert.equal(render().props.src, "/product.jpg");
  render().props.onError();
  render().props.onError();
  assert.equal(render().props.src, "/images/product-placeholder.svg");
  assert.equal(render().props.unoptimized, true);
});

test("missing and failed photos always leave an accessible fallback without a retry loop", (t) => {
  const render = setup(t, { item: { productName: "Amla", image: null } });
  assert.equal(render().props.src, "/images/product-placeholder.svg");
  render().props.onError();
  assert.equal(render().type, "span");
  assert.equal(render().props["aria-label"], "Amla");
  assert.equal(render().props.onError, undefined);
});
