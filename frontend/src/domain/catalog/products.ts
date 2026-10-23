import { isGlbUrl } from "./hero";

export type ProductFaq = {
  question: string;
  answer: string;
};

export type StoreImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ProductModelMedia = {
  id: string;
  url: string;
  altText: string;
  previewImage: StoreImage | null;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  sku: string | null;
  pricePaise: number;
  compareAtPricePaise: number | null;
  currencyCode: string;
  selectedOptions: Array<{ name: string; value: string }>;
  image: StoreImage | null;
};

export type ProductCollection = {
  id: string;
  handle: string;
  title: string;
};

export type ProductHeroContent = {
  eyebrow: string;
  headlineFirst: string;
  headlineMiddle: string;
  headlineItalic: string;
  description: string;
  badgeText: string;
  badgeSubtitle: string;
  howToText: string;
};

export type Product = {
  id?: string;
  productType?: string;
  slug: string;
  shopifyHandle?: string;
  name: string;
  botanical: string;
  plantPart: string;
  collectionNumber: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  pricePaise: number;
  size: string;
  availability: string;
  shortDescription: string;
  description?: string;
  descriptionHtml?: string;
  metaDescription: string;
  seoTitle?: string;
  ingredient: string;
  formulation?: string;
  benefits: string[];
  howTo: string[];
  mixers: string[];
  suitableFor: string[];
  safety: string[];
  storage: string;
  texture: string;
  concerns: string[];
  ritualStep: "Cleanse" | "Condition" | "Colour" | "";
  experience: "Beginner" | "Familiar" | "Advanced" | "";
  colorConsiderations: string[];
  searchTerms: string[];
  faqs: ProductFaq[];
  currencyCode?: string;
  compareAtPricePaise?: number | null;
  availableForSale?: boolean;
  featuredImage?: StoreImage | null;
  heroPoster?: StoreImage | null;
  heroBackground?: StoreImage | null;
  heroModel?: { url: string; altText: string } | null;
  heroEnabled?: boolean;
  heroOrder?: number;
  heroDurationSeconds?: number;
  images?: StoreImage[];
  models?: ProductModelMedia[];
  variants?: ProductVariant[];
  collections?: ProductCollection[];
  tags?: string[];
  hero?: ProductHeroContent;
};

export type HomepageHeroProduct = Product & {
  heroEntryId: string;
  heroPoster: StoreImage;
  heroBackground: StoreImage;
  heroModel: { url: string; altText: string };
};

export function getHomepageHeroProducts(
  catalog: readonly Product[],
): HomepageHeroProduct[] {
  // Each explicitly enabled, storefront-visible product owns one slide.
  // Missing references never borrow another product's media.
  return catalog.flatMap<HomepageHeroProduct>((product) => {
    if (product.heroEnabled !== true || !product.heroPoster?.url?.trim() || !product.heroBackground?.url?.trim() || !product.heroModel || !isGlbUrl(product.heroModel.url)) return [];
    return [{
      ...product,
      heroEntryId: product.id || product.slug,
      heroModel: product.heroModel,
      heroPoster: product.heroPoster,
      heroBackground: product.heroBackground,
    }];
  })
    .sort((left, right) => {
      const leftOrder = left.heroOrder ?? Number(left.collectionNumber);
      const rightOrder = right.heroOrder ?? Number(right.collectionNumber);
      const normalizedLeft = Number.isFinite(leftOrder)
        ? leftOrder
        : Number.MAX_SAFE_INTEGER;
      const normalizedRight = Number.isFinite(rightOrder)
        ? rightOrder
        : Number.MAX_SAFE_INTEGER;

      return normalizedLeft - normalizedRight;
    });
}

// Preview copy follows the supplied product guide; live Shopify content takes priority.
// Source and claim boundaries: docs/product-information/workbook-source.json.
export const products: Product[] = [
  {
    slug: "amla-powder",
    name: "Amla Powder",
    botanical: "Phyllanthus emblica",
    plantPart: "Fruit powder",
    collectionNumber: "01",
    subtitle: "Traditional hair pack",
    accent: "#6f8f2f",
    accentSoft: "#dce7ad",
    pricePaise: 44900,
    compareAtPricePaise: 59900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "Amla fruit powder for a traditional herbal hair-pack routine.",
    metaDescription:
      "Discover the NatureMist Amla ritual: a carefully explained single-botanical pre-wash mask for modern hair care.",
    ingredient: "Amla fruit powder. Botanical identity and batch details are confirmed on the final pack.",
    benefits: [
      "Fruit powder for herbal hair packs",
      "A botanical with an Ayurvedic care heritage",
      "A separate pack step alongside your cleansing routine",
    ],
    howTo: [
      "Read the pack directions and complete the directed small-area test before use.",
      "Mix fresh with clean water using the quantities and consistency on the pack.",
      "Apply and rinse according to the pack's hair-use directions and timing. Discard leftover wet paste.",
    ],
    mixers: ["Clean water, as directed on the pack"],
    suitableFor: ["Herbal hair-pack routines", "Traditional botanical care"],
    safety: [
      "Patch test before first use.",
      "Strand-test blonde, grey, bleached, porous or colour-treated hair.",
      "For external use only; avoid eyes and broken skin.",
    ],
    storage: "Keep sealed in a cool, dry place. Always use a clean, dry spoon.",
    texture: "Finely milled, earthy green botanical powder.",
    concerns: ["Softness + Shine", "Resilient-Feeling Hair", "Scalp Ritual"],
    ritualStep: "Condition",
    experience: "Beginner",
    colorConsiderations: ["Grey", "Blonde/Bleached", "Chemically Coloured"],
    searchTerms: ["amla", "indian gooseberry", "shine", "conditioning", "mask"],
    featuredImage: {
      url: "/images/amla-powder.jpg",
      altText: "NatureMist Amla Powder jar",
      width: 1000,
      height: 1000,
    },
    heroPoster: {
      url: "/images/naturemist-hero.png",
      altText: "NatureMist Amla botanical hair ritual",
      width: 1692,
      height: 930,
    },
    faqs: [
      {
        question: "Is Amla a good first botanical ritual?",
        answer:
          "Amla offers a traditional herbal hair-pack step. Start with the preparation and application directions on your jar, including the directed small-area and strand tests.",
      },
      {
        question: "Can I combine Amla with another powder?",
        answer:
          "You can build a routine with a separate cleansing step and an Amla pack. Follow each product's directions; use a combined mixture only when the pack provides directions for it.",
      },
    ],
  },
  {
    slug: "reetha-powder",
    name: "Reetha Powder",
    botanical: "Sapindus mukorossi",
    plantPart: "Fruit shell powder",
    collectionNumber: "02",
    subtitle: "Botanical cleanse",
    accent: "#9a5a3d",
    accentSoft: "#ead2c3",
    pricePaise: 39900,
    compareAtPricePaise: 49900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A soapnut powder for a botanical hair-wash routine.",
    metaDescription:
      "Explore the NatureMist Reetha wash ritual, with careful preparation, pairing and eye-safety guidance.",
    ingredient: "Reetha fruit shell powder. Exact plant part and batch details are confirmed on the final pack.",
    featuredImage: {
      url: "/images/reetha-powder.jpg",
      altText: "NatureMist Reetha Powder jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Soapnut powder for herbal hair washes",
      "A botanical cleansing step",
      "A rinse-off routine guided by the pack directions",
    ],
    howTo: [
      "Complete the directed small-area test. Mix with clean water using the pack quantities and preparation method.",
      "Work gently at the roots without splashing.",
      "Follow the pack timing and rinse thoroughly, keeping the mixture away from your face and eyes. Discard leftover wet mixture.",
    ],
    mixers: ["Clean water, as directed on the pack"],
    suitableFor: ["Botanical hair-wash routines"],
    safety: [
      "Keep strictly away from eyes; natural saponins can sting.",
      "Begin with less on dry, curly or sensitive hair.",
      "Do not use on irritated or broken skin.",
    ],
    storage: "Keep sealed and dry. Avoid introducing water into the jar.",
    texture: "Fine, earthy brown cleansing powder.",
    concerns: ["Cleanse", "Scalp Ritual"],
    ritualStep: "Cleanse",
    experience: "Familiar",
    colorConsiderations: [],
    searchTerms: ["reetha", "soapnut", "soapberry", "cleanse", "wash"],
    faqs: [
      {
        question: "Why does Reetha create less foam than shampoo?",
        answer:
          "Reetha contains naturally occurring saponins, so its lather and feel differ from a conventional surfactant formula. More foam does not necessarily mean a better cleanse.",
      },
      {
        question: "Can Reetha be used near the face?",
        answer:
          "No. Keep it strictly away from the eyes and face because the natural saponins can cause significant stinging.",
      },
    ],
  },
  {
    slug: "shikakai-powder",
    name: "Shikakai Powder",
    botanical: "Acacia concinna",
    plantPart: "Pod powder",
    collectionNumber: "03",
    subtitle: "Traditional hair wash",
    accent: "#b18236",
    accentSoft: "#ecdfbf",
    pricePaise: 39900,
    compareAtPricePaise: 49900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "Shikakai pod powder for a traditional botanical hair-washing routine.",
    metaDescription:
      "Explore NatureMist Shikakai pod powder for traditional hair washing, with preparation and rinse-out guidance.",
    ingredient: "Shikakai pod powder. Check the final pack for botanical identity and plant-part details.",
    featuredImage: {
      url: "/images/shikakai-powder.jpg",
      altText: "NatureMist Shikakai Powder jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Pod powder with a traditional hair-washing role",
      "A botanical ingredient for rinse-off cleansing",
      "A dedicated wash step in your routine",
    ],
    howTo: [
      "Complete the directed small-area test. Mix with clean water as directed on the pack.",
      "Apply gently through roots and lengths without rough rubbing.",
      "Follow the pack timing and rinse thoroughly. Discard leftover wet paste and follow with your usual conditioning step if needed.",
    ],
    mixers: ["Clean water, as directed on the pack"],
    suitableFor: ["Traditional hair-washing routines"],
    safety: [
      "Patch test before first use.",
      "Avoid eyes, inhalation and broken skin.",
      "Introduce gradually if your scalp is sensitive.",
    ],
    storage: "Store tightly closed away from humidity and direct sunlight.",
    texture: "Soft, warm ochre botanical powder.",
    concerns: ["Cleanse", "Softness + Shine"],
    ritualStep: "Cleanse",
    experience: "Beginner",
    colorConsiderations: [],
    searchTerms: ["shikakai", "acacia concinna", "senegalia rugata", "pods", "hair wash"],
    faqs: [
      {
        question: "Is Shikakai the same as shampoo?",
        answer:
          "No. It is a single botanical powder with a low-lather ritual and a different sensory experience from a formulated shampoo.",
      },
      {
        question: "Can I combine it with Reetha?",
        answer:
          "Reetha and Shikakai are both cleansing botanicals. Follow each jar's directions and use a combined mixture only when the product provides a preparation method for it.",
      },
    ],
  },
  {
    slug: "bhringraj-powder",
    name: "Bhringraj Powder",
    botanical: "Eclipta prostrata",
    plantPart: "Check the plant part on the pack",
    collectionNumber: "04",
    subtitle: "Scalp + length ritual",
    accent: "#244c32",
    accentSoft: "#c5d5c7",
    pricePaise: 44900,
    compareAtPricePaise: 59900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "Bhringraj powder for traditional hair and scalp packs, with an Ayurvedic care heritage.",
    metaDescription:
      "Discover NatureMist Bhringraj, a grounding scalp-and-length botanical ritual explained without exaggerated claims.",
    ingredient: "Bhringraj powder. Check the final pack for the supplied species and plant part.",
    featuredImage: {
      url: "/images/bhringraj-powder.jpg",
      altText: "NatureMist Bhringraj Powder jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Traditionally valued in Ayurvedic hair care",
      "A botanical ingredient for hair and scalp packs",
      "A separate pack step in your routine",
    ],
    howTo: [
      "Complete the directed small-area test. Mix fresh with clean water as directed on the pack.",
      "Apply in sections across scalp and lengths.",
      "Follow the pack's application time and rinse-out method. Discard leftover wet paste.",
    ],
    mixers: ["Clean water, as directed on the pack"],
    suitableFor: ["Traditional hair and scalp packs"],
    safety: [
      "Patch test before use.",
      "Avoid eyes, inhalation and irritated skin.",
      "This is cosmetic ritual care, not a treatment for scalp conditions.",
    ],
    storage: "Keep cool, dry and sealed. Use a clean, dry utensil.",
    texture: "Deep forest-green, finely milled botanical powder.",
    concerns: ["Scalp Ritual", "Resilient-Feeling Hair", "Condition"],
    ritualStep: "Condition",
    experience: "Familiar",
    colorConsiderations: ["Grey", "Blonde/Bleached"],
    searchTerms: ["bhringraj", "eclipta", "false daisy", "scalp ritual", "mask"],
    faqs: [
      {
        question: "Does Bhringraj treat hair loss?",
        answer:
          "NatureMist presents Bhringraj as a cosmetic scalp-and-length ritual only. We do not make hair-growth, hair-loss or medicinal scalp claims.",
      },
      {
        question: "What can I pair it with?",
        answer:
          "Amla, Hibiscus and Bhringraj offer a choice of traditional hair-pack ingredients. Follow each jar's directions and keep preparation steps separate unless a blend is specifically directed.",
      },
    ],
  },
  {
    slug: "hibiscus-powder",
    name: "Hibiscus Powder",
    botanical: "Hibiscus rosa-sinensis",
    plantPart: "Flower powder",
    collectionNumber: "05",
    subtitle: "Botanical flower pack",
    accent: "#8b3041",
    accentSoft: "#eccbd1",
    pricePaise: 49900,
    compareAtPricePaise: 64900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "Hibiscus flower powder for a traditional botanical hair-pack routine.",
    metaDescription:
      "Explore NatureMist Hibiscus flower powder for herbal hair packs, with preparation and care guidance.",
    ingredient: "Hibiscus flower powder. Species, plant part and cosmetic use are confirmed on the final pack.",
    featuredImage: {
      url: "/images/hibiscus-powder.jpg",
      altText: "NatureMist Hibiscus Powder jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Flower powder for traditional herbal hair packs",
      "A floral ingredient for a separate pack step",
      "A botanical choice alongside your usual wash routine",
    ],
    howTo: [
      "Complete the directed small-area and strand tests. Prepare a fresh paste with clean water as directed on the pack.",
      "Apply according to the hair-pack directions, avoiding eyes and irritated scalp.",
      "Follow the pack timing and rinse-out method. Discard leftover wet paste.",
    ],
    mixers: ["Clean water, as directed on the pack"],
    suitableFor: ["Herbal hair-pack routines"],
    safety: [
      "Patch and strand test before use.",
      "Pigment may mark fabric or temporarily affect very light, porous hair.",
      "Avoid eyes, inhalation and broken skin.",
    ],
    storage: "Store sealed away from moisture, light and heat.",
    texture: "Finely milled burgundy-red floral powder.",
    concerns: ["Softness + Shine", "Condition"],
    ritualStep: "Condition",
    experience: "Beginner",
    colorConsiderations: ["Grey", "Blonde/Bleached", "Chemically Coloured"],
    searchTerms: ["hibiscus", "flower powder", "softness", "shine", "curly"],
    faqs: [
      {
        question: "Can Hibiscus affect very light hair?",
        answer:
          "Its natural pigment may temporarily affect very light, grey, bleached or porous hair. Always strand-test first.",
      },
      {
        question: "Can I use it on my face?",
        answer:
          "Follow the uses on your jar's label. Face and body packs are a future development option in the product guide; facial directions for this flower powder are still needed.",
      },
    ],
  },
  {
    slug: "indigo-powder",
    name: "Indigo Powder",
    botanical: "Indigofera tinctoria",
    plantPart: "Leaf powder",
    collectionNumber: "06",
    subtitle: "Botanical colour",
    accent: "#283c75",
    accentSoft: "#c9d0e7",
    pricePaise: 49900,
    compareAtPricePaise: 64900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A colour-depositing leaf powder for informed, carefully strand-tested botanical colour rituals.",
    metaDescription:
      "Learn the NatureMist Indigo colour ritual, including honest result variables, strand testing and essential safety guidance.",
    ingredient: "Indigo leaf powder. Batch identity and colour-use directions are confirmed on the final pack.",
    featuredImage: {
      url: "/images/indigo-powder.jpg",
      altText: "NatureMist Indigo Powder jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Deposits botanical colour when prepared correctly",
      "Supports traditional multi-step colour rituals",
      "Includes clear guidance around result variables",
    ],
    howTo: [
      "Read all directions in full before mixing — Indigo requires precision and proper preparation.",
      "Wear gloves and follow the pack's mixing, application and processing times. A suitable henna step may be required; henna is not included in this range and Amla does not replace it.",
      "Patch and strand test before use; final tone varies with starting colour, porosity and previous treatments.",
    ],
    mixers: ["Use only the ingredients specified in the pack's colour directions"],
    suitableFor: ["Experienced botanical colour users", "Hair colour rituals only"],
    safety: [
      "Indigo alone may appear blue or green on light or grey hair.",
      "Avoid eyes, brows, lashes, inhalation, damaged scalp, clothing and surfaces.",
      "Never skip the patch and strand test described on the final pack.",
    ],
    storage: "Keep airtight, cool and dry. Protect from humidity and direct light.",
    texture: "Fine deep-indigo-green leaf powder with natural colour variation.",
    concerns: ["Botanical Colour"],
    ritualStep: "Colour",
    experience: "Advanced",
    colorConsiderations: ["Grey", "Blonde/Bleached", "Chemically Coloured"],
    searchTerms: ["indigo", "indigofera tinctoria", "leaf powder", "botanical colour", "grey hair"],
    faqs: [
      {
        question: "Will Indigo alone make grey hair black?",
        answer:
          "Not reliably. Indigo alone can look blue or green on light or grey hair. Darker results commonly require a properly designed henna-led or two-step process.",
      },
      {
        question: "Why is a strand test essential?",
        answer:
          "Starting colour, porosity, prior treatments, preparation and timing all affect the final tone. A strand test is the safest way to preview your individual result.",
      },
    ],
  },
];

export const ritualGoals = [
  "Cleanse",
  "Softness + Shine",
  "Resilient-Feeling Hair",
  "Scalp Ritual",
  "Botanical Colour",
] as const;

export type RitualGoal = (typeof ritualGoals)[number];

export function matchesRitualGoal(product: Pick<Product, "concerns" | "ritualStep">, goal: RitualGoal) {
  if (product.concerns.some((concern) => concern.trim().toLowerCase() === goal.toLowerCase())) return true;
  const step = goal === "Cleanse" ? "Cleanse"
    : goal === "Softness + Shine" ? "Condition"
    : goal === "Botanical Colour" ? "Colour" : null;
  return step !== null && product.ritualStep === step;
}

export type ProductBundle = {
  id: string;
  handle?: string;
  name: string;
  description: string;
  slugs: readonly string[];
};

export const bundles: ProductBundle[] = [
  {
    id: "essential-wash-day",
    name: "Essential Wash Day",
    description: "Reetha, Shikakai and Amla for a cleanse-soften-complete ritual.",
    slugs: ["reetha-powder", "shikakai-powder", "amla-powder"],
  },
  {
    id: "softness-luster",
    name: "Softness & Luster Ritual",
    description: "Amla, Hibiscus and Bhringraj to tailor a richer botanical mask.",
    slugs: ["amla-powder", "hibiscus-powder", "bhringraj-powder"],
  },
  {
    id: "botanical-cabinet",
    name: "The Botanical Cabinet",
    description: "All six powders, with dedicated Indigo colour-safety guidance.",
    slugs: products.map((product) => product.slug),
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function findProduct(catalog: readonly Product[], slug: string) {
  return catalog.find((product) => product.slug === slug);
}

export function getDefaultVariant(product: Product) {
  return (
    product.variants?.find((variant) => variant.availableForSale) ??
    product.variants?.[0] ??
    null
  );
}

export function getBundleProducts(slugs: readonly string[]) {
  return slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is Product => Boolean(product));
}

export function formatCurrency(pricePaise: number, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: Number.isInteger(pricePaise / 100) ? 0 : undefined,
  }).format(pricePaise / 100);
}

export function calculateDiscountPercent(
  pricePaise: number | null | undefined,
  compareAtPricePaise: number | null | undefined,
): number {
  if (
    typeof pricePaise !== "number" ||
    typeof compareAtPricePaise !== "number" ||
    !Number.isFinite(pricePaise) ||
    !Number.isFinite(compareAtPricePaise) ||
    compareAtPricePaise <= pricePaise ||
    compareAtPricePaise <= 0
  ) {
    return 0;
  }
  return Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100);
}

export function calculateSavingsPaise(
  pricePaise: number | null | undefined,
  compareAtPricePaise: number | null | undefined,
): number {
  if (
    typeof pricePaise !== "number" ||
    typeof compareAtPricePaise !== "number" ||
    !Number.isFinite(pricePaise) ||
    !Number.isFinite(compareAtPricePaise) ||
    compareAtPricePaise <= pricePaise
  ) {
    return 0;
  }
  return compareAtPricePaise - pricePaise;
}

export const globalSafety =
  "For external use only. Pour slowly to minimise airborne powder. Patch test as directed. Stop use if irritation occurs. Avoid eyes and broken skin. Keep away from children. Prepare fresh and discard leftover paste.";
