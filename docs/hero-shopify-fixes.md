# Homepage and Shopify fixes — 17 September 2026

## Where to make future edits

- **Content → Metaobjects → Homepage hero:** product link, poster, background, GLB model, headline, description, captions, slide order and duration. Use Active/Draft to show or hide an entry.
- **Products → Metafields:** subtitle, botanical name, plant part, net quantity, formulation, ingredients, benefits and preparation instructions.
- **Content → Metaobjects → Storefront content → Homepage settings:** slideshow and animation controls.
- Product fields labelled **Legacy** are archived backups. Their descriptions now point to the active hero editor; their values do not change the website.

## Saved in Shopify

The Wildcrafted Amla hero entry now uses Amla in its headline, description and caption, with the linked product's saved `250g Jar` quantity. Its product link and three media references were preserved. Reetha's Ingredient field now reads `Reetha fruit-shell powder.` without the editing instruction. All 13 old homepage product fields were labelled Legacy, kept unpinned, and given directions to the current editor. A subsequent read confirmed these changes.

## Application behavior after deployment

Saved hero headlines take priority over design defaults. Formulation appears in the existing Ingredient clarity panel. Product facts come from Shopify, with no sample ingredients, benefits, quantities or preparation instructions substituted when fields are blank. Fractional prices retain their decimals, and the hero does not make an unconditional tax-included claim.

Shopify cart failures remain failures: the app preserves the authoritative cart and checkout link, displays the error, and does not replace it with a successful local preview cart. An old initial cart response cannot overwrite a newer update, and the server confirms expiry before replacing a cart. Product-page purchases use the selected variant's own stock and price; Buy Now stops when the add fails. Preview carts remain available only in preview mode. Wishlist remains stored in the customer's browser; customer-account wishlist synchronization is a separate feature.

The Website animations switch governs automatic hero and model motion. Cursor controls govern decorative model movement. Fade, slide and none have distinct behavior; none disables the hero's Shery effects. The layout and unfiltered backgrounds are retained.

The product-detail page also uses Shopify's formulation and SEO copy and omits empty fact sections. The ritual finder uses its existing no-match state instead of recommending an unrelated first product.

## Verification completed

- All **129 tests** passed with `node --test tests/*.test.mjs` from `frontend`, including network failures, Shopify validation errors, expiry checks, hydration races, non-default variants, saved copy, sparse product data and animation controls.
- ESLint passed for every changed TypeScript component/module and every new test.
- Both `npm run build:site` and `npm run build` passed; the Next build completed TypeScript validation. The site build retains its existing large-chunk warning.
- A read-only run of the repaired loader against live Shopify returned three products and two complete hero entries, with corrected Amla/Reetha text, their actual formulations, quantities, prices, media references and slide timing.
- The sandboxed build could not contact Shopify during prerendering, so its safe empty-data behavior was exercised. The separate live-loader verification used the authenticated Storefront connection successfully.

## Hosting actions still required

The code changes need deployment through the existing Vercel project. The connected ChatGPT Site is a separate, restricted publication with no custom domains; it is not the Vercel production host and was not changed.

The domain check on 17 September found:

- `https://naturemist.shop/` responded successfully from Vercel.
- `www.naturemist.shop` already resolves through `cname.vercel-dns.com`.
- HTTPS for `www.naturemist.shop` fails hostname validation because the certificate presented covers only `naturemist.shop`.

In the Vercel project serving `naturemist.shop`, open **Settings → Domains**, add or repair `www.naturemist.shop`, and complete any ownership verification Vercel requests. Wait for the hostname and certificate to become valid. Use the DNS values shown by that project; do not replace the existing working records without a specific requirement. The domain's authoritative nameservers are at GoDaddy.

After both HTTPS hostnames work, configure a redirect to the chosen primary domain and make the production `SITE_URL` match it. The local configuration currently selects `https://www.naturemist.shop`. A redirect alone cannot repair a certificate error because TLS validation happens before the redirect.

See Vercel's [custom-domain setup](https://vercel.com/docs/domains/set-up-custom-domain) and [certificate troubleshooting](https://vercel.com/kb/guide/domain-not-generating-ssl-certificate). No authenticated Vercel CLI or browser session was available during this repair, so hosting settings and production deployment were not changed.

## Final storefront check after deployment

1. Confirm both Amla and Reetha slides show the matching product name, caption, image, model, price and quantity.
2. Change a headline in the Homepage hero editor and allow approximately two minutes for it to refresh; product fields may take five minutes.
3. Add a product, update its quantity and remove it. Confirm the checkout link reflects the same Shopify bag. A failed request must show an error without showing “Added.”
4. Confirm the global animation switch stops decorative motion, and the hero transition setting supports fade, slide and none.
5. Open both public HTTPS hostnames and confirm the canonical URL uses the selected primary host.

No order or payment was created as part of this repair.
