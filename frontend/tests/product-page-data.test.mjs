import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
// Render the actual async page with React's server renderer. Data access and
// interactive children are isolated so assertions cover the page's own output.
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/app/shop/[slug]/page.tsx", import.meta.url))],
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{
    name: "product-page-boundaries",
    setup(builder) {
      builder.onResolve({ filter: /^sanitize-html$/ }, ({ path }) => ({ path: pathToFileURL(require.resolve(path)).href, external: true }));
      builder.onLoad({ filter: /\.module\.css$/ }, () => ({ contents: 'export default { content: "description-content" };', loader: "js" }));
      builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({ path: pathToFileURL(require.resolve(path)).href, external: true }));
      builder.onResolve({ filter: /^(next\/link|next\/navigation|@\/features\/catalog|@\/lib\/shopify\/storefront)$/ }, ({ path }) => ({ path, namespace: "page-test" }));
      builder.onLoad({ filter: /.*/, namespace: "page-test" }, ({ path }) => ({
        contents: {
          "next/link": 'import React from "react"; export default function Link(props) { return React.createElement("a", props); }',
          "next/navigation": 'export function notFound() { throw new Error("Not found"); }',
          "@/features/catalog": 'export const ProductCard = () => null; export const ProductDetailActions = () => null; export const ProductGallery = () => null; export const ProductReviewsSection = () => null;',
          "@/lib/shopify/storefront": 'export const getStorefrontProduct = async () => globalThis.__productPageFixture; export const getStorefront = async () => ({ products: [globalThis.__productPageFixture], content: { customerReviews: [], videoReviews: [] } });',
        }[path],
      }));
    },
  }],
});
const { default: ProductPage, generateMetadata } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = {
  slug: "amla-powder", name: "NatureMist Amla Powder", seoTitle: "Amla ritual — shop NatureMist",
  botanical: "Phyllanthus emblica", plantPart: "Fruit", size: "250g", formulation: "Botanical powder",
  accent: "#26452f", accentSoft: "#c5d678", subtitle: "A botanical ritual",
  shortDescription: "Explore Amla Powder.", description: "Merchant's complete product description.", metaDescription: "The saved search description.",
  concerns: [], benefits: ["Merchant's benefit"], howTo: ["Follow the labelled instructions."], storage: "Keep the container closed.",
  faqs: [{ question: "What is included?", answer: "One jar." }], pricePaise: 44950, currencyCode: "INR", availableForSale: true,
};

function setup(t, fixture) {
  const previous = globalThis.__productPageFixture;
  globalThis.__productPageFixture = fixture;
  t.after(() => {
    if (previous === undefined) delete globalThis.__productPageFixture;
    else globalThis.__productPageFixture = previous;
  });
  return { params: Promise.resolve({ slug: fixture.slug }) };
}

function readJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, "Product structured data should be rendered");
  return JSON.parse(match[1]);
}

test("product page renders merchant formulation and uses saved SEO copy without fabricated claims", async (t) => {
  const props = setup(t, product);
  const html = renderToStaticMarkup(await ProductPage(props));
  const metadata = await generateMetadata(props);
  assert.match(html, />Formulation:<\/span>/);
  assert.match(html, />Botanical powder<\/span>/);
  assert.match(html, /Botanical Specifications/);
  assert.match(html, /About this item/);
  assert.match(html, /How to prepare &amp; apply/);
  assert.match(html, /Frequently Asked Questions/);
  assert.equal(metadata.title, product.seoTitle);
  assert.equal(metadata.openGraph.title, product.seoTitle);
  assert.equal(metadata.description, product.metaDescription);
  assert.equal(metadata.openGraph.description, product.metaDescription);
  assert.equal(metadata.alternates.canonical, `/shop/${product.slug}`);
  assert.doesNotMatch(html + JSON.stringify(metadata), /Shade-Dried|100% Pure|Pure Botanical Powder/i);
  const schema = readJsonLd(html);
  assert.equal(schema.name, product.name);
  assert.equal(schema.offers.price, "449.50");
  assert.deepEqual(schema.additionalProperty, [
    { "@type": "PropertyValue", name: "Botanical Name", value: product.botanical },
    { "@type": "PropertyValue", name: "Plant Part", value: product.plantPart },
    { "@type": "PropertyValue", name: "Net Quantity", value: product.size },
    { "@type": "PropertyValue", name: "Formulation", value: product.formulation },
  ]);
});

test("sparse live products omit empty detail sections and structured-data facts", async (t) => {
  const sparse = { ...product, botanical: "", plantPart: " ", size: "", formulation: undefined, subtitle: "", benefits: [], howTo: [], faqs: [], storage: "" };
  const props = setup(t, sparse);
  const html = renderToStaticMarkup(await ProductPage(props));
  for (const absent of ["Botanical Specifications", "About this item", "How to prepare", "Frequently Asked Questions", "product-faq-title", "Formulation:", "Botanical Name:", "Plant Part:", "Net Quantity:"]) assert.ok(!html.includes(absent), absent);
  assert.deepEqual(readJsonLd(html).additionalProperty, []);
  assert.match(html, /Merchant&#x27;s complete product description/);
  assert.doesNotMatch(html, /Shade-Dried|100% Pure/i);
});

test("absent SEO titles fall back to the product name without adding purity claims", async (t) => {
  const props = setup(t, { ...product, seoTitle: undefined });
  const metadata = await generateMetadata(props);
  assert.equal(metadata.title, product.name);
  assert.equal(metadata.openGraph.title, product.name);
  assert.doesNotMatch(JSON.stringify(metadata), /100%|Pure Botanical/i);
});

test("Shopify description preserves authored headings, emphasis, lists and inline styling", async (t) => {
  const descriptionHtml = '<h2 style="text-align:center;color:#26452f">A botanical ritual</h2><p>Keep <strong>this bold</strong> and <em>this italic</em>.<br>Next line.</p><ul><li>First benefit</li><li>Second benefit</li></ul><ol start="3"><li>Mix with water</li></ol><p><span style="font-size:18px;font-family:Georgia;text-decoration:underline">Saved styling</span> <a href="/rituals">Read more</a></p>';
  const html = renderToStaticMarkup(await ProductPage(setup(t, { ...product, descriptionHtml })));
  assert.match(html, /<h2 style="text-align:center;color:#26452f">A botanical ritual<\/h2>/);
  assert.match(html, /<strong>this bold<\/strong> and <em>this italic<\/em>/);
  assert.match(html, /<br\s*\/>Next line/);
  assert.match(html, /<ul><li>First benefit<\/li><li>Second benefit<\/li><\/ul>/);
  assert.match(html, /<ol start="3"><li>Mix with water<\/li><\/ol>/);
  assert.match(html, /font-size:18px;font-family:Georgia;text-decoration:underline/);
  assert.doesNotMatch(html, /Merchant&#x27;s complete product description/);
});

test("formatted descriptions remove executable HTML and styles that escape the card", async (t) => {
  const descriptionHtml = '<script>alert(1)</script><style>body{display:none}</style><p onclick="alert(2)" style="color:#123456;position:fixed;background-image:url(javascript:alert(3))">Saved text</p><a href="java&#x73;cript:alert(4)">Unsafe link</a><img src="https://cdn.shopify.com/example.jpg" onerror="alert(5)" alt="Product">';
  const html = renderToStaticMarkup(await ProductPage(setup(t, { ...product, descriptionHtml })));
  assert.match(html, /<p style="color:#123456">Saved text<\/p>/);
  assert.match(html, /src="https:\/\/cdn.shopify.com\/example.jpg"/);
  assert.doesNotMatch(html, /alert\(|onclick|onerror|javascript:|position:fixed|body\{display/);
});

test("plain-text descriptions retain paragraph and list fallbacks", async (t) => {
  const html = renderToStaticMarkup(await ProductPage(setup(t, { ...product, descriptionHtml: " ", description: "First paragraph.\n\n- First benefit\n- Second benefit\n\n1. Prepare\n2. Rinse" })));
  assert.match(html, /First paragraph\./);
  assert.match(html, /list-disc/);
  assert.match(html, /list-decimal/);
  assert.match(html, />First benefit<\/li>/);
  assert.match(html, />Rinse<\/li>/);
});
