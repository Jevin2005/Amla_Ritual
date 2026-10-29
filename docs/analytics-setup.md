# NatureMist analytics: local implementation and pending activation

Updated 28 October 2026. The user supplied GA4 Measurement ID `G-YF3CVLWVHG`; it is saved in the ignored local environment file, with tracking activation still off. Shopify's native cookie banner and footer preferences link are implemented locally; banner settings are saved in Shopify for India only, at bottom center. The new cookie/analytics code has not been deployed. The official Google & YouTube app is installed with the user's explicit approval, but its GA4 setup is incomplete and Shopify shows its pixel as disconnected. No custom pixel has been connected. The existing Shopify checkout flow was separately released on 26 October, as recorded in `shopify-checkout-setup.md`. Existing page design/layout is preserved. This is prepared integration code, **not a claim that live reporting is complete**.

The native Shopify dashboard now has five saved sections and 18 cards, with Last 90 days selected. GA4's three exact storefront/checkout domains have been saved and verified after reopening. The Google app setup now loads, but its Google account chooser stalled after account selection and reload; the account/property is still not linked. See [the latest verification report](analytics-verification-report.md) for detailed dashboard, report and live-check evidence.

## What Shopify can show

| Metric | Source and status |
| --- | --- |
| Orders, financial/payment status, sales, revenue, refunds, stock | Shopify is authoritative; existing hosted checkout creates the orders. Browser tracking is not needed to create these records. |
| Average order value and top products by sales | Shopify sales reports; use consistent date, currency, sales-channel and refund definitions. |
| Website visits/sessions, product views, added-to-cart sessions and conversion | Official Hydrogen analytics events are prepared with the native consent runtime. Reporting still requires activation, the correct Headless token/channel and successful receipt/report validation. Do not assume reports include Vercel traffic today. |
| Checkout starts/completions and abandoned checkouts | Shopify hosted checkout and available Shopify reports. An abandoned checkout usually requires customer contact information; it is not every abandoned cart. |
| Cart removals, cart views and search | The current Shopify SDK supports native events, and local adapters are prepared alongside GA4. Event support does not guarantee a dedicated dashboard card; actual receipt and report coverage remain pending. |
| Traffic sources, visitor locations and device categories | Shopify's current native reports/schema support these breakdowns. Coverage for this custom storefront and campaign attribution remain to be verified; GA4 is a separate reporting destination. |
| New versus returning customers | Shopify's purchase-history-based customer reports. These are not new versus returning website visitors; visitor analysis stays separate in GA4 unless a supported native visitor dimension is verified. |
| List impressions, item selection and detailed event funnels | GA4 implementation is pending activation. Do not invent Shopify events or claim that every frontend event has a native report/card. |
| Successful payment | Shopify order financial status/transactions. `checkout_completed` can include pending/COD orders and is not a payment-settlement notification. |

Completed-purchase verification remains pending. The merchant originally deferred it and now requests a safe Shopify-approved test while preserving payment configuration and inventory. A read-only Shopify check on 27 October returned older orders attributed to NatureMist Backend and Headless, including paid, pending and test records. Those records establish existing integration history, but they do not verify the 26 October checkout flow or reconcile sales-report totals against payment receipts. No new order or payment is created by analytics setup.

A read-only ShopifyQL sales report on 28 October returned 5 orders and INR 1,899 total sales over the last 90 days, all under **NatureMist Backend**. This confirms that Shopify's sales reports contain records for that channel; it does not prove current headless visitor reporting, payment settlement, or GA4 delivery. Query: `FROM sales SHOW total_sales, orders GROUP BY sales_channel SINCE startOfDay(-90d) UNTIL today ORDER BY total_sales DESC LIMIT 10`.

Shopify stays the main business dashboard. Its native overview was customized and saved on 28 October with **Sales (5 cards), Customers (5), Conversions (3), Products (2), and Marketing (3)**, using **Last 90 days**. No separate dashboard application or database was introduced. Card availability does not prove that the custom website supplies every metric. The [verification report](analytics-verification-report.md) records the latest source totals and coverage limits. **Every GA4 event cannot be made into a Shopify report by pushing a dataLayer object.**

## Code and event ownership

- `frontend/src/features/analytics/`: typed commerce mapping, consent-gated Google tag and official Shopify SDK adapter, route/cart bridge, product visibility hooks.
- Cart mutations measure accepted before/after quantities, including quantity changes and clear-cart; hydration, refresh, discounts, failed requests and no-op mutations do not generate additions. Preview catalogue events are suppressed.
- If a mutation finishes before the saved cart has been restored, its analytics is suppressed because the prior quantities are unknown. This prevents old persisted lines being counted as fresh additions. Concurrent cross-tab cart changes still need live validation.
- Product cards track impressions when at least 25% intersects the viewport. One item may be sent per list event; use item counts, not event count, to count impressions. Product detail and combo-detail views include the selected option. Product ID is the common local item ID across catalogue and cart; variant title is separate. Matching the official checkout app's item IDs still requires received-event verification.
- The 28 October click-coverage follow-up adds consent-gated product selections in `product-card.tsx`, `botanical-combos.tsx`, `combo-preview.tsx`, `previous-product-hero.tsx`, and `product-hero.tsx`. Preview openings and product links retain their existing behavior; the new hooks use the existing filtered tracker.
- `checkout_handoff` belongs to the validated storefront handoff, not arrival at the local review page. It measures an attempt to leave; it does not prove Shopify loaded. The official Google & YouTube app will own standard `begin_checkout` on Shopify checkout arrival and `purchase` on checkout completion, avoiding two standard checkout starts for one transition.
- `view_cart` belongs to the visible hydrated drawer or `/checkout` cart summary, once per viewing after a pending mutation settles. Drawer and checkout-summary visits have distinct viewing contexts. Per-destination acknowledgements retain a pending Shopify view when Google has already succeeded. Shopify receives a sanitized confirmed cart snapshot when available; an empty cart can generate a native cart view. Empty bags do not send GA ecommerce items.
- Both the Shop-page search and search dialog measure settled results after 600ms, including zero results. Only exact catalogue names/slugs/ritual labels are sent; other text is `[redacted]`. Destination acknowledgements let a late Shopify connection receive the current search without repeating Google's event. Query changes/closing discard pending old results. Search selection is a distinct event.
- The current `@shopify/hydrogen` runtime replaces `hydrogen-react`. Native page/product/cart/search view events use its public bus; confirmed cart snapshots use `trackCartAnalytics` for additions/removals. The SDK manages delivery and consent. Product views carry the selected Shopify variant ID and vendor from the product detail data, even when the smaller global catalogue contains only the default variant. Internal Shopify metadata is omitted from Google event fields. No undocumented collection endpoint is implemented.
- Query-only route changes are observed using an internal page key; published URLs still omit the query. Page and product impression deduplication tracks actual destinations, so a temporarily missing Shopify bus does not consume an event or duplicate a Google event already sent.
- The script loader and analytics bridge share one validated configuration. Disabling the master switch or omitting valid exact hostnames prevents loading the Shopify analytics destination. Shopify reporting does not require a Google measurement ID. Both analytics switches remain off in the current environment.
- `docs/analytics/shopify-checkout-pixel.js` is a **superseded, disconnected draft**, not storefront code or an approved activation path. Use the official Google & YouTube app for hosted checkout and purchase events. No storefront purchase/refund emitter exists.

## Cookie consent implemented; reporting activation pending

See [cookie-consent-setup.md](cookie-consent-setup.md) for the completed integration and validation limits. The native Shopify banner and footer preferences link work without GA4 or a paid consent app. The shop ID now comes from the configured store's own Storefront API response, never an unrelated connected-store default. Both known Shopify domains resolve to shop 77712916666; this project's configured hostname is amla-ritual.myshopify.com.

Before a separately authorized release enables analytics:

1. Inventory Settings > Customer events, Google & YouTube, and other analytics apps to avoid duplicate senders.
2. Confirm the production Storefront token's intended Headless sales channel. Keep private tokens server-only.
3. For an authorized production release, set NEXT_PUBLIC_ANALYTICS_ENABLED=true, NEXT_PUBLIC_SHOPIFY_ANALYTICS_ENABLED=true, NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-YF3CVLWVHG, and NEXT_PUBLIC_ANALYTICS_HOSTS=naturemist.shop,www.naturemist.shop in the production hosting environment before building. The local environment now holds the supplied ID and exact hosts, but both activation flags remain false. There is no separate manual shop-ID setting.
4. Verify consent and session continuity on the actual HTTPS storefront and returned checkout URL. Local cookies cannot prove cross-domain checkout behavior.
5. Check real Shopify event receipt and reports. Do not represent local automated tests as live reporting validation.

The bridge listens to consentTrackingApiLoaded and visitorConsentCollected. Shopify's permission API takes precedence over the legacy optional CMP bridge. No historic unconsented cart actions are replayed.

## GA4 ID configured; activation remains pending

The supplied ID `G-YF3CVLWVHG` was verified in the signed-in Google Analytics UI: account **NatureMist**, property **NatureMist Website** (`561023415`), web stream **NatureMist Website** (`16214154295`), URL `https://naturemist.shop`. Google still reports **No data**. This is a public ID; never use an API secret in NEXT_PUBLIC variables. Use the same stream for checkout when that integration is connected and tested. The implementation uses Google's direct tag, not a second GTM sender.

Enhanced Measurement was turned **off** on 28 October 2026 after the user explicitly approved the external setting change. The saved switch was verified as off after refreshing the stream details; see [confirmation screenshot](analytics-evidence/ga4-enhanced-measurement-off.jpg). Google still lists standard page views with Enhanced Measurement off. The prepared website code also sets `send_page_view: false`, so manual route events own page views and sanitized URL fields when activated. Disabling Enhanced Measurement removes its browser-history and other automatic collectors; automatic search/form/outbound collection could otherwise expose unreviewed fields. Ads storage, user data, personalization and Google signals remain denied/disabled in the prepared integration. The Google tag loads only after analytics permission. Test revocation as well as initial denial. This settings change does not deploy the website or activate tracking; Google still reported no website data received.

### Shopify checkout connection selected on 28 October

Use **Google LLC's official Google & YouTube app** as the single GA4 hosted-checkout/purchase sender. Google's current guidance states that Google tags inside Shopify custom pixels are unsupported. Keep the custom draft disconnected and retain its `__GA4_MEASUREMENT_ID__` marker. Do not add a second purchase sender.

The user explicitly approved the official app's requested access to customer/owner contact details, device/browsing data, all past/future orders, products, checkout and analytics, including viewing Shopify Payments disputes. **Google & YouTube was installed successfully on 28 October 2026.** The initial stale installation screen returned an error; a fresh installation flow succeeded. Shopify's Manage app page confirms installation and an active app channel, while **Pixels remains Disconnected**; see [installed app evidence](analytics-evidence/google-app-installed.jpg). The earlier [permission screen](analytics-evidence/google-app-permissions.jpg) records the reviewed scope.

Earlier on 28 October, the Google setup displayed Connect Google account and then loaded blank; Open app, reload and a fresh Shopify tab initially did not recover it. In the later follow-up, the setup **loaded successfully**, but the Google OAuth account chooser stalled after account selection and a reload. The GA4 property/tag has **not** been linked, and live events have **not** been verified. No new Google OAuth permissions or Google service terms were accepted. Resume the account-linking step; do not reinstall the already installed app or activate the unsupported custom pixel as a workaround.

When account linking can continue, select the GA4-only setup and connect the existing NatureMist Website stream `G-YF3CVLWVHG`. Google documents a manual Google-tag option if account linking is unavailable; no manual app tag has been saved as part of this follow-up. Merchant Center, Google Ads, campaigns and product feeds are not required for this task. Verify the actual app connection and event receipt before changing this status to connected. A Shopify app cannot activate the undeployed Next.js tracking code on the external storefront.

The official app owns `begin_checkout`, shipping/payment and `purchase` events on supported Shopify surfaces. The external storefront owns its page/product/search/cart events and the distinct `checkout_handoff` event. Verify actual product/variant IDs in received app events before claiming that item-level funnels join correctly; the documentation does not guarantee the app uses the storefront's current product-GID item IDs.

The superseded draft's local tests do not validate the official app. Its review also found incomplete handling of discounted/multiple-delivery shipping, reinforcing that it must not be activated as a completed integration. The draft remains only as an inactive record; do not treat its order-GID transaction IDs or event names as the official app's mapping. No webhook retry sender is enabled that could double count purchases.

## Refunds remain authoritative in Shopify

There is no client `refund` trigger. GA4 refund export remains pending. If later requested, use verified Shopify refund records with order ID matching the official purchase sender, refunded items/quantities and actual currency/value. A production webhook path needs raw-body HMAC verification, shop/topic checks, durable idempotency keyed by refund ID (not just order ID), retries, stored permitted GA client attribution, and separate handling of partial refunds. Do not repurpose the existing catalogue-cache webhook or use a browser refresh to synthesize refunds. This local work does not add a refund export service.

## Cross-domain and attribution limits

The storefront and checkout share the registrable domain `naturemist.shop`, but same registrable domain does **not** prove GA session continuity. The official app and external storefront must be checked in one consented session.

On 28 October, GA4 Admin → Data streams → Google tag settings → Configure your domains was saved with exact domain matches for **`naturemist.shop`**, **`www.naturemist.shop`**, and **`checkout.naturemist.shop`**. Reopening the settings verified all three entries. Add another checkout host only if actual observed checkout navigation requires it. Configure unwanted payment referrals only for observed legitimate payment hosts. Saving domain rules does not prove session linking.

The app preserves Shopify's exact returned checkout URL and performs its original validated programmatic navigation. Google automatic linker decoration may not apply to `location.assign`. **Cross-domain continuity is pending and unverified**, not implemented by a fabricated `_gl` parameter or by sending checkout tokens to Google. Do not claim a joined funnel until a controlled session confirms it. The tag-settings panel was blank during the earlier attempt; the later saved/reopened domain verification supersedes that configuration blocker, without verifying runtime continuity.

Application-published measurement URLs strip query strings, hashes and unknown paths. Shopify-hosted standard-event/performance scripts own additional browser context; inspect their live behavior before enabling reporting. The inactive checkout draft uses a fixed generic checkout path. This limits exposure of checkout keys, email, phone and arbitrary free text. **UTM and click-ID handling remains unverified**: do not assume the SDK or hosted checkout preserves campaign context through another path, or that saved domain settings resolve it. Source reporting and paid campaign continuity need live verification and a reviewed campaign strategy. Basic sanitized referring origins remain available on storefront events. Do not equate GA attribution or consent-filtered counts with Shopify financial totals.

## Reporting and acceptance after a future release

In Shopify compare the Headless channel's sessions, product views and added-to-cart/converted sessions where supported, against controlled consented visits. Confirm orders, financial status, refunds, INR amounts and stock in Shopify directly. Verify the store timezone (India) and exclude staff/test traffic.

When GA4 is ready, create a **Funnel exploration** with session-scoped steps: `page_view` → `view_item` → `add_to_cart` → `view_cart` → `checkout_handoff` → `begin_checkout` → `purchase`. Optional steps should account for Buy Now bypassing the drawer. Use Sessions/Users and sessions containing each step, not raw click counts. Cart-to-checkout rate = sessions reaching checkout / sessions adding an item. Purchase conversion = purchasing sessions / measured sessions. AOV = purchase revenue / distinct transaction IDs; reconcile against Shopify using the same net/gross/refund definitions. Inspect item ID/name/category, device category, and session source/medium. Non-conversion is an abandonment indicator, not proof that a customer failed to pay.

Acceptance checklist (pending; do not mark complete using unit tests):

- No optional analytics delivery or analytics storage before permission; grant/revoke across storefront and checkout. Review existing third-party apps separately.
- One page view per route visit including browser back; one visible product impression, no off-screen/preloaded impressions.
- Accepted single/multi-add quantities, clamped stock, +/− quantity, remove and clear; failed mutation sends nothing.
- One validated `checkout_handoff` per attempt. Invalid/changed cart never triggers it. The official app owns standard `begin_checkout` on actual Shopify arrival.
- Shipping/payment submissions only on those events; failed payment/click/redirect never emits purchase.
- One purchase for a real Shopify order through the official app; repeat completion callbacks, refresh and back do not produce another transaction. Check pending/COD versus paid status separately.
- Currency/value, discounts, tax, shipping, product IDs and item quantities reconcile with Shopify. No buyer fields, full cart keys or raw checkout URL in payloads.
- Shopify native receipt and admin report population verified after reporting delay; GA4 DebugView/Realtime confirmed when provisioned.
- Same GA client/session across the actual checkout path, including Razorpay return, before asserting cross-domain attribution.

## Local verification

Local verification on 27 October: the complete Node test suite passes (575 tests), TypeScript passes, changed-file ESLint passes, and the Next.js production build passes. The build used existing fallback catalogue/review handling because this sandbox could not fetch those services. Full-project ESLint has pre-existing `react/display-name` errors and an unused-variable warning in `frontend/tests/home-review-performance.test.mjs`. No existing CSS or layout styles were changed. The authorized Cookie settings button uses the existing footer link styling.

After saving the real GA4 ID, all 28 analytics/consent/checkout-pixel tests passed again. An isolated no-network smoke check loaded the local settings and confirmed the actual ID is used for the one consented tag and event destination, localhost and denied consent load no Google script, and revocation suppresses further events. Activation remained false in the local settings. No synthetic events were sent to the user's Google property.

Follow-up verification on 28 October: 44 focused analytics, consent and checkout tests, TypeScript, scoped ESLint and the production build pass. Regression tests first reproduced lost Shopify cart/search events and now cover current-search-only retries, no duplicated Google events, separate drawer/summary views, and reserving standard checkout/payment/purchase events for the official app. The sandbox build used existing catalog/review fallbacks when upstream fetches were unavailable. No design/layout changes, deployment or environment activation changes were made.

Later click-coverage follow-up on 28 October: the five-component patch passed 44 focused tests, TypeScript, scoped ESLint and `git diff --check`. A final production build after this patch also passed, including all 33 static pages; existing Shopify catalog/Judge.me fallbacks were used because upstream requests were unavailable in this environment. A live product/cart/checkout-handoff check passed without submitting an order or payment, and the original one-item bag was restored. These checks do not verify analytics delivery, app linking, refunds, campaign attribution or completed purchases. See [analytics-verification-report.md](analytics-verification-report.md) for the latest evidence and remaining actions.

The separate Shopify component validator could not start because its plugin directory lacks the `typescript` package. Installed SDK types were checked successfully by the project's TypeScript compiler; this is not represented as a successful external validator run. Network delivery, Shopify report population, checkout sandbox behavior, paid-order reconciliation and cross-domain attribution remain unverified.

## Sources

- [Shopify headless channels and reporting](https://shopify.dev/docs/storefronts/headless/overview)
- [Hydrogen analytics and consent](https://shopify.dev/docs/storefronts/hydrogen/analytics)
- [Hydrogen request handling](https://shopify.dev/docs/storefronts/hydrogen/request-handlers)
- [Shopify Customer Privacy API](https://shopify.dev/docs/api/customer-privacy)
- [Pixel consent](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy)
- [Checkout completion semantics](https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed)
- [Shipping submission availability](https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_shipping_info_submitted)
- [Shopify custom-pixel setup and sandbox limitations](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/gtm-tutorial)
- [GA4 ecommerce schema](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Google cross-domain measurement](https://developers.google.com/tag-platform/devguides/cross-domain)
- [Google's supported Shopify tagging and custom-pixel limitations](https://support.google.com/google-ads/answer/15642481?hl=en)
- [Official Google & YouTube GA4 setup](https://support.google.com/analytics/answer/12183125?hl=en)
- [Official app Shopify event mapping](https://developers.google.com/tag-platform/gtagjs/reference/shopify-event-parameters)
