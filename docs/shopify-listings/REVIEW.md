# NatureMist product listing review

Review date: 11 September 2026. Store: zyv78m-p7.myshopify.com.

The intended range is six separate powders: Amla, Reetha, Shikakai, Bhringraj, Hibiscus and Indigo. Their descriptions and search listings are proposed in `draft-catalog.json`. The drafts need actual selling specifications before publication.

## Existing products: identity must be resolved

| Shopify record | Existing price | Existing stock | What the record contains | What is needed |
| --- | --- | --- | --- | --- |
| [Amla, ID 8494763311290](https://admin.shopify.com/store/zyv78m-p7/products/8494763311290) | INR 234 | 1,000 | Original title `amla`; description `amla powe very nice`; photo of an unlabelled white jar; no product detail fields | Confirm this is a real separate item, net weight, ingredient declaration, directions and correct packaging image |
| [Wildcrafted Amla Powder, ID 8498815107258](https://admin.shopify.com/store/zyv78m-p7/products/8498815107258) | INR 325 | 99 | Title, ingredient and directions refer to Amla; quantity says 250g Jar; all four gallery images show Shikakai Powder, 200 g | Confirm whether this record should sell Amla 250 g or Shikakai 200 g, and whether it duplicates the first item |

Prices and stock above are recorded Shopify values, not independently verified physical stock or approved pricing.

The second description contains escaped HTML wrapped in code-editor markup. Its saved ritual step is also the entire choice list (`Condition, Cleanse, or Colour`) instead of one value. Its description, images, ingredient, size, directions and ritual step must all describe the same product. Do not carry Amla preparation instructions into a Shikakai listing.

The original two products and saved product fields are backed up in `shopify-before-2026-09-11.json`. Existing handles should be retained until any URL migration and review links are handled deliberately.

## Product details to supply

For each sellable product, provide:

1. Exact product name, pack type and net weight; separate size variants if available.
2. Selling price and actual stock for each variant; genuine compare-at price only when applicable.
3. Complete ingredient declaration from the final label, including botanical identity and plant part where used.
4. Final preparation, application, rinse and frequency instructions; label precautions and storage guidance.
5. Current product/label photographs, including front, back and net quantity. Confirm any AI-generated pack artwork matches the product customers receive.
6. Existing SKU/barcode, shipping weight and pack dimensions where available.

Local preview prices, 250 g image alt text, ingredients and application timings are not approved specifications. No certifications, origin, processing method, purity percentage or treatment claims should be introduced from the preview catalogue.

## Customer-facing content structure

Each draft has an individual title, short introduction, product role, preparation section, selection guidance and search title/description. Use pack-approved instructions to replace generic preparation copy before launch. Keep pending business facts in this review sheet rather than publishing placeholders in the customer description.

For each product gallery, use a clear front pack image, readable back label, powder texture view and relevant usage image. Alt text should describe what is actually visible. The unlabelled jar is insufficient for customers to verify the Amla pack; Shikakai-labelled images must not illustrate an Amla listing.

## Website issues found during the review

These are separate implementation findings; no application code was changed as part of this listing work.

| Location | Customer effect | Required correction |
| --- | --- | --- |
| `frontend/src/lib/shopify/storefront.ts`, around line 794 | Missing live fields can inherit sample product ingredients, sizes, directions and suitability through title matching | Keep missing live values empty or neutral and use approved Shopify product facts |
| `frontend/src/lib/shopify/storefront.ts`, around line 860 | Shopify SEO description is fetched but not used | Prefer Shopify SEO description before neutral fallback |
| `frontend/src/app/shop/[slug]/page.tsx`, around line 62 | Search title forces `100% Pure Botanical` rather than Shopify SEO title | Use the saved product SEO title and avoid unsupported purity text |
| `frontend/src/app/shop/[slug]/page.tsx`, around line 243 | Every product displays `Shade-Dried Powder` | Display the actual saved formulation, if confirmed |
| Product detail page | Ingredient declaration and product-specific safety/colour guidance are not displayed | Show the approved fields where customers choose and use the product |

## Verification before a product goes live

- Match the product title, images, ingredients, net weight and selected variant.
- Verify price, inventory tracking, shipping data and availability.
- Confirm the individual product page displays the approved description, ingredients and directions.
- Check mobile layout, variant selection, add-to-cart and checkout handoff.
- Publish only completed products to the intended sales channels and market.

Creating drafts does not make products available for purchase. See `RESULTS.md` for the exact changes performed in Shopify during this session.
