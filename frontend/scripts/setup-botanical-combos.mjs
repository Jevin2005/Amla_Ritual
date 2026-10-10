import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { adminQueries, comboDefinition, sectionDefinition } from "./botanical-combos-schema.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv.includes("--apply") ? "apply" : process.argv.includes("--verify") ? "verify" : "inspect";
try { process.loadEnvFile(`${root}.env.local`); } catch (error) { if (error.code !== "ENOENT") throw error; }
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (url, options = {}) => fetchOriginal(url, { ...options, signal: options.signal || AbortSignal.timeout(30000) });
const built = buildSync({
  stdin: { contents: 'export * from "./src/lib/shopify/admin-auth.ts"; export * from "./src/domain/botanical-combos.ts"; export * from "./src/lib/shopify/botanical-combos-query.ts"; export { getCanonicalProductSlug } from "./src/domain/catalog/canonical-slug.ts";', resolveDir: root },
  bundle: true, platform: "node", format: "esm", write: false,
});
const { getAdminToken, adminDomain, defaultBotanicalCombos, parseBotanicalCombos, botanicalCombosSelection, getCanonicalProductSlug } = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`);
const domain = adminDomain();
const version = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-07";
let token;

async function admin(query, variables = {}) {
  token ||= await getAdminToken();
  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length || !result.data) throw new Error(result.errors?.map((error) => error.message).join("; ") || `Shopify HTTP ${response.status}`);
  for (const payload of Object.values(result.data)) {
    if (payload?.userErrors?.length) throw new Error(JSON.stringify(payload.userErrors));
  }
  return result.data;
}

async function verify() {
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!privateToken && !publicToken) throw new Error("Configure a Storefront token to verify published content.");
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(privateToken ? { "Shopify-Storefront-Private-Token": privateToken } : { "X-Shopify-Storefront-Access-Token": publicToken }) },
    body: JSON.stringify({ query: `query VerifyBotanicalBook { ${botanicalCombosSelection} }` }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length) throw new Error(JSON.stringify(result.errors || response.status));
  const content = parseBotanicalCombos(result.data?.botanicalCombos);
  if (!content.enabled || !content.combos.length) throw new Error("The Botanical combos main entry is missing, Draft, hidden, empty, or invalid.");
  console.log(JSON.stringify({ verified: true, domain, heading: `${content.heading} ${content.headingEnding}`, pageTurnDuration: content.pageTurnDuration, combos: content.combos.map((combo) => ({ name: combo.name, products: combo.productIds.length, photo: combo.image.url })) }, null, 2));
}

if (mode === "verify") {
  await verify();
} else {
  const inspection = await admin(adminQueries.inspect);
  const scopes = inspection.currentAppInstallation.accessScopes.map((scope) => scope.handle);
  const required = ["write_metaobject_definitions", "write_metaobjects", "write_files"];
  const missing = required.filter((scope) => !scopes.includes(scope));
  if (!scopes.includes("read_products") && !scopes.includes("write_products")) missing.push("read_products");
  console.log(JSON.stringify({ mode, domain, missingScopes: missing }, null, 2));
  if (missing.length) {
    if (mode === "apply") throw new Error(`Missing existing app scopes: ${missing.join(", ")}. No content changed.`);
    process.exit(0);
  }
  const catalog = await admin(adminQueries.products);
  const seeds = defaultBotanicalCombos.combos.map((combo) => ({
    ...combo,
    productIds: combo.previewSlugs.map((slug) => {
      const matches = catalog.products.nodes.filter((product) => getCanonicalProductSlug(product.title, product.handle) === slug);
      if (matches.length !== 1) throw new Error(`Expected one exact product match for ${slug}; found ${matches.length}. No content changed.`);
      return matches[0].id;
    }),
  }));
  if (catalog.products.pageInfo.hasNextPage) throw new Error("More than 100 products: resolve seed products explicitly before setup. No content changed.");
  console.log(JSON.stringify({ mode, domain, missingScopes: missing, combos: seeds.map(({ name, productIds }) => ({ name, productIds })) }, null, 2));
  if (mode === "apply") {
    if (missing.length) throw new Error(`Missing existing app scopes: ${missing.join(", ")}.`);

    async function ensureDefinition(definition) {
      const existing = (await admin(adminQueries.definition, { type: definition.type })).metaobjectDefinitionByType;
      if (existing) {
        for (const field of definition.fieldDefinitions) {
          if (!existing.fieldDefinitions.some((saved) => saved.key === field.key && saved.type.name === field.type)) throw new Error(`Existing ${definition.type}.${field.key} schema differs. Existing content was preserved.`);
        }
        return existing;
      }
      return (await admin(adminQueries.createDefinition, { definition })).metaobjectDefinitionCreate.metaobjectDefinition;
    }
    async function existingEntry(type, handle) {
      return (await admin(adminQueries.entry, { handle: { type, handle } })).metaobjectByHandle;
    }
    async function saveNewEntry(type, handle, fields) {
      return (await admin(adminQueries.upsert, {
        handle: { type, handle }, metaobject: { fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })), capabilities: { publishable: { status: "ACTIVE" } } },
      })).metaobjectUpsert.metaobject;
    }
    async function photoFor(combo) {
      const filename = `naturemist-combo-${combo.id}.webp`;
      const existing = (await admin(adminQueries.files, { query: `filename:${filename}` })).files.nodes.filter((file) => {
        const path = file.image?.url ? new URL(file.image.url).pathname : "";
        return file.fileStatus === "READY" && path.endsWith(`/${filename}`);
      });
      if (existing.length) return existing[0].id;
      const bytes = await readFile(`${root}public${combo.image.url}`);
      const stage = (await admin(adminQueries.stagedUpload, { input: [{ filename, mimeType: "image/webp", httpMethod: "POST", resource: "IMAGE", fileSize: String(bytes.length) }] })).stagedUploadsCreate.stagedTargets[0];
      if (!stage) throw new Error("Shopify returned no staged upload target.");
      const form = new FormData();
      for (const parameter of stage.parameters) form.append(parameter.name, parameter.value);
      form.append("file", new Blob([bytes], { type: "image/webp" }), filename);
      const upload = await fetch(stage.url, { method: "POST", body: form });
      if (!upload.ok) throw new Error(`Image upload failed (${upload.status}).`);
      const file = (await admin(adminQueries.createFile, { files: [{ originalSource: stage.resourceUrl, filename, contentType: "IMAGE", alt: combo.image.altText, duplicateResolutionMode: "RAISE_ERROR" }] })).fileCreate.files[0];
      if (!file?.id) throw new Error("Shopify returned no uploaded file.");
      for (let attempt = 0; attempt < 15; attempt++) {
        const status = (await admin(adminQueries.fileStatus, { id: file.id })).node;
        if (status?.fileStatus === "READY" && status.image?.url) return file.id;
        if (status?.fileStatus === "FAILED") throw new Error(`Shopify could not process ${filename}.`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error(`Image ${filename} is still processing. Re-run setup after it becomes ready.`);
    }

    const comboSchema = await ensureDefinition(comboDefinition);
    await ensureDefinition(sectionDefinition(comboSchema.id));
    const entries = [];
    for (const combo of seeds) {
      const existing = await existingEntry("botanical_combo", combo.id);
      const entry = existing || await saveNewEntry("botanical_combo", combo.id, {
        name: combo.name, ingredients: combo.ingredients, caption: combo.caption,
        photo: await photoFor(combo), products: JSON.stringify(combo.productIds),
      });
      entries.push(entry);
      console.log(`${existing ? "Preserved" : "Created"} combo: ${combo.name}`);
    }
    const settings = defaultBotanicalCombos;
    const existingMain = await existingEntry("botanical_combos", "main");
    const main = existingMain || await saveNewEntry("botanical_combos", "main", {
      name: "Homepage botanical book", enabled: true, eyebrow: settings.eyebrow, heading: settings.heading,
      heading_ending: settings.headingEnding, description: settings.description, button_label: settings.buttonLabel,
      page_turn_enabled: true, page_turn_duration: settings.pageTurnDuration, combos: JSON.stringify(entries.map((entry) => entry.id)),
    });
    // Read back persisted values after setup; never store tokens in the receipt.
    const saved = await existingEntry("botanical_combos", "main");
    if (saved?.id !== main.id) throw new Error("Could not verify the saved main entry.");
    const receipt = { domain, main: saved, combos: entries };
    await mkdir(`${root}.tmp/botanical-combos`, { recursive: true });
    await writeFile(`${root}.tmp/botanical-combos/installed.json`, JSON.stringify(receipt, null, 2));
    console.log(`${existingMain ? "Preserved" : "Created"} section: https://admin.shopify.com/store/${domain.split(".")[0]}/content/metaobjects/entries/botanical_combos/${main.id.split("/").at(-1)}`);
    await verify();
  }
}
