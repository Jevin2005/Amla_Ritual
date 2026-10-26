async function inspectCombos() {
  const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const domain = 'amla-ritual.myshopify.com';
  const query = `{
    products(first: 20, query: "tag:combo") {
      nodes {
        id
        handle
        title
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        description
      }
    }
  }`;
  const res = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  for (const p of data.data?.products?.nodes || []) {
    const numericId = p.id.split('/').pop();
    const incMatch = p.description.match(/What is included([\s\S]*?)How to use/);
    const included = incMatch ? incMatch[1].trim() : '';
    console.log(`${numericId} | ${p.handle} | ${p.title} | ₹${p.priceRange?.minVariantPrice?.amount} | ${included.replace(/\s+/g, ' ').slice(0, 100)}`);
  }
}
inspectCombos();
