import type { StoreImage } from "./catalog/products";
import { boundedNumber } from "./catalog/hero";
import { parseSheryConfig, type SheryConfig } from "./shery-config";

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
