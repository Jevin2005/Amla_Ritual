import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

const require = createRequire(import.meta.url);
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/catalog/product-card.tsx", import.meta.url))],
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{ name: "card-boundaries", setup(b) {
    b.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({ path: pathToFileURL(require.resolve(path)).href, external: true }));
    b.onResolve({ filter: /^(next\/(link|image)|@\/features\/store\/store-provider)$/ }, ({ path }) => ({ path, namespace: "card-test" }));
    b.onLoad({ filter: /.*/, namespace: "card-test" }, ({ path }) => ({ contents: {
      "next/link": 'import React from "react"; export default p => React.createElement("a", p);',
      "next/image": 'import React from "react"; export default ({src,alt}) => React.createElement("img", {src,alt});',
      "@/features/store/store-provider": 'export const useStore = () => ({addToCart(){},toggleWishlist(){},isWishlisted(){return false},track(){},content:{customerReviews:[]}});',
    }[path] }));
    b.onResolve({ filter: /\.module\.css$/ }, () => ({ path: "css", namespace: "card-css" }));
    b.onLoad({ filter: /.*/, namespace: "card-css" }, () => ({ contents: "export default {};" }));
  } }],
});
const { ProductCard } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = { slug: "old-handle", name: "Saved Indigo", subtitle: "Saved subtitle", size: "250 g", ritualStep: "Colour", pricePaise: 32550, currencyCode: "INR", availableForSale: true, featuredImage: null };
const render = (overrides = {}) => renderToStaticMarkup(createElement(ProductCard, { product: { ...product, ...overrides } }));

test("listing card displays current Shopify identity, quantity, price, step and handle", () => {
  const html = render({ featuredImage: { url: "https://cdn.shopify.com/indigo.jpg", altText: "Saved Indigo photo" } });
  for (const expected of ["Saved Indigo", "Saved subtitle · 250 g", "₹325.50", "Colour Ritual", '/shop/old-handle', "Saved Indigo photo"]) assert.ok(html.includes(expected), expected);
});

test("missing media never impersonates Amla and sold-out cards cannot add to bag", () => {
  const html = render({ ritualStep: "", availableForSale: false, availability: "In stock" });
  assert.ok(html.includes("/images/product-placeholder.svg"));
  assert.ok(!html.includes("amla-powder.jpg"));
  assert.ok(html.includes("Botanical hair care"));
  assert.ok(html.includes("Sold out"));
  assert.match(html, /<button[^>]*disabled=""[^>]*aria-label="Saved Indigo is sold out"/);
});

test("combo listings reuse the product card with their own product URL and price", () => {
  const html = render({ slug: "classic-trio", name: "Classic Trio", tags: ["combo"], pricePaise: 79900 });
  assert.ok(html.includes('data-collection-kind="combo"'));
  assert.ok(html.includes('/shop/classic-trio'));
  assert.ok(html.includes('₹799'));
  assert.ok(html.includes('Add Classic Trio to bag'));
  assert.ok(html.includes('Save Classic Trio to wishlist'));
  assert.ok(!html.includes('Combined total'));
});

test("unpublished pairing previews do not expose a free price or a fake product URL", () => {
  const html = renderToStaticMarkup(createElement(ProductCard, { product: { ...product, name: "Future Combo", slug: "unpublished", tags: ["combo"], pricePaise: 0, availableForSale: false }, unpublished: true, onPreview() {} }));
  assert.ok(html.includes('Coming soon'));
  assert.ok(!html.includes('₹0'));
  assert.ok(!html.includes('href="/shop/unpublished'));
  assert.ok(!html.includes('Save Future Combo'));
});

test("purchasable combo preview cards retain real pricing and wishlist while opening a dialog", () => {
  const html = renderToStaticMarkup(createElement(ProductCard, { product: { ...product, name: "Classic Trio", slug: "classic-trio", tags: ["combo"], pricePaise: 79900 }, onPreview() {} }));
  assert.ok(html.includes("₹799"));
  assert.ok(!html.includes("Coming soon"));
  assert.ok(html.includes("Save Classic Trio to wishlist"));
  assert.match(html, /aria-haspopup="dialog"[^>]*aria-label="View Classic Trio combo"/);
});
