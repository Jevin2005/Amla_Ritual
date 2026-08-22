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
  slug: string;
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
  metaDescription: string;
  seoTitle?: string;
  ingredient: string;
  benefits: string[];
  howTo: string[];
  mixers: string[];
  suitableFor: string[];
  safety: string[];
  storage: string;
  texture: string;
  concerns: string[];
  ritualStep: "Cleanse" | "Condition" | "Colour";
  experience: "Beginner" | "Familiar" | "Advanced";
  colorConsiderations: string[];
  searchTerms: string[];
  faqs: ProductFaq[];
  currencyCode?: string;
  compareAtPricePaise?: number | null;
  availableForSale?: boolean;
  featuredImage?: StoreImage | null;
  images?: StoreImage[];
  variants?: ProductVariant[];
  collections?: ProductCollection[];
  tags?: string[];
  hero?: ProductHeroContent;
};

export const products: Product[] = [
  {
    slug: "amla-powder",
    name: "Amla Powder",
    botanical: "Phyllanthus emblica",
    plantPart: "Fruit powder",
    collectionNumber: "01",
    subtitle: "Condition + shine",
    accent: "#6f8f2f",
    accentSoft: "#dce7ad",
    pricePaise: 44900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A versatile pre-wash botanical mask for soft-feeling, smooth and luminous-looking lengths.",
    metaDescription:
      "Discover the NatureMist Amla ritual: a carefully explained single-botanical pre-wash mask for modern hair care.",
    ingredient: "Amla fruit powder. Botanical identity and batch details are confirmed on the final pack.",
    benefits: [
      "Helps hair feel conditioned and smooth",
      "Supports natural-looking shine",
      "Creates an easy, adaptable pre-wash ritual",
    ],
    howTo: [
      "Scoop enough powder for your hair length into a clean, dry bowl.",
      "Add water gradually and mix until smooth and spreadable.",
      "Apply in sections, follow the final pack timing, then rinse thoroughly.",
    ],
    mixers: ["Water", "Aloe gel", "Plain yoghurt", "Hibiscus powder"],
    suitableFor: ["Dull-looking lengths", "Dry-feeling hair", "All hair textures"],
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
      altText: "NatureMist Amla Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    faqs: [
      {
        question: "Is Amla a good first botanical ritual?",
        answer:
          "It can be a simple place to begin because the paste is easy to adapt. Start with water, follow the final pack timing and strand-test very light or porous hair.",
      },
      {
        question: "Can I combine Amla with another powder?",
        answer:
          "Yes. Amla pairs naturally with Shikakai for a wash-day ritual or Hibiscus for a richer conditioning mask. Introduce one new botanical at a time.",
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
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A naturally saponin-containing botanical cleanser for a fresh-feeling scalp and lengths.",
    metaDescription:
      "Explore the NatureMist Reetha wash ritual, with careful preparation, pairing and eye-safety guidance.",
    ingredient: "Reetha fruit shell powder. Exact plant part and batch details are confirmed on the final pack.",
    featuredImage: {
      url: "/images/reetha-powder.jpg",
      altText: "NatureMist Reetha Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Helps lift excess oil and everyday buildup",
      "Creates a naturally low-foam cleansing ritual",
      "Pairs well with softer wash-day botanicals",
    ],
    howTo: [
      "Mix a small amount with warm water into a thin paste or strained infusion.",
      "Work gently at the roots without splashing.",
      "Rinse extremely well, keeping the mixture strictly away from eyes.",
    ],
    mixers: ["Water", "Shikakai powder", "Amla powder"],
    suitableFor: ["Oily-to-balanced hair", "Wash-day buildup", "Experienced ritual users"],
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
    plantPart: "Fruit powder",
    collectionNumber: "03",
    subtitle: "Gentle cleanse + slip",
    accent: "#b18236",
    accentSoft: "#ecdfbf",
    pricePaise: 39900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A traditional low-lather wash that supports soft, manageable-feeling hair and natural slip.",
    metaDescription:
      "Meet the NatureMist Shikakai ritual, a thoughtful low-lather botanical wash for soft, manageable-feeling hair.",
    ingredient: "Shikakai fruit powder. Botanical identity and plant part are confirmed on the final pack.",
    featuredImage: {
      url: "/images/shikakai-powder.jpg",
      altText: "NatureMist Shikakai Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Supports a gentle, low-foam cleanse",
      "Helps hair feel soft and manageable",
      "Offers a considered option for textured hair rituals",
    ],
    howTo: [
      "Mix with water into a smooth, pourable paste.",
      "Apply gently through roots and lengths without rough rubbing.",
      "Rinse thoroughly and follow with your usual conditioning step if needed.",
    ],
    mixers: ["Water", "Reetha powder", "Amla powder"],
    suitableFor: ["Balanced or dry-feeling hair", "Curly and textured hair", "Low-foam routines"],
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
    searchTerms: ["shikakai", "acacia concinna", "gentle wash", "slip", "curly"],
    faqs: [
      {
        question: "Is Shikakai the same as shampoo?",
        answer:
          "No. It is a single botanical powder with a low-lather ritual and a different sensory experience from a formulated shampoo.",
      },
      {
        question: "Can I combine it with Reetha?",
        answer:
          "Yes. Shikakai can soften the feel of a Reetha-led wash. Begin with a simple blend and adjust only after observing how your hair feels.",
      },
    ],
  },
  {
    slug: "bhringraj-powder",
    name: "Bhringraj Powder",
    botanical: "Eclipta prostrata",
    plantPart: "Whole plant powder",
    collectionNumber: "04",
    subtitle: "Scalp + length ritual",
    accent: "#244c32",
    accentSoft: "#c5d5c7",
    pricePaise: 44900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A grounding deep-green botanical mask for conditioned, cared-for scalp and lengths.",
    metaDescription:
      "Discover NatureMist Bhringraj, a grounding scalp-and-length botanical ritual explained without exaggerated claims.",
    ingredient: "Bhringraj whole plant powder. Botanical species and plant part are verified on the final pack.",
    featuredImage: {
      url: "/images/bhringraj-powder.jpg",
      altText: "NatureMist Bhringraj Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Creates a grounding scalp-and-length ritual",
      "Supports conditioned, cared-for hair",
      "Blends naturally into richer botanical masks",
    ],
    howTo: [
      "Mix with water until the paste is smooth and easy to spread.",
      "Apply in sections across scalp and lengths.",
      "Follow the final pack timing, then rinse or cleanse out thoroughly.",
    ],
    mixers: ["Water", "Amla powder", "Hibiscus powder"],
    suitableFor: ["Normal-to-dry hair", "Scalp-focused rituals", "Rich pre-wash masks"],
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
          "Amla makes a versatile companion, while Hibiscus creates a richer softness-focused mask.",
      },
    ],
  },
  {
    slug: "hibiscus-powder",
    name: "Hibiscus Powder",
    botanical: "Hibiscus rosa-sinensis",
    plantPart: "Flower powder",
    collectionNumber: "05",
    subtitle: "Softness + luster",
    accent: "#8b3041",
    accentSoft: "#eccbd1",
    pricePaise: 49900,
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A vivid floral conditioning mask for soft-feeling, smooth and glossy-looking lengths.",
    metaDescription:
      "Explore NatureMist Hibiscus, a vivid floral powder for softness-focused, glossy-looking hair rituals.",
    ingredient: "Hibiscus flower powder. Species, plant part and cosmetic use are confirmed on the final pack.",
    featuredImage: {
      url: "/images/hibiscus-powder.jpg",
      altText: "NatureMist Hibiscus Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Supports soft-feeling, smooth lengths",
      "Encourages a glossy-looking finish",
      "Adds richness to conditioning botanical masks",
    ],
    howTo: [
      "Mix with water into a silky, smooth mask.",
      "Concentrate the ritual through mid-lengths and ends.",
      "Follow the final pack timing and rinse extremely well.",
    ],
    mixers: ["Water", "Amla powder", "Bhringraj powder"],
    suitableFor: ["Dry or coarse hair", "Curly and textured hair", "Softness-focused rituals"],
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
          "Only use a powder on facial skin when the final product is specifically assessed and labelled for that purpose. This collection is designed around hair rituals.",
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
    size: "Net weight to be confirmed",
    availability: "Preview catalogue",
    shortDescription:
      "A colour-depositing leaf powder for informed, carefully strand-tested botanical colour rituals.",
    metaDescription:
      "Learn the NatureMist Indigo colour ritual, including honest result variables, strand testing and essential safety guidance.",
    ingredient: "Indigo leaf powder. Batch identity and colour-use directions are confirmed on the final pack.",
    featuredImage: {
      url: "/images/indigo-powder.jpg",
      altText: "NatureMist Indigo Powder 100% Pure Herbal Powder 250g Jar",
      width: 1000,
      height: 1000,
    },
    benefits: [
      "Deposits botanical colour when prepared correctly",
      "Supports traditional multi-step colour rituals",
      "Includes clear guidance around result variables",
    ],
    howTo: [
      "Read the final pack directions in full before mixing.",
      "Use gloves and the product-tested water ratio, temperature and application window.",
      "Patch and strand test; final tone varies with starting colour, porosity and previous treatments.",
    ],
    mixers: ["Water only, unless the final pack states otherwise", "A separately designed henna step"],
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
    maximumFractionDigits: 0,
  }).format(pricePaise / 100);
}

export const globalSafety =
  "For external use only. Pour slowly to minimise airborne powder. Patch test as directed. Stop use if irritation occurs. Avoid eyes and broken skin. Keep away from children. Prepare fresh and discard leftover paste.";
