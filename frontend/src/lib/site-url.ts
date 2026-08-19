export function getPublicSiteUrl() {
  const configured = process.env.SITE_URL?.trim();

  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin;
      }
    } catch {
      // The setup guide documents the required absolute URL format.
    }
  }

  return "http://localhost:3000";
}
