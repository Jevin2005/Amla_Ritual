// Server-only: never return credentials to the browser or include them in logs.
let cached: { key: string; token: string; expires: number } | undefined;

export function adminDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!domain || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) throw new Error("Configure SHOPIFY_STORE_DOMAIN with the store's myshopify.com domain.");
  return domain;
}

export async function getAdminToken() {
  const domain = adminDomain();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const secret = (process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_APP_SECRET)?.trim();
  // Client-credentials tokens expire daily. Renew instead of preferring a stale env token.
  if (clientId && secret) {
    const key = `${domain}:${clientId}:${secret}`;
    if (cached?.key === key && cached.expires > Date.now()) return cached.token;
    const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ client_id: clientId, client_secret: secret, grant_type: "client_credentials" }),
    });
    if (!response.ok) throw new Error(`Shopify app authentication failed (${response.status}). Check the app credentials and installation for this store.`);
    const data = await response.json();
    if (typeof data.access_token !== "string" || !data.access_token) throw new Error("Shopify returned no Admin access token.");
    const lifetime = Number(data.expires_in);
    cached = { key, token: data.access_token, expires: Date.now() + (Number.isFinite(lifetime) ? Math.max(0, lifetime - 120) : 0) * 1000 };
    return cached.token;
  }
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN?.trim();
  if (!token) throw new Error("Shopify Admin credentials are not configured.");
  return token;
}

export async function requireOrderAccess() {
  const token = await getAdminToken();
  const response = await fetch(`https://${adminDomain()}/admin/oauth/access_scopes.json`, {
    headers: { "X-Shopify-Access-Token": token }, cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401) cached = undefined;
    throw new Error(`Shopify order authentication failed (${response.status}).`);
  }
  const data = await response.json();
  if (!data.access_scopes?.some((scope: { handle: string }) => scope.handle === "write_orders")) throw new Error("The installed Shopify app needs write_orders access.");
  return token;
}
