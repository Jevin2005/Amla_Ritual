# Product listing audit — 17 September 2026

The homepage collection, shop grid, wishlist and related-product cards use the shared Shopify catalog. Hero enable/order fields affect hero slides only; they do not hide ordinary listings.

| Source | Website use |
| --- | --- |
| Product title and handle | Display name and working product link |
| Product media | Listing photo, alternate image and detail gallery |
| Variant price and availability | Price, comparison price and purchase availability |
| custom.subtitle / custom.net_quantity | Card subtitle and pack quantity |
| custom.ritual_step | Ritual label, step filters and matching recommendations |
| custom.concerns | Goal filters and recommendations |
| custom.collection_number | Numeric catalog order, e.g. 2 before 10 |
| custom.botanical_name / plant_part / ingredient / formulation | Saved product facts |
| custom.benefits / how_to_use | Saved benefit and preparation lists |

Products without a featured image use their own gallery image, then a neutral placeholder. They never inherit Amla's photograph. Lists trim whitespace and separate bullet-delimited benefits/instructions without splitting commas inside sentences. Goal filters recognize saved Cleanse, Condition and Colour steps; other goals require an explicit matching concern. Renamed handles cannot override saved ritual data or point botanical benefit links at the wrong named product.

## Live verification

Amla, Reetha and Indigo are published to **My Store Headless**. Their listing and product-detail data agree for name, subtitle, size, botanical, ingredient, formulation, plant part, benefits, preparation, ritual step and price. All three have product images. Prices currently returned by Shopify: Amla ₹234, Reetha ₹325 and Indigo ₹350.

Following the request to show all six products, Bhringraj, Hibiscus and Shikakai were published to **My Store Headless**. The website's live Shopify loader now returns all six products, all six product-detail lookups succeed, and six complete hero slides qualify. Current prices for the newly connected products are Bhringraj ₹400, Hibiscus ₹450 and Shikakai ₹400. Prices and product content were not changed by this publication fix.

After Vercel refreshed its stale cache, both `https://naturemist.shop/shop` and the public homepage returned HTTP 200 and rendered links to all six current product handles. This product-count fix is live and required no application deployment. The separately known `www.naturemist.shop` certificate mismatch still exists.

Some saved Shopify content also needs merchant review:

- Reetha hero caption: `Shikakai PowderReetha Powder`.
- Bhringraj first preparation step begins `ConditionMix`.
- Hibiscus botanical name begins `ame Hibiscus`.
- Shikakai subtitle begins `Hair-colour ritualTraditional`; its saved ritual step is `Colour` despite cleansing copy.

The app preserves these authored values instead of silently rewriting them. Hero copy does not replace product listing facts.

## Checks and deployment

137 automated tests pass, including rendered product-card checks, live-data mapping, renamed-handle recommendations and catalog order. Next and Vinext production builds pass. Changed files have no ESLint errors; the existing checkout image warning remains. Full-project lint also has the previously identified WebGL-hook error. Sandboxed prerender cannot fetch Shopify; live catalog/detail matching was verified separately with read-only requests.

Deploy these changes through the existing website hosting project. Saved product changes can take approximately five minutes to refresh without authenticated cache-invalidation webhooks.
