// Read-only replacement for the retired metaobject seeder.
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

if (process.argv.includes("--apply")) {
  throw new Error("The Botanical combo metaobject seeder is retired. Edit combo product metafields and the section's Combo products in display order. See docs/botanical-combos-admin.md. No content changed.");
}
const root = fileURLToPath(new URL("../", import.meta.url));
try { process.loadEnvFile(`${root}.env.local`); } catch (error) { if (error.code !== "ENOENT") throw error; }
const tempRoot = fileURLToPath(new URL("../../tmp/", import.meta.url));
await mkdir(tempRoot, { recursive: true });
const tempDir = await mkdtemp(`${tempRoot}combo-verify-`);
try {
  const outfile = `${tempDir}/verify.mjs`;
  await build({
    stdin: { contents: 'export { getStorefront } from "./src/lib/shopify/storefront.ts"; export { buildComboProductCatalog } from "./src/domain/combo-catalog.ts";', resolveDir: root },
    tsconfig: `${root}tsconfig.json`, outfile,
    bundle: true, platform: "node", format: "esm", packages: "external",
    plugins: [{ name: "server-only-cli", setup(build) {
      build.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "empty" }));
      build.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "", loader: "js" }));
    } }],
  });
  const { getStorefront, buildComboProductCatalog } = await import(pathToFileURL(outfile).href);
  const store = await getStorefront();
  if (store.source !== "shopify") throw new Error("Configure Shopify Storefront access before verifying live combo products.");
  const content = store.content.botanicalCombos;
  if (!content.enabled || !content.combos.length) throw new Error("The Botanical combos section is missing, hidden, empty, or has invalid/unpublished product selections.");
  const entries = buildComboProductCatalog(content.combos, store.products, "shopify").slice(0, content.combos.length);
  if (entries.some((entry) => !entry.listingProduct || entry.products.length !== entry.count)) {
    throw new Error("A selected combo or included jar is missing from the published catalog.");
  }
  console.log(JSON.stringify({ verified: true, source: "product-metafields", combos: entries.map((entry) => ({
    id: entry.combo.id, name: entry.combo.name, jars: entry.count,
    price: entry.purchase.total / 100, currency: entry.purchase.currencyCode,
  })) }, null, 2));
} finally {
  // Only remove the fresh directory created above, never a caller-supplied path.
  await rm(tempDir, { recursive: true, force: true });
}
