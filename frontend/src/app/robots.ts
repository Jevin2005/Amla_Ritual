import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/wishlist", "/track-order", "/api/"],
      },
      {
        // Explicitly permit AI search engines (ChatGPT, Perplexity, Gemini, Claude, Copilot)
        // to crawl and index your official Next.js storefront
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
          "Amazonbot",
          "Bingbot",
        ],
        allow: [
          "/",
          "/shop",
          "/shop/*",
          "/rituals",
          "/our-story",
          "/faqs",
          "/reviews",
          "/contact",
          "/shipping-returns",
        ],
        disallow: ["/checkout", "/wishlist", "/track-order", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}


