import type { Product, RitualGoal } from "@/domain/catalog/products";

export const goalOptions: Array<{
  goal: RitualGoal;
  number: string;
  copy: string;
}> = [
  { goal: "Cleanse", number: "01", copy: "A low-lather wash-day reset" },
  { goal: "Softness + Shine", number: "02", copy: "A conditioning mask for luminous lengths" },
  { goal: "Scalp Ritual", number: "03", copy: "Grounding care from scalp through ends" },
  { goal: "Botanical Colour", number: "04", copy: "Informed, carefully strand-tested colour" },
];

export const hairFeels = [
  "Oily",
  "Balanced",
  "Dry / textured",
  "Very light / coloured",
] as const;

export type HairFeel = (typeof hairFeels)[number];

export type RitualRecommendation = {
  product: Product;
  requiresColourReview: boolean;
  guidance?: string;
};

function recommendation(
  product: Product,
  options: Omit<RitualRecommendation, "product"> = {
    requiresColourReview: false,
  },
): RitualRecommendation {
  return { product, ...options };
}

function selectProduct(
  products: readonly Product[],
  preferredSlug: string,
  matches: (product: Product) => boolean,
) {
  return (
    products.find(
      (product) =>
        product.slug === preferredSlug && product.availableForSale !== false,
    ) ??
    products.find(
      (product) => matches(product) && product.availableForSale !== false,
    ) ??
    products.find((product) => product.slug === preferredSlug) ??
    products.find(matches) ??
    products[0] ??
    null
  );
}

export function recommendRitual(
  products: readonly Product[],
  goal: RitualGoal,
  hairFeel: HairFeel,
): RitualRecommendation | null {
  if (goal === "Botanical Colour") {
    const requiresColourReview = hairFeel === "Very light / coloured";
    const product = selectProduct(
      products,
      "indigo-powder",
      (item) =>
        item.ritualStep === "Colour" ||
        item.concerns.includes("Botanical Colour"),
    );
    if (!product) return null;

    return recommendation(product, {
      requiresColourReview,
      guidance: requiresColourReview
        ? "Because you selected very light or coloured hair, begin with the Indigo guidance instead of adding it straight to your bag. Botanical colour can shift differently on grey, blonde, bleached, porous or previously coloured hair, so read the final pack directions and complete a strand test before deciding."
        : undefined,
    });
  }
  if (goal === "Scalp Ritual") {
    const product = selectProduct(
      products,
      "bhringraj-powder",
      (item) => item.concerns.includes("Scalp Ritual"),
    );
    return product ? recommendation(product) : null;
  }
  if (goal === "Cleanse") {
    const product = selectProduct(
      products,
      hairFeel === "Oily" ? "reetha-powder" : "shikakai-powder",
      (item) => item.ritualStep === "Cleanse",
    );
    return product ? recommendation(product) : null;
  }
  const product = selectProduct(
    products,
    hairFeel === "Dry / textured" ? "hibiscus-powder" : "amla-powder",
    (item) => item.concerns.includes("Softness + Shine"),
  );
  return product ? recommendation(product) : null;
}
