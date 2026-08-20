export function getPublicSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const candidates = [configured, vercelHost ? `https://${vercelHost}` : null];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin;
      }
    } catch {
      // The setup guide documents the required absolute URL format.
    }
  }

  return "http://localhost:3000";
}
