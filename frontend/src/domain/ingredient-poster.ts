import type { StoreImage } from "./catalog/products";
import { boundedNumber } from "./catalog/hero";
import { parseSheryConfig, type SheryConfig } from "./shery-config";

export type IngredientClarityContent = {
  plantImages: StoreImage[];
  preparationImages: StoreImage[];
  lifestyleImages: StoreImage[];
  background: StoreImage | null;
  mobileBackground: StoreImage | null;
  botanical: StoreImage | null;
};

export const defaultIngredientClarity: IngredientClarityContent = {
  plantImages: [{ url: "/images/ingredient-plant-v1.png", altText: "Fresh amla fruit in a woven basket with leafy botanical branches", width: 1448, height: 1086 }],
  preparationImages: [{ url: "/images/naturemist-ritual.png", altText: "Mixing an amla botanical paste with a wooden spoon", width: 1024, height: 1536 }],
  lifestyleImages: [{ url: "/images/ingredient-lifestyle-v1.png", altText: "A NatureMist amla powder jar beside a sunlit bathroom basin", width: 1086, height: 1448 }],
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
