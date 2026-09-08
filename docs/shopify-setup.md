# Shopify handoff for NatureMist

The website is a headless Shopify storefront: the existing Next.js design stays in place, while Shopify Admin owns products, variants, pricing, inventory, collections, product media, promotional posters, discounts, carts, and checkout.

Until Shopify credentials are configured, the site intentionally serves the original six-product preview catalog. No secret is committed to the repository.

## Frontend-only Vercel preview (no keys)

No custom environment variables are required to deploy the frontend preview. In Vercel, set the project Root Directory to `frontend`, leave the Output Directory empty, and remove any incomplete `SHOPIFY_*` variables. The application will use its bundled preview catalog and browser-local preview cart. Vercel's system-provided production domain is used for canonical metadata and the sitemap when `SITE_URL` is absent.

Add Shopify variables only when both `SHOPIFY_STORE_DOMAIN` and either `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` or `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are ready. Keep `SHOPIFY_STRICT_MODE=false` during setup.

## 1. Create the Storefront API connection

1. In Shopify Admin, install/open the **Headless** sales channel.
2. Create a storefront and a **private Storefront access token**.
3. Enable these Storefront API permissions:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_metaobjects`
   - `unauthenticated_read_content` (required for Shopify Navigation menus)
   - `unauthenticated_write_checkouts` (required for Storefront carts and checkout URLs)
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_product_inventory`
4. Publish every sellable product and variant to the Headless channel and the required markets.
5. Copy `frontend/.env.example` to `frontend/.env.local` for local work, then set:

```dotenv
SITE_URL=https://www.your-storefront-domain.com
SHOPIFY_STORE_DOMAIN=store-name.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=the_headless_private_storefront_token
SHOPIFY_STOREFRONT_API_VERSION=2026-07
SHOPIFY_DEFAULT_COUNTRY=IN
SHOPIFY_DEFAULT_LANGUAGE=EN
SHOPIFY_WEBHOOK_SECRET=the_webhook_signing_secret
```

Use the hosting provider's encrypted environment settings in production. Never add the private token to a `NEXT_PUBLIC_` variable.

The API version is deliberately pinned to `2026-07`; review Shopify's quarterly release notes before changing it.

## 2. Product and variant data

Manage these with Shopify's native product editor:

- product title, handle, description, vendor, product type, tags, and status
- product and variant media, including meaningful alt text
- options and variants
- SKU, barcode, price, compare-at price, and inventory
- product availability and publishing
- collection membership and product SEO

The first available variant is used for quick-add buttons. The product page presents a variant selector when a product has multiple variants. Shopify remains authoritative for stock, discount validity, totals, taxes, shipping, and checkout.

## 3. NatureMist product metafields

Create the following **Product** metafield definitions in namespace `custom`. Give the definitions Storefront read access.

Use the [product entry form](product-entry-form.md) as the merchant-facing checklist. Pin the definitions in the listed order so Shopify's product editor becomes the exact content form used by the website layout.

| Key | Suggested type | Purpose |
| --- | --- | --- |
| `botanical` | Single-line text | Botanical name |
| `plant_part` | Single-line text | Plant part/form |
| `collection_number` | Single-line text | Display order/ritual number |
| `subtitle` | Single-line text | Product card subtitle |
| `accent` | Color | Product accent colour |
| `accent_soft` | Color | Soft background colour |
| `size` | Single-line text | Display format/size label |
| `availability_label` | Single-line text | Optional custom availability copy |
| `short_description` | Multi-line text | Short merchandising description |
| `meta_description` | Multi-line text | Optional SEO fallback |
| `ingredient` | Multi-line text | Ingredient statement |
| `benefits` | List of single-line text | Benefit bullets |
| `how_to` | List of single-line text | Ordered preparation steps |
| `mixers` | List of single-line text | Suggested mixers |
| `suitable_for` | List of single-line text | Suitability bullets |
| `safety` | List of single-line text | Safety bullets |
| `storage` | Multi-line text | Storage guidance |
| `texture` | Single-line text | Texture description |
| `concerns` | List of single-line text | Listing/ritual filters |
| `ritual_step` | Single-line text | `Cleanse`, `Condition`, or `Colour` |
| `experience` | Single-line text | `Beginner`, `Familiar`, or `Advanced` |
| `color_considerations` | List of single-line text | Hair-colour cautions |
| `search_terms` | List of single-line text | Extra storefront search words |
| `faqs` | JSON | Array of `{ "question": "…", "answer": "…" }` |

When Shopify is connected, deleted or empty metafields stay empty or use a neutral product-derived label; the original preview claims are never substituted into a live product. Complete every customer-facing and safety field before publishing.

Homepage content is managed separately under **Content → Metaobjects → Homepage hero** (`homepage_hero`). Product creation requires no homepage fields. Only Active entries with a published product, GLB model, poster and background appear. Legacy `custom.hero_*` fields are unpinned and retained only as a backup. See [Homepage hero editor](homepage-hero-admin.md).

## 4. Site content, page posters, and announcement bar

Create a merchant-owned metaobject definition with:

- type: `storefront_content`
- Storefront access: `PUBLIC_READ`
- publishable capability: enabled

Create one published entry with handle `main` and these fields:

| Key | Type |
| --- | --- |
| `announcement_text` | Single-line text |
| `announcement_link_label` | Single-line text |
| `announcement_link_url` | URL |
| `home_hero_poster` | File reference, restricted to images |
| `ritual_poster` | File reference, restricted to images |
| `story_poster` | File reference, restricted to images |

Upload/choose the images through Shopify Files and add useful alt text to each image. `ritual_poster` and `story_poster` control their named page posters. The existing `home_hero_poster` remains the site social-preview fallback; visible homepage hero posters come from the separate `homepage_hero` entries. Metaobject content is refreshed within two minutes even if no webhook reaches the active runtime.

## 5. Collections, listings, and ritual sets

- Publishing or archiving products controls whether they appear on the storefront.
- Shopify collections attached to a product are returned with the listing data and can be used for merchandising/search language.
- To display a collection as a homepage ritual set, create a **Collection** metafield `custom.display_as_bundle` of type Boolean and set it to `true`.
- Arrange the products inside that collection in Shopify Admin. The site's “add the ritual” control adds the first available variant of every available product in the set.
- For inventory-aware, separately priced bundles, prefer Shopify Bundles and publish the resulting bundle product instead of using a multi-product ritual set.

## 6. Cart, discounts, and checkout

The website uses Shopify's Storefront Cart API. The full Shopify cart ID is stored only in a secure, HTTP-only cookie because it contains a secret. It is never placed in browser storage, analytics, or a public URL.

- quick-add and product-page actions send Shopify variant IDs
- quantities and removals use Shopify cart line IDs
- discount codes use Shopify `cartDiscountCodesUpdate`
- displayed totals come back from Shopify
- payment, shipping, taxes, and final validation happen in Shopify's hosted checkout

Do not replace this with the retired Checkout API or collect card details in the Next.js application.

## 7. Navigation and policies

- Create/update Shopify Navigation menus with handles `main-menu` and `footer`. The desktop and mobile storefront navigation use `main-menu`; footer groups use the nested items in `footer`.
- Product menu URLs are translated from Shopify's `/products/{handle}` format to this storefront's `/shop/{handle}` routes.
- Maintain Privacy Policy, Terms of Service, Shipping Policy, and Refund Policy in Shopify Admin under Policies. When connected, the matching website pages render Shopify's current policy text automatically.

## 8. Webhooks and cache refresh

Create HTTPS webhooks that point to:

```text
https://YOUR-STOREFRONT-DOMAIN/api/shopify/webhooks
```

The Headless sales channel does not create webhook subscriptions. Create a Shopify app in the Dev Dashboard (or use an existing Admin API app), subscribe it to product, collection, metaobject create/update/delete topics and `inventory_levels/update`, and set `SHOPIFY_WEBHOOK_SECRET` to that app's **client secret**. The route verifies `X-Shopify-Hmac-SHA256` against the raw request body before invalidating the public storefront cache. No Admin API access token is needed by this website.

On native Next.js hosting with a shared data cache, the tag invalidation is immediate. The included Sites/Cloudflare adapter currently falls back to Vinext's per-isolate memory cache, so the cross-isolate guarantee is the normal two-minute content or five-minute catalog TTL. For globally immediate invalidation on Cloudflare, provision a Workers KV namespace and configure Vinext's `kvDataAdapter` before launch.

Cart and checkout requests are never cached.

### Supported commerce model

The storefront supports one-time purchases, Shopify's standard options/variants, and Shopify Bundles published as products. Selling plans/subscriptions and advanced variant quantity rules (minimums, increments, or volume pricing) need an additional storefront implementation and must not be enabled until that flow is tested end to end.

## 9. Launch checklist

- Replace preview prices, sizes, and imagery with verified Shopify product data.
- Confirm every intended Homepage hero entry is Active and has a published product, GLB model, poster and background.
- Test every variant, sold-out state, quantity change, discount, market/currency, and checkout on a test order.
- Confirm shipping profiles, taxes, payments, email receipts, fulfilment, returns, and legal policies in Shopify.
- Add the production domain to the Headless storefront and Shopify checkout/domain configuration.
- Register webhooks and verify that a product or poster edit appears on the live site.
- Keep `SHOPIFY_STRICT_MODE=false` during setup to leave the shell available with an empty live catalog when Shopify catalog data fails, while optional content areas degrade independently. Set it to `true` for launch: runtime Shopify catalog/content/collection/policy failures then throw, and all four Shopify policies are required. Production builds use the safe fallback so a temporary Shopify outage or unpublished policy cannot block deployment. Preview products are served only when Shopify is completely unconfigured.

Reference: [Shopify Storefront API setup](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started), [Cart API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart), and [metaobjects](https://shopify.dev/docs/apps/build/metaobjects).

## 10. Everyday store management

- **Add or edit a product:** Shopify Admin → Products. Use the pinned NatureMist fields and the [product entry form](product-entry-form.md).
- **Feature or remove a product in the homepage hero:** Content → Metaobjects → Homepage hero. Choose a product, upload its model, poster and background, then set the entry Active. Use Draft to hide it. Normal product listings remain independent. See [Homepage hero editor](homepage-hero-admin.md).
- **Change the Rituals/Our Story poster or site social fallback:** Shopify Admin → Content → Metaobjects → Storefront content → `main`. Choose a new image from Shopify Files and save.
- **Change the announcement:** edit the same `main` metaobject entry.
- **Change header/footer links:** Shopify Admin → Content → Menus; edit `main-menu` or `footer`.
- **Create a ritual set:** create/reorder a collection, enable its `custom.display_as_bundle` value, and publish its products to Headless.
- **Run a promotion:** create the discount in Shopify. The website sends the code to Shopify and shows Shopify's calculated total.
- **Publish a written or video review:** follow the [review management guide](review-management.md). Use either Shopify metaobjects or the local approved-review file, and always enter the exact Shopify product handle.
- **Hide a product:** unpublish it from Headless or change it to Draft. Do not delete it simply to hide it.
- **Process orders, refunds, inventory, fulfillment, taxes, shipping, and payments:** use Shopify Admin; these are never managed in the website code.
- **Check an update:** allow two minutes for posters/menus and five minutes for catalogue changes if immediate webhook refresh is unavailable.

Reviews are never invented by the storefront. Published `customer_review` and `video_review` metaobjects (or merchant-approved local review entries) power the home page, `/reviews`, the matching product page, and exact-product card ratings. Public customer submission, automatic purchase verification, moderation, and review structured data still require a connected review provider or a dedicated authenticated backend.
