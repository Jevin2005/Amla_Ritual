import type { StoreImage } from "./catalog/products";
import { boundedNumber } from "./catalog/hero";
import { parseSheryConfig, type SheryConfig } from "./shery-config";
import { ingredientPosterGalleries } from "./ingredient-poster-gallery";

export type IngredientClarityContent = {
  settings: IngredientClaritySettings;
  plantImages: StoreImage[];
  preparationImages: StoreImage[];
  lifestyleImages: StoreImage[];
  background: StoreImage | null;
  mobileBackground: StoreImage | null;
  botanical: StoreImage | null;
};

export type IngredientClaritySettings = {
  enabled: boolean;
  wordmark: string;
  eyebrow: string;
  heading: string;
  headingEmphasis: string;
  plantTitle: string;
  plantText: string;
  preparationTitle: string;
  preparationText: string;
  lifestyleTitle: string;
  lifestyleText: string;
  buttonEnabled: boolean;
  buttonLabel: string;
  buttonHref: string;
  showBotanical: boolean;
  transitionPace: number;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  panelColor: string;
  panelTextColor: string;
};

export const defaultIngredientClaritySettings: IngredientClaritySettings = {
  enabled: true,
  wordmark: "NatureMist",
  eyebrow: "Notes on botanical care",
  heading: "A thoughtful ritual",
  headingEmphasis: "starts with understanding.",
  plantTitle: "Meet the plant.",
  plantText: "Know the botanical and the part used.",
  preparationTitle: "Make it simply.",
  preparationText: "Clear preparation and safety guidance.",
  lifestyleTitle: "Keep it honest.",
  lifestyleText: "Realistic claims. No miracle promises.",
  buttonEnabled: true,
  buttonLabel: "Read our ingredient promise",
  buttonHref: "/our-story",
  showBotanical: true,
  transitionPace: 2,
  paperColor: "#f8f4e9",
  inkColor: "#292d1c",
  accentColor: "#af603c",
  panelColor: "#28331c",
  panelTextColor: "#f8f4e9",
};

type ContentFields = Record<string, { value?: string | null } | null> | null;

export function parseIngredientClaritySettings(fields: ContentFields): IngredientClaritySettings {
  const defaults = defaultIngredientClaritySettings;
  const text = (key: keyof IngredientClaritySettings) => {
    const field = `ingredient${key[0].toUpperCase()}${key.slice(1)}`;
    return fields?.[field]?.value?.trim() || String(defaults[key]);
  };
  const boolean = (key: keyof IngredientClaritySettings) => text(key) === "false" ? false : text(key) === "true" ? true : Boolean(defaults[key]);
  const color = (key: keyof IngredientClaritySettings) => /^#[\da-f]{6}$/i.test(text(key)) ? text(key) : String(defaults[key]);
  const href = text("buttonHref");
  let buttonHref = defaults.buttonHref;
  // Accept storefront paths and secure links; reject script URLs and protocol-relative URLs.
  if (!/[\s\\\u0000-\u001f\u007f]/.test(href) && (/^\/(?!\/)/.test(href) || /^https:\/\//i.test(href))) {
    try {
      const url = new URL(href, "https://naturemist.invalid");
      if (url.protocol === "https:" && !url.username && !url.password) buttonHref = href;
    } catch { /* Keep the working default link when an editor enters an invalid URL. */ }
  }
  return {
    enabled: boolean("enabled"), wordmark: text("wordmark"), eyebrow: text("eyebrow"),
    heading: text("heading"), headingEmphasis: text("headingEmphasis"),
    plantTitle: text("plantTitle"), plantText: text("plantText"),
    preparationTitle: text("preparationTitle"), preparationText: text("preparationText"),
    lifestyleTitle: text("lifestyleTitle"), lifestyleText: text("lifestyleText"),
    buttonEnabled: boolean("buttonEnabled"), buttonLabel: text("buttonLabel"), buttonHref,
    showBotanical: boolean("showBotanical"),
    transitionPace: boundedNumber(fields?.ingredientTransitionPace?.value, defaults.transitionPace, .5, 4),
    paperColor: color("paperColor"), inkColor: color("inkColor"), accentColor: color("accentColor"),
    panelColor: color("panelColor"), panelTextColor: color("panelTextColor"),
  };
}

export const defaultIngredientClarity: IngredientClarityContent = {
  settings: defaultIngredientClaritySettings,
  ...ingredientPosterGalleries,
  background: null,
  mobileBackground: null,
  botanical: { url: "/images/ingredient-botanical-v1.png", altText: "", width: 1448, height: 1086 },
};

export type IngredientPosterSettings = { gooey: boolean; autoplay: boolean; interval: number; strength: number; config: SheryConfig };
export const defaultIngredientPosterSettings: IngredientPosterSettings = { gooey: true, autoplay: true, interval: 6, strength: 1, config: {} };

export function parseIngredientPosterSettings(fields: Record<string, { value?: string | null } | null> | null): IngredientPosterSettings {
  return {
    gooey: fields?.ritualPosterGooey?.value !== "false",
    autoplay: fields?.ritualPosterAutoplay?.value !== "false",
    interval: boundedNumber(fields?.ritualPosterInterval?.value, 6, 3, 30),
    strength: boundedNumber(fields?.ritualPosterStrength?.value, 1, .5, 1.5),
    config: parseSheryConfig(fields?.ritualPosterConfig?.value),
  };
}

export function posterImages(images: StoreImage[], fallback: StoreImage): StoreImage[] {
  const unique = [...new Map(images.filter((image) => image.url).map((image) => [image.url, image])).values()].slice(0, 8);
  return unique.length ? unique : [fallback];
}
