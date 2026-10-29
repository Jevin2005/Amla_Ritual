# NatureMist Shopify checkout setup

Prepared on 25 October 2026. Checkout branding was saved in the Shopify editor during this implementation, as recorded below. Other configuration and release checks remain pending unless explicitly marked verified.

## Production update — 26 October 2026

The frontend is now deployed at `https://naturemist.shop` through the existing Vercel project `amla-ritual-frontend`. Commit `0fe622eff6370951c0f84fc38dcdc0ca9e17e3c7` simplifies checkout to a compact order card with one secure-checkout button, editable items, a collapsed discount field, and estimated totals. The large hero and repeated explanatory text were removed. This was a one-time deployment; no deployment schedule or automation was created.

Vercel reported success for deployment `6ZrAysmcWJmcFbjy1uMK2zUYqBSZ`. Live checks returned HTTP 200 for the homepage, checkout and catalog API; the checkout HTML contains the new layout without the previous heading. All four retired custom payment/order endpoints returned HTTP 410 with `CHECKOUT_RETIRED`. TypeScript, scoped ESLint, the production build with live Shopify data, and all regression tests passed. Desktop and 390px mobile previews were checked; a temporary one-item cart reached branded Shopify checkout and browser Back restored the button. The test cart was cleared without an order or payment.

Shopify theme publication remains separate and pending: live theme is still Horizon `156107178170`; the original prepared draft `160824033466` remains unpublished. A newer unpublished copy `160851624122` was found on 26 October. Neither draft was published in this release. Real payment, shipping, inventory deduction and confirmation-email testing remain pending. The historical preparation notes below describe the state before this deployment.

## Implementation and release status

- **Implemented locally:** Shopify checkout is the only payment flow. The bag is refreshed immediately before navigating to Shopify's unchanged checkout URL; changed prices/items require another review. Empty, unavailable, over-stock, preview, and failed-refresh carts cannot proceed. Duplicate clicks are locked and returning with the Back button restores the button. The former Razorpay and direct Shopify order endpoints return HTTP 410 without reading credentials or creating payments/orders.
- **Saved live in Shopify:** NatureMist logo, colors and fonts listed below. Verified with a real Storefront cart opened from the local website: one Amla Powder, INR 234, correct item and price, no password screen. Browser Back returned to the new review page with its button enabled. The test bag was then cleared; no order or payment was submitted. Desktop checkout and Shopify's mobile preview were inspected. [Screenshot](shopify-checkout-evidence/branded-checkout.png).
- **Prepared, not published:** [NatureMist checkout-only storefront](https://admin.shopify.com/store/zyv78m-p7/themes/160824033466/editor), theme ID `160824033466`, role `UNPUBLISHED`. Its layout and snippet were read back from Shopify and matched the local files exactly. See `docs/shopify-checkout-draft/`. Shopify accepted both files without errors. The original live theme backup is in `docs/shopify-checkout-backup/theme.liquid`.
- **Release order:** deploy the frontend changes first, then publish the prepared theme from Shopify Online Store > Themes. The draft sends `/cart` to the main site's `/checkout`, so the new frontend must be live first. The production frontend has not been deployed in this session. The existing live theme still has its original broader `/cart` exemption.
- **Access limitation:** the Shopify connector cannot publish or edit the live theme. The Shopify code editor repeatedly failed to load and its embedded editor crashed in the browser, so the redirect was prepared and verified in an unpublished draft instead.
- **Verification:** all 523 app tests passed, followed by 22 redirect behavior tests. TypeScript, scoped checkout ESLint, and the Next.js production build passed. The local build emitted upstream catalog/review fetch warnings under restricted network access; live catalog and checkout handoff worked in the browser. Full-project ESLint still reports pre-existing errors in `tests/home-review-performance.test.mjs`. Shopify's packaged Liquid validator could not run because `@shopify/theme-check-common` is missing; the behavior tests, Shopify file acceptance, and exact readback checks passed.
- **Still unverified:** completed/declined payments, actual shipping eligibility and fees, payment-to-order settlement, stock deduction after purchase, order email, and refunds. The configured Shopify checkout currently offers Razorpay Secure; this is Shopify's configured provider, not the retired direct website integration. Shopify's display name/title is still `My Store`.

Customers browse and manage their bag on `https://naturemist.shop`, then use the cart's fresh Shopify `checkoutUrl` to pay. Shopify manages payment, shipping calculation, order creation, and inventory according to the merchant's configured rules. Shopify-hosted product, collection, search, and cart pages should return visitors to the main website.

## Domains and storefront access

- Keep `naturemist.shop` and `www.naturemist.shop` on the Next.js host. Keep `checkout.naturemist.shop` connected to Shopify with a valid certificate. Check Shopify's domain settings and the actual returned checkout URL before changing primary-domain behavior.
- Use the entire `checkoutUrl` returned by Shopify, including its query parameters. Do not replace its host, rebuild it from a cart ID, log it publicly, or drop its query string. The official guide currently shows `/cart/c/<token>`; `/checkouts/` is also used during checkout. Cart token formats are not a stable application contract. [Shopify cart guide](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- Request checkoutUrl when the customer clicks checkout, rather than trusting a persisted old URL. For authenticated buyer identity, Shopify requires the buyer-IP header on server-side Storefront requests to preserve logged-in checkout. Only forward a client IP supplied by a trusted hosting proxy. [Shopify cart guide](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- An active subscription with checkout enabled is required. **Pause and Build, store deactivation, and private/password mode do not implement public checkout with private theme browsing.** Shopify documents that private mode prevents visitors from completing orders and Pause and Build disables checkout. [Shopify closing options](https://help.shopify.com/en/manual/online-store/shopify-vacation-setting)
- Theme redirects are navigation controls, not a server access-control boundary. They do not prevent direct access to every Shopify JSON endpoint, resource, sitemap, or alternate layout. `noindex` is a search-engine instruction, not a guarantee of removal from results. Do not describe this configuration as a completely inaccessible Shopify store.

## Install the browsing redirect

Use [shopify-checkout-only.liquid](shopify-checkout-only.liquid) as the theme snippet `snippets/naturemist-checkout-only.liquid`. The active theme was backed up to `docs/shopify-checkout-backup/theme.liquid`. Remove the previous broad redirect block, and render this snippet once near the beginning of the `<head>` in `layout/theme.liquid`. Keep Shopify's required `content_for_header` and `content_for_layout` intact.

This is a theme-head snippet, not checkout code. Do not put it in checkout UI extensions, checkout scripts, or the Next.js application. The repository file is a deployment artifact; copying it here alone does not change the live theme.

The redirect:

| Shopify route | Behavior |
| --- | --- |
| `/` and ordinary pages/blogs | Return to `https://naturemist.shop` |
| `/products/<handle>` and `/collections/<collection>/products/<handle>` | Return to `/shop/<handle>` on the main website |
| `/collections/...` and `/search` | Return to `/shop` on the main website |
| `/cart` or `/cart/` | Return to `/checkout` on the main website |
| `/cart/c/<token>` | Preserve the Shopify checkout handoff and all query parameters |
| `/checkout`, `/checkouts/...` | Preserve Shopify checkout |
| Account, authentication, order-status, policy, challenge and service routes | Preserve essential Shopify behavior |

The current locale prefix is removed only for classification; preserved URLs are never rewritten. Theme editor previews bypass navigation so the merchant can edit the theme. Verify the live site separately because this preview intentionally does not show redirect behavior. Non-JavaScript browsers get a main-site meta refresh on ordinary theme browsing pages. Unknown browsing routes return to the main homepage rather than being copied into a likely broken main-site URL.

This replaces the overly broad `/cart` allowance in the older domain-redirect guide. Preserving all paths starting with `/cart` would expose the standalone Shopify cart. Conversely, redirecting `/cart/c/` would break the Storefront API checkout handoff. Avoid wildcard redirects at a DNS proxy or domain level because they can also break checkout, payment return URLs, order status, and login.

For stronger suppression of theme content, a reviewed minimal headless theme can omit product/collection/cart presentation entirely. That remains separate from protecting Shopify's public resource endpoints; do not disable the sales channel or remove product publication without checking which channel supplies the current Storefront token.

## Match the website branding

Open Shopify **Settings > Checkout > Configurations > Edit** for the active configuration. Standard logo, color, and typography settings are available on Basic or higher. Advanced Checkout Branding API customization and app blocks in information/shipping/payment require Shopify Plus. Theme CSS does not restyle hosted checkout. [Shopify customization availability](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations)

The following settings were **saved in Shopify's active checkout editor** during implementation. They use the existing NatureMist logo, typography, and palette from `frontend/src/app/globals.css`:

| Element | Website value |
| --- | --- |
| Logo | Existing NatureMist logo, centered, 200 px |
| Main and header background | `#FFFCF5` |
| Order summary background | `#F5F1E8` |
| Buttons and header accent | `#153B2D` |
| Links | `#527744` |
| Heading family | Playfair Display |
| Body family | Plus Jakarta Sans |

Both requested font families were available and selected. Review the saved configuration on desktop and mobile. Shopify controls the structural checkout layout, so an exact copy of the Next.js form is not promised. Header background-image settings have changed; use current supported settings in the editor. [Shopify checkout styling](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style)

Review branding on checkout, Thank you, and Order status. Check the logo link, return-to-cart link, and Continue shopping link using a real fresh cart. Links that return to the Shopify theme root/cart will pass through the theme redirect; the theme snippet cannot directly change links rendered inside hosted checkout.

## Required merchant settings

1. Configure an available payment provider inside Shopify. Direct Razorpay credentials used by the old Next.js popup do not configure Shopify's payment gateway.
2. Configure India shipping zones, supported delivery locations, rates, and taxes. Match the published policy: the current policy says INR 80 below INR 999 and free shipping from INR 999. Verify discount and tax treatment of the threshold in checkout.
3. Verify product inventory tracking, correct fulfillment location, and the "continue selling when out of stock" choice. Check component inventory for any bundle products rather than assuming ordinary variant stock covers bundles.
4. Verify the order confirmation sender, fulfillment notices, refund process, legal policies, contact details, and delivery estimates.
5. Shopify must hold the discount rules that customers are promised. A discount calculated only in the browser is not a Shopify checkout discount. Check each displayed coupon and automatic offer against Shopify.
6. Keep storefront sales-channel publication and the Storefront token working. Restrict standalone browsing through the theme, without accidentally removing the catalog from the headless website.

## Release checks

- A fresh cart reaches Shopify checkout without a password screen, redirect loop, empty cart, or missing items.
- Successful, declined, abandoned, and retried payments behave correctly; a completed payment corresponds to one paid order.
- Shipping, taxes, coupon acceptance, total, stock reduction, and order email are correct. Test a last-unit item and the exact free-shipping threshold.
- The main site's old Razorpay/payment verification/custom order creation URLs cannot create or confirm orders.
- Refresh/back navigation preserves the main bag appropriately. Returning to the storefront after a completed checkout does not cause paid products to be purchased again unintentionally.
- Shopify root, products, collections, search and `/cart` return to the main website. `/cart/c/`, checkout, login, policy links, challenge, payment return, and order status remain functional on desktop and mobile.
- Test the active theme outside Shopify's editor, including a locale-prefixed URL and a browser with JavaScript disabled.
- Verify one full refund through the configured gateway and check the resulting Shopify order state and stock decision.

Do not treat local unit tests or a successful redirect as proof of settlement, stock deduction, live shipping eligibility, or refund reconciliation. Record those results only after completing the corresponding end-to-end test.
