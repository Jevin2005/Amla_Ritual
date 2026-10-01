// Test resolution logic for all products and new listings
function getCanonicalProductSlug(title, handle) {
  if (!title) return (handle || '').toLowerCase().trim();

  let clean = title
    .toLowerCase()
    .replace(/^naturemist\s+/i, '')
    .replace(/\s+(100%|pure|organic|herbal|natural|jar|250g|100g|500g)\b/gi, '')
    .trim();

  let slug = clean
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    slug = (handle || 'product')
      .toLowerCase()
      .replace(/^naturemist-/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return slug;
}

function matchesProductSlug(candidate, product) {
  if (!candidate || !product) return false;
  const c = candidate.toLowerCase().trim().replace(/^\/?shop\//, '').replace(/^-+|-+$/g, '');
  const slug = (product.slug || '').toLowerCase();
  const shopifyHandle = (product.shopifyHandle || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  // 1. Exact match with canonical slug or shopify handle
  if (c === slug || c === shopifyHandle) return true;

  // 2. Normalize "naturemist-" prefix
  const cNoBrand = c.replace(/^naturemist-/i, '');
  if (cNoBrand === slug || cNoBrand === shopifyHandle) return true;

  // 3. Name slug match
  const nameSlug = getCanonicalProductSlug(name, shopifyHandle);
  if (c === nameSlug || cNoBrand === nameSlug) return true;

  // 4. Distinctive keyword match
  const extractTokens = (s) => s.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !['naturemist', 'powder', 'pure', 'organic', 'hair'].includes(w));
  const cTokens = extractTokens(c);
  const nameTokens = extractTokens(name);
  if (cTokens.length > 0 && nameTokens.length > 0 && cTokens.some(t => nameTokens.includes(t))) {
    return true;
  }

  return false;
}

// Sample Catalog from Shopify
const catalog = [
  { name: "NatureMist Amla Powder", shopifyHandle: "amla", slug: "amla-powder" },
  { name: "NatureMist Reetha Powder", shopifyHandle: "wildcrafted-amla-powder", slug: "reetha-powder" },
  { name: "NatureMist Indigo Powder", shopifyHandle: "reetha-powder", slug: "indigo-powder" },
  { name: "NatureMist Bhringraj Powder", shopifyHandle: "bhringraj-powder", slug: "bhringraj-powder" },
  { name: "NatureMist Hibiscus Powder", shopifyHandle: "hibiscus-powder", slug: "hibiscus-powder" },
  { name: "NatureMist Shikakai Powder", shopifyHandle: "indigo-powder", slug: "shikakai-powder" },
  // Brand new listing added tomorrow in Shopify:
  { name: "NatureMist Brahmi Powder", shopifyHandle: "naturemist-brahmi-powder", slug: "brahmi-powder" },
];

console.log("=== Testing Slug Resolutions ===");
const testUrls = [
  "amla-powder",
  "amla",
  "reetha-powder",
  "wildcrafted-amla-powder",
  "indigo-powder",
  "shikakai-powder",
  "bhringraj-powder",
  "hibiscus-powder",
  "brahmi-powder",
  "naturemist-brahmi-powder",
  "brahmi"
];

for (const url of testUrls) {
  const match = catalog.find(p => matchesProductSlug(url, p));
  console.log(`URL: /shop/${url.padEnd(25)} -> Resolved Product: "${match ? match.name : 'NOT FOUND'}" (Shopify Handle: ${match?.shopifyHandle})`);
}
