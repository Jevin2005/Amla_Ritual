async function checkShopifyProducts() {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) throw new Error("Set SHOPIFY_ADMIN_ACCESS_TOKEN before running this script.");
  const domain = 'zyv78m-p7.myshopify.com';
  const res = await fetch(`https://${domain}/admin/api/2024-01/products.json?limit=50`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Total Shopify Products in Store:', data.products?.length);
  for (const p of data.products || []) {
    console.log(`ID: ${p.id} | Handle: "${p.handle}" | Title: "${p.title}" | Status: ${p.status}`);
  }
}
checkShopifyProducts();
