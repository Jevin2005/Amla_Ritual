# How to Stop AI & Search Engines from Showing `checkout.naturemist.shop`

## Why This Happens

When you connect a domain or subdomain like `checkout.naturemist.shop` to Shopify for headless checkout:
1. **Shopify serves its default Online Store theme** on `https://checkout.naturemist.shop/`.
2. Shopify automatically generates a sitemap at `https://checkout.naturemist.shop/sitemap.xml` containing all products and collections.
3. **Web crawlers & AI bots** (like OpenAI GPTBot, Perplexity, Googlebot, and Bing) crawl `checkout.naturemist.shop`, detect the demo Shopify theme, and treat it as your official store.
4. As a result, when people ask AI or search Google, AI links to the unstyled Shopify demo page at `checkout.naturemist.shop` instead of your custom Next.js app (`www.naturemist.shop`).

---

## 2-Minute Fix in Shopify Admin

Follow these simple steps in Shopify Admin to permanently de-index `checkout.naturemist.shop` and redirect any visitor to your Next.js app.

### Step 1: Add Redirect & `noindex` to Shopify's Theme

1. In **Shopify Admin**, go to **Online Store → Themes**.
2. Click the **...** button (Actions) next to your active theme → select **Edit code**.
3. Under the `layout/` folder, open **`theme.liquid`**.
4. Just below the `<head>` tag (near the top of the file), paste this snippet:

```html
{%- comment -%} ========================================================
  HEADLESS STOREFRONT REDIRECT & AI/SEARCH DE-INDEXATION
  Redirects all browsing traffic to the Next.js storefront (www.naturemist.shop)
  and completely blocks search engines and AI from indexing this Shopify theme.
======================================================== {%- endcomment -%}

<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">

<script>
  (function() {
    var path = window.location.pathname;
    
    // Allow actual checkout and essential account/cart endpoints
    var isAllowedPath = 
      path.indexOf('/checkouts') === 0 ||
      path.indexOf('/cart') === 0 ||
      path.indexOf('/account') === 0 ||
      path.indexOf('/orders') === 0 ||
      path.indexOf('/challenge') === 0 ||
      path.indexOf('/services') === 0;

    if (!isAllowedPath) {
      var targetBase = 'https://www.naturemist.shop';
      
      // If someone visits /products/amla-powder, redirect to /shop/amla-powder
      if (path.indexOf('/products/') === 0) {
        var handle = path.replace('/products/', '');
        window.location.replace(targetBase + '/shop/' + handle);
      } else if (path.indexOf('/collections') === 0) {
        window.location.replace(targetBase + '/shop');
      } else if (path === '/' || path === '') {
        window.location.replace(targetBase);
      } else {
        window.location.replace(targetBase + path);
      }
    }
  })();
</script>
```

5. Click **Save**.

---

### Step 2: Block Crawlers in Shopify `robots.txt`

1. Still in **Shopify Admin → Online Store → Themes → Edit code**.
2. Under **Templates**, check if you have a file called `robots.txt.liquid`.
   - If not, click **Add a new template** → choose **robots.txt** → click **Done**.
3. Replace its contents with:

```liquid
# Disallow all search engines and AI crawlers from indexing the Shopify theme
User-agent: *
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /
```

4. Click **Save**.

---

### Step 3: Verify Shopify Domain Settings

1. In **Shopify Admin**, go to **Settings → Domains**.
2. Verify that:
   - Your primary storefront domain (`naturemist.shop` or `www.naturemist.shop`) points to your Next.js hosting (e.g. Vercel, Cloudflare, etc.).
   - Only `checkout.naturemist.shop` points to Shopify.
   - Domain redirection inside Shopify does not attempt to redirect your main domain.

---

## What We Already Updated in the Next.js Storefront

1. **`robots.ts`**:
   - Added explicit crawl permissions for AI search engines (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Amazonbot`, `Bingbot`).
   - Fixed the sitemap URL to be an absolute RFC-compliant URL (`https://www.naturemist.shop/sitemap.xml`).
   - Set canonical host to `https://www.naturemist.shop`.

2. **`layout.tsx`**:
   - Added `alternates: { canonical: "./" }` so all search engines know the true home domain.
   - Added enhanced `googleBot` directives (`max-image-preview: large`, `max-snippet: -1`).
   - Added global JSON-LD Structured Data for **Organization** and **WebSite** linking `naturemist.shop` to your brand identity.

3. **Product Page (`shop/[slug]/page.tsx`)**:
   - Updated **Product JSON-LD** schema to use absolute canonical URLs (`https://www.naturemist.shop/shop/[slug]`).
   - Ensures AI and search engines identify your Next.js app as the single source of truth for products, pricing, and availability.
