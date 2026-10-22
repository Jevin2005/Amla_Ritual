import type { Product } from "./products";

export type HeroThemeKey = "reetha" | "indigo" | "shikakai" | "bhringraj" | "hibiscus" | "default";

export type HeroTheme = Readonly<{
  key: HeroThemeKey;
  name: string;
  tagline: string;
  heading: string;
  body: string;
  accent: string;
  buttonBackground: string;
  buttonText: string;
  surface: string;
  dark: boolean;
}>;

const themes: Record<Exclude<HeroThemeKey, "default">, HeroTheme> = {
  reetha: {
    key: "reetha",
    name: "Reetha",
    tagline: "Your wash-day ritual.",
    heading: "#FFF4E3",
    body: "#EAD9C8",
    accent: "#EDBD90",
    buttonBackground: "#F5E6CF",
    buttonText: "#432516",
    surface: "#301C12",
    dark: true,
  },
  indigo: {
    key: "indigo",
    name: "Indigo",
    tagline: "Your colour ritual.",
    heading: "#F7F4EC",
    body: "#DFE6EF",
    accent: "#DCC49B",
    buttonBackground: "#F2EBDD",
    buttonText: "#172943",
    surface: "#101D31",
    dark: true,
  },
  shikakai: {
    key: "shikakai",
    name: "Shikakai",
    tagline: "Your cleansing ritual.",
    heading: "#FFF3E1",
    body: "#E8D8C7",
    accent: "#E7BE91",
    buttonBackground: "#F3E4CD",
    buttonText: "#402719",
    surface: "#2D1D14",
    dark: true,
  },
  bhringraj: {
    key: "bhringraj",
    name: "Bhringraj",
    tagline: "Your hair and scalp pack.",
    heading: "#F5F1DD",
    body: "#DFE7D8",
    accent: "#DED3A0",
    buttonBackground: "#F0EDD9",
    buttonText: "#173A29",
    surface: "#102B1E",
    dark: true,
  },
  hibiscus: {
    key: "hibiscus",
    name: "Hibiscus",
    tagline: "Your floral hair-pack ritual.",
    heading: "#FFF0E7",
    body: "#F0DCE0",
    accent: "#EDB3AD",
    buttonBackground: "#F6E7DA",
    buttonText: "#531B2B",
    surface: "#35111E",
    dark: true,
  },
};

const aliases: Readonly<Record<string, Exclude<HeroThemeKey, "default">>> = {
  reetha: "reetha",
  indigo: "indigo",
  shikakai: "shikakai",
  bhringraj: "bhringraj",
  bhringaraj: "bhringraj",
  hibiscus: "hibiscus",
};

export function getHeroTheme(product: Pick<Product, "slug" | "name">): HeroTheme {
  const identify = (value: string) => value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/);
  const nameTokens = identify(product.name);
  // Product names can change without changing existing Shopify URLs.
  const tokens = nameTokens.some((token) => token === "amla" || Object.hasOwn(aliases, token))
    ? nameTokens : identify(product.slug);
  const matches = new Set(tokens.flatMap((token) => token === "amla" ? ["default" as const] : Object.hasOwn(aliases, token) ? [aliases[token]] : []));

  // A blend must not receive a single-botanical label.
  const match = Array.from(matches)[0];
  if (matches.size === 1 && match !== "default") return themes[match];

  return {
    key: "default",
    name: product.name.trim().replace(/\s+powder$/i, "").trim() || product.slug.replace(/[-_]+/g, " ").trim(),
    tagline: "",
    heading: "#153B2D",
    body: "#5F665E",
    accent: "#527744",
    buttonBackground: "#153B2D",
    buttonText: "#FFFCF5",
    surface: "#F5F1E8",
    dark: false,
  };
}
