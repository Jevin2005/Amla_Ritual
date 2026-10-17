import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/domain/combo-artwork.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { getComboArtworkFallback } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = (name, overrides = {}) => ({ slug: `${name}-powder`, shopifyHandle: `${name}-powder`, name: `${name} powder`, ...overrides });
const entry = (names, count = names.length) => ({ count, products: names.map((name) => product(name)) });

test("all three known complete pairings resolve to artwork of their exact jars", () => {
  for (const [names, image] of [
    [["amla", "reetha", "shikakai"], "classic-trio"],
    [["amla", "bhringraj"], "botanical-duo"],
    [["amla", "hibiscus"], "floral-duo"],
  ]) {
    const expected = `/images/botanical-combos/${image}.webp`;
    assert.equal(getComboArtworkFallback(entry(names)), expected);
    assert.equal(getComboArtworkFallback(entry([...names].reverse())), expected);
  }
});

test("renamed listings resolve through canonical names and historical handles", () => {
  const amla = product("amla", { slug: "fruit-jar", shopifyHandle: "amla", name: "Botanical fruit jar" });
  const reetha = product("reetha", { slug: "wash-jar", shopifyHandle: "soapnut-jar", name: "NatureMist Reetha Powder" });
  const shikakai = product("shikakai", { slug: "hair-wash", shopifyHandle: "shikakai-powder", name: "Cleansing botanical" });
  assert.equal(getComboArtworkFallback({ products: [shikakai, amla, reetha], count: 3 }), "/images/botanical-combos/classic-trio.webp");
});

test("different, additional or unknown members never inherit artwork from a combo label", () => {
  for (const names of [["amla", "reetha"], ["amla", "indigo"], ["amla", "hibiscus", "reetha"], ["amla", "brahmi"]]) {
    assert.equal(getComboArtworkFallback({ ...entry(names), combo: { id: "classic-trio", name: "Classic Trio" } }), undefined);
  }
});

test("incomplete, empty and duplicate member sets have no specific fallback", () => {
  for (const candidate of [entry(["amla", "bhringraj"], 3), entry(["amla"], 2), entry([]), entry(["amla", "amla"]), entry(["amla", "reetha", "reetha"]), entry(["amla", "hibiscus"], 1), entry(["amla", "hibiscus"], 2.5)]) {
    assert.equal(getComboArtworkFallback(candidate), undefined);
  }
  const renamedAmla = product("amla", { slug: "another-jar", name: "Amla powder", shopifyHandle: "amla" });
  assert.equal(getComboArtworkFallback({ products: [product("amla"), renamedAmla], count: 2 }), undefined);
});

test("ambiguous product identities do not create an exact member-set match", () => {
  const ambiguous = product("amla", { name: "Bhringraj powder" });
  assert.equal(getComboArtworkFallback({ products: [ambiguous, product("bhringraj")], count: 2 }), undefined);
});
