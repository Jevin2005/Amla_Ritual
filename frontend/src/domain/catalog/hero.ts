import type { ProductHeroContent, StoreImage } from "./products";

export type HomepageHeroEntry = {
  id: string;
  productId: string | null;
  model: { url: string; altText: string } | null;
  poster: StoreImage | null;
  background: StoreImage | null;
  order?: number;
  durationSeconds?: number;
  copy: Partial<ProductHeroContent>;
};

export type HeroSettings = {
  autoplay: boolean;
  intervalSeconds: number;
  autoRotate: boolean;
  rotationSpeed: number;
  cursorMotion: boolean;
  transition: "fade" | "slide" | "none";
};

export const defaultHeroSettings: HeroSettings = {
  autoplay: true,
  intervalSeconds: 8,
  autoRotate: true,
  rotationSpeed: 20,
  cursorMotion: true,
  transition: "fade",
};

export function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export function parseHeroSettings(fields: Record<string, { value?: string | null } | null> | null): HeroSettings {
  const value = (key: string) => fields?.[key]?.value;
  const boolean = (key: string, fallback: boolean) =>
    value(key) === "true" ? true : value(key) === "false" ? false : fallback;
  const transition = value("heroTransition");
  return {
    autoplay: boolean("heroAutoplay", true),
    intervalSeconds: boundedNumber(value("heroInterval"), 8, 3, 60),
    autoRotate: boolean("heroAutoRotate", true),
    rotationSpeed: boundedNumber(value("heroRotationSpeed"), 20, 0, 60),
    cursorMotion: boolean("heroCursorMotion", true),
    transition: transition === "slide" || transition === "none" ? transition : "fade",
  };
}

export function isGlbUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.trim() !== value || value.includes("\\") || (!/^https:\/\//i.test(value) && !/^\/(?!\/)/.test(value))) return false;
  try {
    const url = new URL(value, "https://local.invalid");
    return url.protocol === "https:" && !url.username && !url.password && /\.glb$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function nextHeroIndex(index: number, count: number, direction = 1) {
  return count > 0 ? ((index + direction) % count + count) % count : 0;
}
