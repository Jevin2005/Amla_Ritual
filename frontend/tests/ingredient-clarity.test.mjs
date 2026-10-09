import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import vm from "node:vm";

const result = await build({
  stdin: {
    contents: 'export { IngredientClarity } from "./src/widgets/home/ingredient-clarity"; export { defaultIngredientClarity, defaultIngredientPosterSettings } from "./src/domain/ingredient-poster";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
  plugins: [{ name: "section-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(next\/image)$|store-provider$|magnetic-link$|features\/poster\/ingredient-poster$|ingredient-slideshow$|\.module\.css$/ }, ({ path }) => ({ path, namespace: "boundary" }));
    builder.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => {
      if (path.endsWith(".css")) return { contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' };
      if (path.endsWith("store-provider")) return { contents: 'export const useStore = () => globalThis.store;' };
      if (path.endsWith("ingredient-slideshow")) return { contents: 'export const IngredientSlideshow = ({children}) => children;' };
      if (path.endsWith("ingredient-poster")) return { contents: 'import {createElement} from "react"; export const IngredientPoster = ({label, images, pace}) => createElement("img", {alt: label, src: images[0].url, "data-pace": pace});' };
      if (path.endsWith("magnetic-link")) return { contents: 'import {createElement} from "react"; export const MagneticLink = (props) => createElement("a", props);' };
      return { contents: 'import {createElement} from "react"; export default ({fill, ...props}) => createElement("img", props);' };
    });
  } }],
});

function render(settings = {}) {
  const context = { module: { exports: {} }, require: createRequire(import.meta.url), URL };
  vm.createContext(context);
  vm.runInContext(result.outputFiles[0].text, context);
  const { IngredientClarity, defaultIngredientClarity, defaultIngredientPosterSettings } = context.module.exports;
  context.store = { content: {
    ingredientClarity: { ...defaultIngredientClarity, settings: { ...defaultIngredientClarity.settings, ...settings } },
    ritualPosterSettings: defaultIngredientPosterSettings,
  } };
  return renderToStaticMarkup(createElement(IngredientClarity));
}

test("section visibility removes the entire rendered collage", () => {
  assert.equal(render({ enabled: false }), "");
});

test("saved Shopify wording, button, colors and pace reach the rendered section", () => {
  const html = render({
    wordmark: "Saved brand", eyebrow: "Saved note", heading: "Saved heading", headingEmphasis: "Saved italic",
    plantTitle: "Saved plant", plantText: "Plant details", preparationTitle: "Saved preparation", preparationText: "Mixing details",
    lifestyleTitle: "Saved lifestyle", lifestyleText: "Honest details", buttonLabel: "Read standards", buttonHref: "/our-story#standards",
    transitionPace: 3, panelColor: "#123456", inkColor: "#234567",
  });
  for (const text of ["Saved brand", "Saved note", "Saved heading", "Saved italic", "Saved plant", "Plant details", "Saved preparation", "Mixing details", "Saved lifestyle", "Honest details", "Read standards"]) assert.ok(html.includes(text), text);
  assert.ok(html.includes('href="/our-story#standards"'));
  assert.ok(html.includes("--clarity-panel:#123456"));
  assert.ok(html.includes("--clarity-ink:#234567"));
  assert.equal(html.match(/data-pace="3"/g)?.length, 3);
});

test("button and botanical switches remove only their requested elements", () => {
  const html = render({ buttonEnabled: false, showBotanical: false });
  assert.ok(!html.includes('class="ctaWrap"'));
  assert.ok(!html.includes("botanicalTop"));
  assert.ok(!html.includes("botanicalBottom"));
  assert.ok(html.includes('id="ingredient-standards"'));
  assert.equal(html.match(/data-pace="2"/g)?.length, 3);
});
