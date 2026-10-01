async function queryStorefront() {
  const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (!token) throw new Error("Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN before running this script.");
  const domain = 'amla-ritual.myshopify.com';
  const query = `{
    products(first: 20) {
      nodes {
        id
        handle
        title
      }
    }
  }`;

  const res = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': token,
    },
    body: JSON.stringify({ query }),
  });

  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Products from Shopify Storefront API:');
  for (const p of json.data?.products?.nodes || []) {
    console.log(`Handle: "${p.handle}" -> Title: "${p.title}"`);
  }
}
queryStorefront();
