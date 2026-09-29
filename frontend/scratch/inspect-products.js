async function inspectAllProducts() {
  const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (!token) throw new Error("Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN before running this script.");
  const domain = 'amla-ritual.myshopify.com';
  const query = `{
    products(first: 20) {
      nodes {
        id
        handle
        title
        productType
        tags
        description
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

  const json = await res.json();
  for (const p of json.data?.products?.nodes || []) {
    console.log('-------------------------------------------');
    console.log('ID:', p.id);
    console.log('Handle in Shopify:', p.handle);
    console.log('Title in Shopify: ', p.title);
    console.log('Product Type:     ', p.productType);
    console.log('Tags:             ', p.tags);
    console.log('Description start:', (p.description || '').slice(0, 100));
  }
}
inspectAllProducts();
