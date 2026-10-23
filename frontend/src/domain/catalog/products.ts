import { isGlbUrl } from "./hero";

export const careAreas = ["Hair Care", "Skin Care", "Hair Colour"] as const;
export type CareArea = (typeof careAreas)[number];

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
  comboProductIds?: string[];
  comboIngredients?: string;
  comboCaption?: string;
  careAreas?: CareArea[];
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
  ritualStep: "Cleanse" | "Pack" | "Condition" | "Colour" | "";
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

export const products: Product[] = [
  {
    "slug": "amla-powder",
    "name": "Amla Powder",
    "botanical": "Phyllanthus emblica",
    "plantPart": "Fruit pulp powder",
    "collectionNumber": "01",
    "subtitle": "Traditional herbal hair packs",
    "accent": "#6f8f2f",
    "accentSoft": "#dce7ad",
    "pricePaise": 44900,
    "compareAtPricePaise": 59900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "A botanical ingredient for a traditional hair-care routine.",
    "metaDescription": "NatureMist Amla Fruit Powder, 200 g, for traditional herbal hair packs. Explore its botanical identity, preparation and intended-use guidance.",
    "ingredient": "Amla fruit pulp powder (Phyllanthus emblica).",
    "benefits": [
      "Fruit powder for traditional herbal hair packs.",
      "A botanical ingredient associated with Ayurvedic care traditions.",
      "A separate pack step within your hair-care routine."
    ],
    "howTo": [
      "Preparation: Read the pack directions and test a small area before first use. Mix the required powder with clean water in a clean bowl.",
      "Hair: Apply according to the hair-pack directions, avoiding eyes and irritated scalp. Do not extend the stated application time.",
      "Rinse: Rinse thoroughly using the method on the pack. Use your usual hair-care products afterwards if needed.",
      "After use: Prepare only what you need and discard leftover wet paste."
    ],
    "mixers": [
      "Water, in the amount directed on the pack"
    ],
    "suitableFor": [
      "Traditional herbal hair-pack routines",
      "People choosing a fruit-based botanical hair-pack ingredient"
    ],
    "safety": [
      "For external use only. Test on a small area before first use and stop if irritation occurs.",
      "Avoid eyes, lips, broken or irritated skin and breathing in loose powder.",
      "Strand-test light, grey, bleached, porous or colour-treated hair.",
      "Facial and body-pack suitability has not been established for this powder. Follow hair-use directions only."
    ],
    "storage": "Keep sealed in a cool, dry place. Always use a clean, dry spoon.",
    "texture": "Fruit powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Hair Packs"
    ],
    "ritualStep": "Pack",
    "experience": "Beginner",
    "colorConsiderations": [
      "Grey",
      "Blonde/Bleached",
      "Chemically Coloured"
    ],
    "searchTerms": [
      "amla",
      "indian gooseberry",
      "phyllanthus emblica",
      "hair care",
      "herbal hair pack",
      "traditional hair care",
      "fruit powder"
    ],
    "featuredImage": {
      "url": "/images/amla-powder.jpg",
      "altText": "NatureMist Amla Fruit Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "heroPoster": {
      "url": "/images/naturemist-hero.png",
      "altText": "NatureMist Amla botanical hair ritual",
      "width": 1692,
      "height": 930
    },
    "faqs": [
      {
        "question": "Is this Amla powder intended for facial or body packs?",
        "answer": "This listing is for herbal hair packs. Facial and body use remains a development option until the actual powder's suitability, tolerance and directions have been assessed. Skin studies using extracts do not establish the same results for this powder."
      },
      {
        "question": "Does this powder reduce breakage or make hair softer?",
        "answer": "Those are useful outcomes to test, but they have not been established for this finished powder. Research on extracts does not establish softness, manageability or reduced breakage from this hair pack."
      },
      {
        "question": "Does Ayurvedic use mean the benefits are clinically proven?",
        "answer": "No. Ayurvedic tradition and clinical product testing are different. Amla research on extracts or oral preparations does not prove the same effects from this cosmetic powder."
      }
    ],
    "careAreas": [
      "Hair Care"
    ],
    "productType": "Botanical Hair Pack Powder",
    "description": "Amla Fruit Powder for Herbal Hair Packs. A botanical ingredient for a traditional hair-care routine. Net quantity: 200 g.\n\nAmla is traditionally valued in Ayurveda. Here, its role is an external-use herbal hair pack prepared and rinsed according to the product directions. It can be chosen as a separate pack step in a hair-care routine.\n\nIngredient studies use different preparations, including extracts and oral products. They do not establish softness, shine, reduced breakage or hair regrowth from this powder. Facial and body-pack use remains a development option pending assessment of the actual product's suitability, tolerance and directions.",
    "seoTitle": "Amla Fruit Powder for Herbal Hair Packs, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Amla · Herbal Hair Packs · 200 g",
      "headlineFirst": "A familiar fruit.",
      "headlineMiddle": "A traditional pack.",
      "headlineItalic": "Time for your ritual.",
      "description": "Amla fruit powder, a botanical ingredient for a traditional hair-care routine.",
      "badgeText": "Herbal hair pack",
      "badgeSubtitle": "Amla fruit powder · 200 g",
      "howToText": "Prepare and rinse according to the hair-pack directions. Make a fresh mixture for each use."
    }
  },
  {
    "slug": "reetha-powder",
    "name": "Reetha Powder",
    "botanical": "Sapindus mukorossi",
    "plantPart": "Fruit shell powder",
    "collectionNumber": "02",
    "subtitle": "Herbal hair-wash routine",
    "accent": "#9a5a3d",
    "accentSoft": "#ead2c3",
    "pricePaise": 39900,
    "compareAtPricePaise": 49900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "A soapnut ingredient for a botanical wash routine.",
    "metaDescription": "NatureMist Reetha Cleansing Powder, 200 g, for herbal hair washes. Explore soapnut's cleansing role, preparation, thorough rinsing and eye-safety guidance.",
    "ingredient": "Reetha fruit shell powder (Sapindus mukorossi).",
    "featuredImage": {
      "url": "/images/reetha-powder.jpg",
      "altText": "NatureMist Reetha Cleansing Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "benefits": [
      "Soapnut fruit-shell powder for herbal hair washes.",
      "A botanical ingredient with naturally occurring cleansing saponins.",
      "A rinse-off wash step within a botanical hair-care routine."
    ],
    "howTo": [
      "Preparation: Test on a small area and follow the pack quantities. Mix with clean water into the consistency directed on the label.",
      "Hair: Work gently through wet roots and lengths, keeping the mixture away from your face and eyes.",
      "Rinse: Rinse thoroughly without leaving the mixture on longer than the pack directs. Follow with your usual conditioner if needed.",
      "After use: Discard leftover wet mixture and keep the dry powder container sealed."
    ],
    "mixers": [
      "Water, in the amount directed on the pack"
    ],
    "suitableFor": [
      "Rinse-off hair cleansing",
      "Wash-day routines",
      "People familiar with botanical hair washes"
    ],
    "safety": [
      "For external use only. Test on a small area before use.",
      "Keep away from the face and eyes; saponins can sting. Rinse with plenty of water if contact occurs.",
      "Do not apply to broken or irritated skin. Stop use if irritation occurs.",
      "Avoid breathing in loose powder. Face and body use has not been established for this product.",
      "Natural foaming does not establish suitability for sensitive skin."
    ],
    "storage": "Keep sealed and dry. Avoid introducing water into the jar.",
    "texture": "Fruit-shell powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Cleanse",
      "Scalp Ritual"
    ],
    "ritualStep": "Cleanse",
    "experience": "Familiar",
    "colorConsiderations": [],
    "searchTerms": [
      "reetha",
      "soapnut",
      "soapberry",
      "sapindus mukorossi",
      "hair care",
      "hair cleanser",
      "wash",
      "saponins"
    ],
    "faqs": [
      {
        "question": "Is Reetha for hair care or skin care?",
        "answer": "Its role in this collection is herbal hair washing. Face or body cleansing would require a separately assessed formulation and directions. Keep the mixture away from the face and eyes."
      },
      {
        "question": "Does natural foam mean Reetha is mild or suitable for sensitive skin?",
        "answer": "No. Soapnut saponins have shown washing properties in laboratory research, but foam does not establish skin tolerance or the performance of this finished powder. Follow the product directions and stop if irritation occurs."
      },
      {
        "question": "Does Reetha treat dandruff?",
        "answer": "We position Reetha as a cosmetic cleanser. It is not a proven treatment for dandruff or a persistent scalp condition."
      }
    ],
    "careAreas": [
      "Hair Care"
    ],
    "productType": "Botanical Hair Cleanser",
    "description": "Reetha Cleansing Powder for Herbal Hair Washes. A soapnut ingredient for a botanical wash routine. Net quantity: 200 g.\n\nReetha fruit shells contain naturally occurring saponins. Laboratory studies of soapnut preparations support a washing role; they do not establish the cleansing performance or tolerance of this finished powder. Prepare and rinse according to the product's hair-wash directions, keeping the mixture away from your face and eyes.\n\nNatural foam does not prove mildness or sensitive-skin suitability. Body-wash and household-cleaning uses are separate development options requiring their own assessment. This cosmetic powder is not a treatment for acne, fungal infections or dandruff.",
    "seoTitle": "Reetha Cleansing Powder for Herbal Hair Washes, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Reetha · Herbal Hair Washes · 200 g",
      "headlineFirst": "A fresh start.",
      "headlineMiddle": "For wash day.",
      "headlineItalic": "Botanical cleansing.",
      "description": "A soapnut ingredient for a botanical hair-wash routine, prepared and rinsed as directed.",
      "badgeText": "Herbal hair wash",
      "badgeSubtitle": "Reetha fruit-shell powder · 200 g",
      "howToText": "Mix and rinse as directed on the pack. Keep the mixture away from eyes and face."
    }
  },
  {
    "slug": "shikakai-powder",
    "name": "Shikakai Powder",
    "botanical": "Acacia concinna",
    "plantPart": "Fruit pod powder",
    "collectionNumber": "03",
    "subtitle": "Traditional wash-day care",
    "accent": "#b18236",
    "accentSoft": "#ecdfbf",
    "pricePaise": 39900,
    "compareAtPricePaise": 49900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "A botanical ingredient for a herbal cleansing routine.",
    "metaDescription": "NatureMist Shikakai Pod Powder, 200 g, for traditional hair washing. Explore its botanical role, preparation, rinse-out and intended-use guidance.",
    "ingredient": "Shikakai fruit pod powder (Acacia concinna).",
    "featuredImage": {
      "url": "/images/shikakai-powder.jpg",
      "altText": "NatureMist Shikakai Pod Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "benefits": [
      "A traditional ingredient for botanical hair washing.",
      "Contains saponins with a cleansing role.",
      "Pod powder for a rinse-off botanical wash routine."
    ],
    "howTo": [
      "Preparation: Test on a small area. Mix with clean water using the quantity and consistency on the pack.",
      "Hair: Work gently through wet roots and lengths without rough rubbing, avoiding your face and eyes.",
      "Rinse: Follow the pack timing, rinse thoroughly and use your usual conditioner if needed.",
      "After use: Prepare fresh each time and discard leftover wet paste."
    ],
    "mixers": [
      "Water, in the amount directed on the pack"
    ],
    "suitableFor": [
      "Botanical hair-washing routines",
      "People exploring traditional wash-day ingredients",
      "Rinse-off hair-wash routines"
    ],
    "safety": [
      "For external use only. Test on a small area before use.",
      "Avoid eyes, lips, broken or irritated skin and breathing in loose powder.",
      "Stop use if irritation occurs. This product is intended for hair cleansing, not facial masks."
    ],
    "storage": "Store tightly closed away from humidity and direct sunlight.",
    "texture": "Pod powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Cleanse"
    ],
    "ritualStep": "Cleanse",
    "experience": "Beginner",
    "colorConsiderations": [],
    "searchTerms": [
      "shikakai",
      "acacia concinna",
      "senegalia rugata",
      "hair care",
      "hair wash",
      "botanical cleanser",
      "saponins"
    ],
    "faqs": [
      {
        "question": "Is Shikakai a shampoo?",
        "answer": "It is a botanical powder used in hair-cleansing routines. Its preparation, foam and feel differ from a formulated shampoo."
      },
      {
        "question": "Can I use Shikakai on my face?",
        "answer": "This product is positioned for traditional hair washing. Benefits of raw pod powder on facial or body skin have not been established. A formulated body cleanser would require a separate assessment."
      },
      {
        "question": "Does Shikakai treat dandruff or make hair easier to detangle?",
        "answer": "The available studies use different wash preparations and have limitations or mixed findings. They do not establish dandruff treatment, detangling, mildness or softness for this finished powder. Those outcomes require relevant product testing."
      }
    ],
    "careAreas": [
      "Hair Care"
    ],
    "productType": "Botanical Hair Cleanser",
    "description": "Shikakai Pod Powder for Traditional Hair Washing. A botanical ingredient for a herbal cleansing routine. Net quantity: 200 g.\n\nShikakai pods have a history of use in hair-washing preparations. Use this powder in a rinse-off wash step, following the product's preparation, application and rinsing directions. Keep the mixture away from your face and eyes.\n\nStudies of pod washes or formulated shampoos do not establish dandruff-treatment efficacy for this finished powder. Softness, detangling, mildness and after-feel are outcomes to assess through product testing. Facial and body-cleansing uses are not established for the current powder.",
    "seoTitle": "Shikakai Pod Powder for Traditional Hair Washing, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Shikakai · Traditional Hair Washing · 200 g",
      "headlineFirst": "A simple wash.",
      "headlineMiddle": "A familiar ritual.",
      "headlineItalic": "Care for your hair.",
      "description": "Shikakai pod powder, a botanical ingredient for a traditional herbal cleansing routine.",
      "badgeText": "Herbal hair wash",
      "badgeSubtitle": "Shikakai pod powder · 200 g",
      "howToText": "Mix with water as directed, work gently through wet hair and rinse well."
    }
  },
  {
    "slug": "bhringraj-powder",
    "name": "Bhringraj Powder",
    "botanical": "Eclipta prostrata",
    "plantPart": "Leaves and aerial parts powder",
    "collectionNumber": "04",
    "subtitle": "Traditional hair + scalp ritual",
    "accent": "#244c32",
    "accentSoft": "#c5d5c7",
    "pricePaise": 44900,
    "compareAtPricePaise": 59900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "A botanical ingredient with an Ayurvedic hair-care heritage.",
    "metaDescription": "NatureMist Bhringraj Powder, 200 g, for traditional hair and scalp packs. Explore its Ayurvedic heritage, botanical identity and practical use guidance.",
    "ingredient": "Bhringraj leaves and aerial parts powder (Eclipta prostrata).",
    "featuredImage": {
      "url": "/images/bhringraj-powder.jpg",
      "altText": "NatureMist Bhringraj Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "benefits": [
      "Traditionally valued in Ayurvedic hair care.",
      "Leaves and aerial parts powder for hair and scalp packs.",
      "A separate botanical pack step within a hair-care routine."
    ],
    "howTo": [
      "Preparation: Test on a small area and mix with clean water using the pack directions.",
      "Hair: Apply the smooth paste gently to scalp and hair in sections, avoiding irritated areas.",
      "Rinse: Follow the pack timing, then rinse or cleanse thoroughly. Use your normal conditioner if needed.",
      "After use: Discard leftover wet paste and keep the dry powder sealed."
    ],
    "mixers": [
      "Water, in the amount directed on the pack"
    ],
    "suitableFor": [
      "Traditional hair and scalp rituals",
      "Rinse-off hair masks",
      "People building a botanical wash-day routine"
    ],
    "safety": [
      "For external use only. Test on a small area and stop use if irritation occurs.",
      "Avoid eyes, broken or irritated skin and breathing in loose powder.",
      "Strand-test light, grey, bleached or porous hair.",
      "This cosmetic powder is not a treatment for hair loss or scalp conditions.",
      "Facial and body-pack suitability has not been established for this product."
    ],
    "storage": "Keep cool, dry and sealed. Use a clean, dry utensil.",
    "texture": "Botanical powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Scalp Ritual",
      "Hair Packs"
    ],
    "ritualStep": "Pack",
    "experience": "Familiar",
    "colorConsiderations": [
      "Grey",
      "Blonde/Bleached"
    ],
    "searchTerms": [
      "bhringraj",
      "eclipta prostrata",
      "eclipta alba",
      "false daisy",
      "hair care",
      "scalp ritual",
      "hair mask",
      "ayurvedic botanical"
    ],
    "faqs": [
      {
        "question": "Is Bhringraj for hair or skin?",
        "answer": "This listing is for traditional hair and scalp packs. Ayurvedic texts also record a skin-care association, but that does not establish facial or body-pack suitability for the supplied powder."
      },
      {
        "question": "Does Bhringraj regrow hair or reverse greying?",
        "answer": "Those results have not been established for this finished powder. We offer it as a traditional cosmetic hair-care ritual, not a treatment for hair loss or grey hair."
      },
      {
        "question": "Does Bhringraj guarantee scalp comfort or softer hair?",
        "answer": "No. Those are outcomes to assess on the finished product. Traditional use and animal extract studies do not establish measurable conditioning, hair regrowth or scalp-comfort results for this powder."
      }
    ],
    "careAreas": [
      "Hair Care"
    ],
    "productType": "Botanical Hair Pack Powder",
    "description": "Bhringraj Powder for Traditional Hair & Scalp Packs. A botanical ingredient with an Ayurvedic hair-care heritage. Net quantity: 200 g.\n\nThis product uses leaves and aerial parts and is positioned for an external-use hair and scalp pack. Prepare a fresh mixture and follow the product's application and rinse-out directions. Ayurvedic hair-care use provides historical context, not proof of a clinical outcome.\n\nPublished hair-growth research uses extracts in animal studies, while some traditional references describe whole-plant preparations. Neither establishes regrowth, grey reversal, softness or scalp-comfort results for this finished powder. Facial and body use requires its own product assessment.",
    "seoTitle": "Bhringraj Powder for Traditional Hair & Scalp Packs, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Bhringraj · Hair & Scalp Packs · 200 g",
      "headlineFirst": "Rooted in tradition.",
      "headlineMiddle": "Time for care.",
      "headlineItalic": "Your scalp ritual.",
      "description": "A botanical ingredient with an Ayurvedic hair-care heritage, for traditional hair and scalp packs.",
      "badgeText": "Hair + scalp pack",
      "badgeSubtitle": "Bhringraj powder · 200 g",
      "howToText": "Mix fresh with water, apply gently and follow the rinse-off timing on the pack."
    }
  },
  {
    "slug": "hibiscus-powder",
    "name": "Hibiscus Powder",
    "botanical": "Hibiscus rosa-sinensis",
    "plantPart": "Flower powder",
    "collectionNumber": "05",
    "subtitle": "Floral herbal hair packs",
    "accent": "#8b3041",
    "accentSoft": "#eccbd1",
    "pricePaise": 49900,
    "compareAtPricePaise": 64900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "A floral ingredient for a botanical hair-pack routine.",
    "metaDescription": "NatureMist Hibiscus Flower Powder, 200 g, for herbal hair packs. Explore flower identity, preparation, strand testing and realistic product guidance.",
    "ingredient": "Hibiscus flower powder (Hibiscus rosa-sinensis).",
    "featuredImage": {
      "url": "/images/hibiscus-powder.jpg",
      "altText": "NatureMist Hibiscus Flower Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "benefits": [
      "Flower powder for traditional herbal hair packs.",
      "A floral ingredient for a botanical hair-care routine.",
      "A separate hair-pack step alongside your usual wash routine."
    ],
    "howTo": [
      "Preparation: Test on a small area and mix a fresh smooth paste with clean water, following the pack quantities.",
      "Hair: Apply according to the hair-pack directions, avoiding eyes and irritated scalp. Do not extend the stated application time.",
      "Rinse: Rinse thoroughly using the method on the pack. Use your usual hair-care products afterwards if needed.",
      "After use: Discard leftover wet paste and clean the bowl and any marked surfaces."
    ],
    "mixers": [
      "Water, in the amount directed on the pack"
    ],
    "suitableFor": [
      "Traditional herbal hair-pack routines",
      "People choosing a flower-based botanical hair-pack ingredient"
    ],
    "safety": [
      "For external use only. Test on a small area first and stop use if irritation occurs.",
      "Natural pigment can mark skin, clothing and surfaces; protect fabrics and rinse well.",
      "Strand-test very light, grey, bleached, porous or colour-treated hair.",
      "Avoid eyes, lips, broken or irritated skin and breathing in loose powder.",
      "Facial and body-pack suitability has not been established for this flower powder. Follow hair-use directions only."
    ],
    "storage": "Store sealed away from moisture, light and heat.",
    "texture": "Flower powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Hair Packs"
    ],
    "ritualStep": "Pack",
    "experience": "Beginner",
    "colorConsiderations": [
      "Grey",
      "Blonde/Bleached",
      "Chemically Coloured"
    ],
    "searchTerms": [
      "hibiscus",
      "hibiscus rosa-sinensis",
      "flower powder",
      "hair care",
      "herbal hair pack",
      "traditional hair care",
      "floral"
    ],
    "faqs": [
      {
        "question": "Is this Hibiscus powder intended for face or body packs?",
        "answer": "This listing is for herbal hair packs. Face and body use remains a development option until the exact flower powder's suitability, tolerance and directions have been assessed. Leaf-mucilage studies do not establish skin benefits for this flower powder."
      },
      {
        "question": "Can Hibiscus affect very light hair?",
        "answer": "Natural pigment may affect light, grey, bleached or porous hair and can mark fabric. Strand-test before use and protect clothing and surfaces."
      },
      {
        "question": "Does this powder make hair softer, shinier or easier to detangle?",
        "answer": "Softness, shine and slip are outcomes to test on the actual hair pack; they have not been established for this finished powder. Animal studies of leaf or flower extracts do not prove human hair regrowth from this powder."
      }
    ],
    "careAreas": [
      "Hair Care"
    ],
    "productType": "Botanical Hair Pack Powder",
    "description": "Hibiscus Flower Powder for Herbal Hair Packs. A floral ingredient for a botanical hair-pack routine. Net quantity: 200 g.\n\nChoose this flower powder as an ingredient for a traditional external-use hair pack. Prepare it fresh and follow the pack's application and rinse-out directions. Protect fabrics and test a strand before use on light or porous hair.\n\nSoftness, shine, slip and other conditioning outcomes require testing of the actual product. Research on leaf mucilage or Hibiscus sabdariffa tea does not establish benefits for this Hibiscus rosa-sinensis flower powder. Face and body packs remain a development option pending suitability and tolerance assessment.",
    "seoTitle": "Hibiscus Flower Powder for Herbal Hair Packs, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Hibiscus · Herbal Hair Packs · 200 g",
      "headlineFirst": "A floral pause.",
      "headlineMiddle": "A herbal hair pack.",
      "headlineItalic": "Care in bloom.",
      "description": "Hibiscus flower powder, a floral ingredient for a botanical hair-pack routine.",
      "badgeText": "Herbal hair pack",
      "badgeSubtitle": "Hibiscus flower powder · 200 g",
      "howToText": "Prepare and rinse according to the hair-pack directions. Test a strand before full application."
    }
  },
  {
    "slug": "indigo-powder",
    "name": "Indigo Powder",
    "botanical": "Indigofera tinctoria",
    "plantPart": "Leaf powder",
    "collectionNumber": "06",
    "subtitle": "Plant-based hair colour",
    "accent": "#283c75",
    "accentSoft": "#c9d0e7",
    "pricePaise": 49900,
    "compareAtPricePaise": 64900,
    "size": "200 g",
    "availability": "Preview catalogue",
    "shortDescription": "For a strand-tested botanical colouring routine.",
    "metaDescription": "NatureMist Indigo Leaf Powder, 200 g, for botanical hair colour. Read about shade variation, strand testing and the separate henna step some methods need.",
    "ingredient": "Indigo leaf powder (Indigofera tinctoria).",
    "featuredImage": {
      "url": "/images/indigo-powder.jpg",
      "altText": "NatureMist Indigo Leaf Powder 200 g jar",
      "width": 1000,
      "height": 1000
    },
    "benefits": [
      "Leaf powder for botanical hair colouring.",
      "A colour step guided by the product's preparation and application instructions.",
      "Strand testing helps preview the shade on your own hair."
    ],
    "howTo": [
      "Before colouring: Read the full pack directions and carry out the directed skin test before every use. Test a strand to check shade and hair feel.",
      "Preparation: Follow a suitable colouring method. Henna may be required and is not included in this six-product range; Amla is not a substitute. Wear gloves and mix exactly as directed.",
      "Hair colour: Apply and rinse using the mixing and processing times on the pack. Do not extend the time or add unlisted ingredients.",
      "After use: Rinse thoroughly, clean splashes and discard leftover mixed paste."
    ],
    "mixers": [
      "Water only, as directed on the pack",
      "A separately sourced henna step only when required by the tested colour method"
    ],
    "suitableFor": [
      "Scalp-hair colouring routines",
      "People familiar with henna-and-indigo preparation",
      "Users willing to skin-test and strand-test before colouring"
    ],
    "safety": [
      "For external use on scalp hair only. Do not use for skin masks, eyebrows or eyelashes.",
      "Carry out the directed skin test before every use; a clear test does not guarantee that a reaction cannot occur.",
      "Indigo alone may appear blue or green on light or grey hair. Strand-test before full application.",
      "Wear gloves. Avoid eyes, damaged or irritated scalp, inhalation of powder and contact with fabrics.",
      "Stop and rinse if irritation occurs. Do not use if you have reacted to this product before."
    ],
    "storage": "Keep airtight, cool and dry. Protect from humidity and direct light.",
    "texture": "Leaf powder; natural colour and texture can vary between batches.",
    "concerns": [
      "Botanical Colour"
    ],
    "ritualStep": "Colour",
    "experience": "Advanced",
    "colorConsiderations": [
      "Grey",
      "Blonde/Bleached",
      "Chemically Coloured"
    ],
    "searchTerms": [
      "indigo",
      "indigofera tinctoria",
      "leaf powder",
      "hair colour",
      "hair color",
      "plant-based colour",
      "botanical colouring routine",
      "strand test"
    ],
    "faqs": [
      {
        "question": "Will Indigo alone make grey hair black?",
        "answer": "Not reliably. Shade and grey coverage depend on the starting hair, mixture and colouring method. Indigo alone can look blue or green on light or grey hair. Check the method with a strand test; this listing does not guarantee jet black or complete grey coverage."
      },
      {
        "question": "Does Amla replace the henna step in an Indigo colour routine?",
        "answer": "No. Amla is a hair-pack ingredient, not a henna substitute. Some darker-shade methods require suitable henna, which is outside this six-product range. Keep a care pack separate and check colour compatibility."
      },
      {
        "question": "Why do I need both a skin test and a strand test?",
        "answer": "The skin test checks for a possible reaction according to the pack instructions, while the strand test previews the shade on your hair. Neither test should be skipped, and a clear skin test cannot guarantee that no reaction will occur."
      }
    ],
    "careAreas": [
      "Hair Colour"
    ],
    "productType": "Botanical Hair Colour",
    "description": "Indigo Leaf Powder for Botanical Hair Colour. For a strand-tested botanical colouring routine. Net quantity: 200 g.\n\nIndigo leaf powder has an established hair-colouring role. Final shade and grey coverage depend on the starting hair, preparation and colouring process. Follow the product's colour directions and test a strand before full application; no specific shade or coverage is guaranteed.\n\nSome darker-colour methods require a suitable henna step. Henna is outside this six-product range, and Amla or Hibiscus does not replace it. Use any separate hair pack only after checking colour compatibility.\n\nCarry out the directed allergy test before every use, wear gloves and keep the mixture away from eyes, eyebrows and eyelashes. Ingredient-level safety assessment is not product approval or a guarantee against reactions. Medicinal indigo naturalis is a different material and does not establish skin-treatment benefits for this leaf powder.",
    "seoTitle": "Indigo Leaf Powder for Botanical Hair Colour, 200 g | NatureMist",
    "formulation": "Single botanical powder",
    "hero": {
      "eyebrow": "Indigo · Botanical Hair Colour · 200 g",
      "headlineFirst": "Colour with care.",
      "headlineMiddle": "Know your shade.",
      "headlineItalic": "A botanical ritual.",
      "description": "Indigo leaf powder for a strand-tested botanical colouring routine, with realistic shade expectations.",
      "badgeText": "Hair colour",
      "badgeSubtitle": "Indigo leaf powder · 200 g",
      "howToText": "Read the full colour directions. Skin-test and strand-test before every use."
    }
  }
];

export const ritualGoals = [
  "Cleanse",
  "Hair Packs",
  "Skin Care",
  "Scalp Ritual",
  "Botanical Colour",
] as const;

export type RitualGoal = (typeof ritualGoals)[number];

export function matchesRitualGoal(product: Pick<Product, "concerns" | "ritualStep" | "careAreas">, goal: RitualGoal | "Softness + Shine" | "Resilient-Feeling Hair") {
  if (goal === "Skin Care") return product.careAreas?.includes("Skin Care") ?? false;
  if (product.concerns.some((concern) => concern.trim().toLowerCase() === goal.toLowerCase())) return true;
  const step = goal === "Cleanse" ? "Cleanse"
    : goal === "Hair Packs" ? "Pack"
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
    description: "Reetha and Shikakai for the wash step, with Amla as a separate herbal hair pack.",
    slugs: ["reetha-powder", "shikakai-powder", "amla-powder"],
  },
  {
    id: "softness-luster",
    name: "Hair-Pack Collection",
    description: "Amla, Hibiscus and Bhringraj for a dedicated botanical hair-mask routine.",
    slugs: ["amla-powder", "hibiscus-powder", "bhringraj-powder"],
  },
  {
    id: "botanical-cabinet",
    name: "The Botanical Cabinet",
    description: "Six botanicals for herbal hair washes, traditional hair packs and dedicated Indigo hair colour.",
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
