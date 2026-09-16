import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const result = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/domain/catalog/hero-theme.ts", import.meta.url))],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { getHeroTheme } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

const expectedThemes = [
  ["reetha", "Reetha", "Your wash-day ritual.", "#FFF4E3", "#EAD9C8", "#EDBD90", "#F5E6CF", "#432516"],
  ["indigo", "Indigo", "Your colour ritual.", "#F7F4EC", "#DFE6EF", "#DCC49B", "#F2EBDD", "#172943"],
  ["shikakai", "Shikakai", "Your cleansing ritual.", "#FFF3E1", "#E8D8C7", "#E7BE91", "#F3E4CD", "#402719"],
  ["bhringraj", "Bhringraj", "Your botanical ritual.", "#F5F1DD", "#DFE7D8", "#DED3A0", "#F0EDD9", "#173A29"],
  ["hibiscus", "Hibiscus", "Your floral hair ritual.", "#FFF0E7", "#F0DCE0", "#EDB3AD", "#F6E7DA", "#531B2B"],
];

test("all five hero themes preserve the supplied names, taglines and exact palettes", () => {
  for (const [key, name, tagline, heading, body, accent, buttonBackground, buttonText] of expectedThemes) {
    const theme = getHeroTheme({ slug: `${key}-powder`, name: `${name} Powder` });
    const { surface, ...specified } = theme;
    assert.deepEqual(specified, { key, name, tagline, heading, body, accent, buttonBackground, buttonText, dark: true });
    assert.match(surface, /^#[0-9A-F]{6}$/);
  }
});

test("theme matching handles catalogue casing, separators, names and Bhringaraj alias", () => {
  const examples = [
    [{ slug: "PURE_REETHA_100G", name: "Botanical powder" }, "reetha"],
    [{ slug: "product-2", name: "  INDIGO Powder  " }, "indigo"],
    [{ slug: "shikakai-powder-100g", name: "Shikakai Powder" }, "shikakai"],
    [{ slug: "bhringaraj-powder", name: "Bhringraj Powder" }, "bhringraj"],
    [{ slug: "botanical", name: "NatureMist — Hibiscus Powder" }, "hibiscus"],
  ];
  for (const [product, expected] of examples) assert.equal(getHeroTheme(product).key, expected);
});

test("partial names and ambiguous blends cannot acquire another product's identity", () => {
  for (const product of [
    { slug: "indigofera", name: "Indigofera Powder" },
    { slug: "reethal", name: "Reethal Powder" },
    { slug: "reetha-shikakai-blend", name: "Botanical Blend" },
    { slug: "indigo", name: "Hibiscus Powder" },
    { slug: "constructor", name: "toString" },
  ]) assert.equal(getHeroTheme(product).key, "default");
});

test("Amla and unknown products retain the light palette and catalogue name without invented copy", () => {
  for (const product of [
    { slug: "amla-powder", name: "Amla Powder" },
    { slug: "neem-powder", name: " Neem POWDER " },
  ]) {
    const original = structuredClone(product);
    const theme = getHeroTheme(product);
    assert.deepEqual(theme, {
      key: "default",
      name: product.slug.startsWith("amla") ? "Amla" : "Neem",
      tagline: "",
      heading: "#153B2D",
      body: "#5F665E",
      accent: "#527744",
      buttonBackground: "#153B2D",
      buttonText: "#FFFCF5",
      surface: "#F5F1E8",
      dark: false,
    });
    assert.deepEqual(product, original);
  }
  assert.equal(getHeroTheme({ slug: "botanical-powder", name: " " }).name, "botanical powder");
});

function contrast(first, second) {
  const luminance = (hex) => hex.match(/[a-f0-9]{2}/gi)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("theme text and controls meet contrast targets against their opaque base surfaces", () => {
  for (const slug of [...expectedThemes.map(([key]) => key), "amla"]) {
    const theme = getHeroTheme({ slug, name: slug });
    assert.ok(contrast(theme.heading, theme.surface) >= 3, `${slug}: heading`);
    assert.ok(contrast(theme.body, theme.surface) >= 4.5, `${slug}: body`);
    assert.ok(contrast(theme.accent, theme.surface) >= 4.5, `${slug}: accent`);
    assert.ok(contrast(theme.buttonText, theme.buttonBackground) >= 4.5, `${slug}: button`);
  }
});
