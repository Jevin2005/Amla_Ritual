import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/domain/catalog/botanical-uses.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { botanicalProfiles, profilesForTopic, getBotanicalProfile } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

test("skin/body research never changes current product-use categories", () => {
  assert.equal(botanicalProfiles.length, 6);
  assert.equal(profilesForTopic("hair").length, 5);
  assert.deepEqual(profilesForTopic("colour").map((p) => p.name), ["Indigo"]);
  for (const topic of ["skin", "body"]) {
    const profiles = profilesForTopic(topic);
    assert.ok(profiles.length > 0);
    assert.ok(profiles.every((p) => p.topic === "hair"));
    assert.ok(profiles.every((p) => p.research.some((r) => r.topic === topic && r.limitation && new URL(r.sourceUrl).protocol === "https:")));
    assert.ok(profiles.every((p) => p.name !== "Indigo"));
  }
});

test("a renamed known Shopify product keeps its guide; unrelated products and blends do not inherit it", () => {
  const amla = botanicalProfiles.find((p) => p.name === "Amla");
  assert.equal(getBotanicalProfile({ id: amla.id, slug: "new-amla-title" }), amla);
  assert.equal(getBotanicalProfile({ slug: "amla-powder" }), amla);
  assert.equal(getBotanicalProfile({ id: "gid://shopify/Product/unknown", slug: "amla-powder" }), undefined);
  assert.equal(getBotanicalProfile({ slug: "amla-hibiscus-blend" }), undefined);
  assert.equal(getBotanicalProfile({ slug: "amla-powder", tags: ["Combo"] }), undefined);
  assert.equal(getBotanicalProfile({ slug: "amla-powder", productType: "Bundle" }), undefined);
});

test("research stays tied to its actual application area", () => {
  assert.deepEqual(profilesForTopic("body").map((p) => p.name), ["Reetha", "Shikakai"]);
  assert.deepEqual(profilesForTopic("skin").map((p) => p.name), ["Amla", "Reetha", "Hibiscus", "Bhringraj"]);
  const reetha = botanicalProfiles.find((p) => p.name === "Reetha");
  assert.match(reetha.research.find((r) => r.topic === "body").limitation, /inference/);
});
