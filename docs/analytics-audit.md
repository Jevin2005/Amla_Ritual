# NatureMist analytics audit — 26 October 2026

Initial findings, recorded before implementation. Scope: repository source, routes, tests, configuration and existing operational documents; read-only connected shop identity. No deployment or visual changes authorized.

## Existing implementation

- Next.js 16.3 / React 19.2, App Router, Storefront API pinned to 2026-07. Production products and cart totals come from Shopify. A separate preview catalogue exists.
- `features/store/store-provider.tsx` owns cart state. `/api/cart` delegates to `/api/shopify/cart`. The complete cart ID stays in an HttpOnly, same-site cookie; localStorage cart persistence is only for preview. Wishlist uses localStorage.
- `/checkout` refreshes and validates the cart, checks exact allowed checkout hosts, then redirects to Shopify's returned URL. Preserve this architecture and its stock/price checks. Direct Razorpay/order routes are retired. A handoff is not a purchase.
- `track()` dispatches `naturemist:analytics` and optionally pushes arbitrary objects into an existing dataLayer. No Google tag, GTM loader, analytics consent manager, or Web Pixels extension/configuration is present in source.
- No page/product/list impressions. Existing add/remove/cart/checkout events lack recommended GA4 items. Multi-item additions report requested counts, not actual accepted deltas. Quantity changes and clear-cart removals are missing.
- Search fires only on result clicks, conflating search with selection. Combo preview fires `begin_checkout` before the actual checkout handoff, risking duplicate starts.
- No purchase/refund measurement. The authenticated Shopify webhook route only invalidates the catalogue cache; it is not an order/refund analytics receiver.
- No URL scrubbing or explicit field allowlist. Generic future payload forwarding and automatic page collection could expose query-string PII or checkout tokens.
- No verified cross-domain setup or GA4 property configuration. Existing checkout domain is `checkout.naturemist.shop`; connected store identity matches NatureMist, INR. Admin identity: `gid://shopify/Shop/77712916666`, `zyv78m-p7.myshopify.com`.

## Reporting limits and proposed ownership

Shopify remains authoritative for orders, financial status, revenue, refunds and stock. A browser checkout-completed event does not prove settlement; COD/pending orders must be assessed in Shopify.

Use the documented Hydrogen React analytics utility for headless page/product context and accepted additions only. Do not invent Shopify event names or call private collection endpoints. Headless sales-channel attribution depends on the actual Storefront token/channel setup and reports must be verified after activation.

GA4 owns the richer browsing funnel. A single checkout pixel owns shipping/payment/purchase. No storefront purchase emitter. No browser refund emitter. Refunds require authoritative records and a durable deduplicated server integration or controlled import.

The Admin WebPixel query is app-scoped, not an inventory of merchant custom pixels or other apps. Source inspection cannot prove the absence of installed pixels. Customer Events and Google & YouTube app configuration require a separate merchant-side inventory before activation.

## Constraints

Keep design/layout and checkout behavior intact. New code must render no UI, default to no collection without consent/configuration, exclude preview data, use actual currency/accepted quantities, and isolate analytics failures from purchases. Live dashboard receipt, checkout sandbox behavior and attribution cannot be certified by local tests. Preserve pre-existing checkout documentation and screenshot changes.

## Documentation reviewed

- https://shopify.dev/docs/api/hydrogen-react/latest/utilities/sendshopifyanalytics
- https://shopify.dev/docs/api/customer-privacy
- https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
- https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/gtm-tutorial
- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- https://developers.google.com/tag-platform/devguides/cross-domain
- Local Next.js guides: analytics, scripts and use-client.

Shopify's newer Hydrogen analytics runtime was also reviewed. This existing Next.js app will use the independently documented Hydrogen React utility rather than migrate frameworks. Shopify documents custom pixels but does not provide implementation support for them.


## Authorized consent follow-up

The subsequent request authorized a native Shopify cookie banner and footer preferences link while preserving the existing page layout and prohibiting deployment. The implementation now uses @shopify/hydrogen 2026.10.2 (including its Next.js-compatible React scripts and server session handling); the original hydrogen-react choice above is superseded. The shop ID is derived from the actual configured store. Shopify banner regions were saved as India only, as explicitly requested. See cookie-consent-setup.md for current scope and verification.

## Shopify data connection follow-up, 27 October

The merchant left the completed-purchase check pending and asked to connect the available website data to Shopify. Local changes now fix non-default product variant views, share the analytics configuration between the script loader and event bridge, include confirmed cart snapshots for drawer/checkout-summary views, track query-only navigation without exposing query values, and prevent missing destinations from consuming product/page events. The website design is unchanged. All 575 tests, TypeScript, changed-file lint and the production build pass. Analytics switches, GA4 setup, production release and live receipt/report verification remain pending; no claim is made that every event becomes a Shopify report.

## GA4 connection follow-up, 28 October

The verified stream is NatureMist Website (`G-YF3CVLWVHG`). Its ID is saved locally, with both analytics activation flags still false. Enhanced Measurement was restored to the user-approved off setting and verified after refresh. GA4 reported no recent data. No website deployment occurred.

Google's current documentation requires the official Google & YouTube app for supported Shopify Google-tag measurement; the previous custom pixel proposal is superseded and remains inert. The initial Shopify inventory showed no Google app/pixel, only Judge.me Reviews under Customer events. The user then explicitly approved the new sensitive-data access and the Google & YouTube app was installed successfully. Shopify's Manage app page confirms the app is active but its pixel remains disconnected. The embedded setup panel loaded blank after initially displaying Connect Google account; reload, Open app and a fresh tab did not restore it. No Google account/property has been linked. Do not mark Shopify-to-GA4 connected before stream connection and verification. Google tag domain settings also remain unconfigured because their separate embedded panel loaded blank.

Read-only Shopify sales reporting returned 5 orders and INR 1,899 total sales in the last 90 days under NatureMist Backend. This validates the existence of historical sales reports, not live traffic measurement or settlement reconciliation.

The local follow-up fixes missing Shop-page search tracking, missing cart/search delivery when Shopify becomes ready after Google, and cart drawer-to-checkout view deduplication. The storefront event is now `checkout_handoff`; the Google app owns standard `begin_checkout`, shipping/payment and `purchase`. Both search surfaces use privacy-filtered settled queries. These changes do not alter layouts or checkout navigation. Current validation and activation gates are recorded in [analytics-setup.md](analytics-setup.md).

## Dashboard and verification follow-up, later 28 October

This update supersedes the earlier blank-panel blockers above. GA4 domain settings were saved with exact matches for `naturemist.shop`, `www.naturemist.shop`, and `checkout.naturemist.shop`, and all three were verified after reopening. Enhanced Measurement remains off; the tag still reports No data. Saved domains do not verify runtime session continuity, UTM handling or click-ID attribution.

The installed Google & YouTube app setup now loads. Its OAuth account chooser stalled after account selection and reload, so no account/property link or new Google OAuth permissions were completed. The custom checkout pixel remains disconnected; the official app is still the intended sole hosted-checkout/purchase sender.

The Shopify overview dashboard was customized and saved with five named sections and 18 cards: Sales (5), Customers (5), Conversions (3), Products (2), and Marketing (3). Last 90 days is selected. Current Shopify reports/schema support cart/search activity and source/device/location breakdowns where applicable; these are not categorically GA4-only metrics. Actual coverage for this custom storefront remains to be verified. New/returning customers means purchasers, not new/returning website visitors. Latest report totals, dashboard evidence and coverage limits are in [analytics-verification-report.md](analytics-verification-report.md).

Local product-click coverage was extended in RitualFinder, BotanicalCombos, ComboPreview, PreviousProductHero and ProductHero through the existing consent-gated tracker. The follow-up passed 44 focused tests, TypeScript, scoped ESLint and `git diff --check`. The final production build after this patch passed, including all 33 static pages, with existing catalog/Judge.me fallbacks because upstream requests were unavailable. The earlier 575-test result retains its original date and scope. No website design/layout change, deployment or analytics activation occurred. GA4 refund export, live purchase verification and campaign continuity remain pending.

The live homepage-to-product, cart-add/remove and Shopify checkout handoff check passed. The pre-existing Amla quantity 1 / INR 234 cart was restored, and hosted checkout displayed the same item/total with no customer details entered and no order/payment submitted. A targeted read also confirmed all five historical non-test backend order lines have null product and variant links; financial reconciliation and historical product attribution remain separate unresolved items. See the verification report for exact findings and evidence.
