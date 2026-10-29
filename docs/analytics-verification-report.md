# NatureMist analytics audit and verification report

**Recorded:** 28 October 2026, India time. **Website:** https://naturemist.shop. **Reporting currency/timezone:** INR / Asia/Kolkata.

**Current result:** Shopify is the primary business dashboard and its dashboard layout has been saved. Historical sales and some native session records are present. The new storefront cookie/analytics integration remains local and disabled. GA4 settings have been reviewed, but live event delivery, a joined storefront-to-checkout funnel, and completed-purchase accuracy are not yet verified. **No website deployment or new order/payment was performed during this analytics work.**

## 1. Existing tracking configuration

- **Storefront:** custom React/Next.js website backed by Shopify. Customers build a Shopify cart and continue to the exact checkout URL returned by Shopify. The existing hosted-checkout flow was separately released on 26 October; that earlier release is distinct from the undeployed cookie/analytics work. See [checkout setup](shopify-checkout-setup.md).
- **Shop:** NatureMist, Shopify shop ID `77712916666`; the connected admin uses `zyv78m-p7.myshopify.com`, while project configuration uses the same shop's `amla-ritual.myshopify.com` alias.
- **Headless channel:** the live admin lists **naturemist storefront**, created 22 August, and exposes its Storefront API management. This verifies the storefront registration, not the private token currently used by the hosting deployment. No credential was displayed, replaced or rotated.
- **Shopify analytics:** official Hydrogen runtime, request handlers, consent integration and page/product/cart/search event adapters are prepared locally. The master and Shopify analytics activation switches remain **false**. Existing report records must not be attributed to this undeployed code.
- **Cookie consent:** Shopify's banner configuration is saved for **India only**, at **bottom center**. Local code adds the native banner and a footer Cookie settings button. The local preference dialog saved a declined choice across reloads. Production region detection and checkout consent continuity remain unverified. Data-hosting location was not changed.
- **GA4:** existing measurement ID **`G-YF3CVLWVHG`** is preserved in local configuration. No replacement GA4 property was created. The prepared storefront implementation uses the direct Google tag rather than a second GTM sender.
- **Checkout measurement:** the official Google & YouTube app is installed, but account/property setup is incomplete and its Shopify pixel remains disconnected. The custom checkout pixel is a superseded, disconnected prototype and must not be installed. Google's current guidance does not support Google tags in Shopify custom pixels. No custom pixel has been connected.
- **Business records:** Shopify remains authoritative for orders, payment status, refunds and inventory. Browser analytics is not needed to create those operational records.

## 2. Problems discovered

### Current reporting is not a verified complete website funnel

The read-only ShopifyQL baseline below used the shop timezone. Both queries returned data without parse errors or warnings.

| Window and source | Observed result | Interpretation |
| --- | --- | --- |
| Last 90 days, sales grouped by sales channel | **5 orders; INR 1,899 total sales**, all NatureMist Backend | Historical backend orders are represented in Shopify sales reports. This is not proof of settled payment receipts or the current hosted-checkout flow. |
| Last 30 days, Headless sessions | **5 sessions, 6 pageviews, 0 sessions adding to cart, 5 reaching checkout, 0 completing checkout** | Native Headless records exist, but the small checkout-heavy sample does not demonstrate complete browsing/cart coverage on naturemist.shop. |
| Last 30 days, Online Store sessions | **6 sessions, 6 pageviews, 1 session adding to cart, 4 reaching checkout, 0 completing checkout** | A different storefront source; do not present these as confirmed traffic from the custom website. |
| Orders created on or after 26 October | **None returned** | There is no completed order after the checkout release to reconcile with that release's reporting. |

The sales query used `SINCE startOfDay(-90d) UNTIL today`; the session query used `SINCE startOfDay(-30d) UNTIL today`. The saved dashboard uses **Last 90 days**, so its session cards need not equal this separate 30-day diagnostic baseline.

Eight historical orders were returned with no further page. The only Headless-attributed order was **test order #1001**, created 27 August, attributed to **naturemist storefront** (`channel:20971706`). The five non-test orders were created on 5 September through **NatureMist Backend**. This confirms historical attribution, not which Storefront token the current production deployment uses.

### Sales totals are not verified payment receipts

The legacy order records need payment reconciliation:

| Order | Shopify financial status | Shopify amount received |
| --- | --- | ---: |
| #1002 | Paid | INR 325 |
| #1004 | Paid | INR 0 |
| #1005 | Paid | INR 0 |
| #1003 and #1006 | Pending | INR 0 each |

The differences may reflect how the former backend created or marked orders. They do not by themselves prove a Shopify reporting error or a failed real payment. Compare the original gateway/transaction records before treating sales totals or a Paid label as settled cash. No historical order status was changed.

### Integration gaps

- New cookie/analytics code has not been deployed or activated, so it cannot yet prove production event delivery.
- Google & YouTube account linking reached an account chooser that remained loading after selection and reload; linking did not complete.
- GA4 reported no recent data during inspection.
- The dashboard's product-revenue card showed **No data**, and top variants showed **None**. A targeted read of all five non-test backend orders (#1002–#1006) found one line per order, titled **Wildcrafted Amla Powder**, quantity 1. All five lines returned `product: null` and `variant: null` (0/5 linked products, 0/5 linked variants; no remaining pages). These historical orders lack current catalog links, consistent with incomplete product attribution. This read cannot distinguish originally custom lines from deleted catalog objects or prove the sole cause of a card's result. No historical order was rewritten.
- Standard checkout and purchase ownership has been assigned exclusively to the official Google & YouTube app. Completing and verifying that app connection is still required; the superseded custom pixel is not an activation alternative.

## 3. Issues successfully fixed

- Added Shopify's native cookie integration and footer preference control locally, preserving existing page design and layout.
- Added a same-origin Shopify request path that carries consent/session information, excludes private credentials from browser-supplied GraphQL, and handles public hostnames correctly behind Next.js hosting proxies.
- Prepared consent-gated Shopify and GA4 storefront measurement. Required checks include configured production hosts, accepted cart changes, selected Shopify variants, sanitized commerce fields and duplicate suppression. Historic actions are not replayed after consent.
- Corrected product-selection measurement in **five existing components**, so the supported `select_item` events can use the current analytics path.
- Saved and reopened GA4 cross-domain rules for exactly **`naturemist.shop`**, **`www.naturemist.shop`** and **`checkout.naturemist.shop`**.
- Observed GA4 Enhanced Measurement switched **off**, consistent with manual event ownership and avoiding that source of automatic page/search/form events.
- Customized and saved the Shopify dashboard described below.

**Latest local checks:** 44 targeted tests passed, along with TypeScript, scoped ESLint and `git diff --check`. The final production build after the five-component click patch also passed, including compilation and all 33 static pages. Shopify catalog and Judge.me requests were unavailable in this environment, so the build used existing fallbacks. Passing these checks does not verify live Shopify/GA4 receipt, real payments, or cross-domain session continuity.

**Live shopping check:** navigated from the homepage to Reetha Powder, added one Reetha at INR 325, verified the bag total of INR 559 alongside its pre-existing Amla item, then removed Reetha and verified the original one-Amla bag at INR 234 was restored. The local checkout summary handed off successfully to **checkout.naturemist.shop**, showing Amla quantity 1 and INR 234 total. Contact/address fields remained empty; no order or payment was submitted. The observed live storefront had no matching external Google/Shopify analytics/consent script and no new Cookie settings footer control. This confirms shopping behavior, not receipt of the undeployed analytics events. See [checkout handoff evidence](analytics-evidence/live-checkout-handoff-verified.jpg).

## 4. Shopify Analytics dashboard configuration

The native Shopify Analytics dashboard was organized, arranged and saved with **Last 90 days** selected. It uses Shopify's supported cards, not copied GA4 values or invented data.

The 18 cards are arranged in rows, with wider sales/session trends and product-revenue cards. See [saved dashboard evidence](analytics-evidence/shopify-dashboard-configured.jpg). Historical aggregate cards showed INR 1,899 sales, five orders and INR 379.80 average order value. The aggregate 90-day funnel showed 43 sessions, two cart-add sessions, 16 reached-checkout sessions and one completed-checkout session; these are historical all-source figures, not a controlled test of the new integration. The separate 30-day/channel diagnostic above uses a different window.

| Section | Saved card coverage |
| --- | --- |
| **Sales** | Total sales over time, orders, average order value, sales breakdown, sales by channel |
| **Customers** | Website sessions, new versus returning customers, visitor location, customer location, device breakdown |
| **Conversions** | Overall conversion, conversion funnel, checkout conversion rate |
| **Products** | Revenue by product and top variants by units |
| **Marketing** | Sessions by referrer, sales by referrer, channel performance |

Interpretation rules:

- **New/returning customers** measures purchasing relationships; it is not a count of new/returning anonymous visitors.
- Visitor location is distinct from customer shipping/billing location.
- **Overall conversion** is completed-checkout sessions divided by sessions. **Checkout conversion** uses sessions that reached checkout as its denominator.
- A card showing No data or None is an unavailable result, not proof of zero activity.
- Channel/referrer cards require valid source attribution. Until controlled production tests confirm coverage, they should not be described as a complete view of naturemist.shop traffic.

Shopify's current [sessions schema](https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sessions_and_behavior/sessions) supports session/pageview, product-view/add/remove, device, geography, referrer and conversion measures. Its [sales schema](https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sales_revenue/sales) supports sales components and product/channel/customer breakdowns. Availability of a metric does not establish that this store is currently supplying all inputs for it.

## 5. GA4 verification results

| Check | Result |
| --- | --- |
| Existing property/measurement ID | Preserved: `G-YF3CVLWVHG`; no new property |
| Cross-domain configuration | Three exact domains saved and reopened successfully |
| Enhanced Measurement | Switch observed off |
| Recent GA4 traffic | No recent data observed |
| Google & YouTube checkout connection | Incomplete; account chooser remained loading; pixel disconnected |
| Storefront events | Page/product/list views, item clicks, cart additions/removals/views, settled searches and `checkout_handoff` prepared/tested locally; live receipt unverified. Standard `begin_checkout` belongs to the official app on Shopify checkout arrival. |
| Purchase | No active new checkout purchase sender verified; no new purchase/payment test performed |
| Duplicate protection | Local tests cover relevant suppression paths; no end-to-end network proof yet |
| Storefront-to-checkout session continuity | Unverified; saved domain rules alone do not prove continuity |

The storefront deliberately has no standard purchase, payment or refund emitter. The official Google app is the selected checkout/purchase sender; its actual transaction ID, item IDs, value, consent behavior and refresh deduplication must be verified after connection. Tests of the superseded custom pixel do not validate the official app. A checkout-completed analytics event is not a payment-settlement reconciliation. Details and remaining limits are recorded in [analytics setup](analytics-setup.md).

See [persisted GA4 domain rules](analytics-evidence/ga4-cross-domain-configured.jpg) and Google's [supported Shopify setup guidance](https://support.google.com/google-ads/answer/15642481?hl=en).

## 6. Metrics unavailable or limited in Shopify

- GA4 events are **not automatically imported into Shopify Analytics**. Sending a `dataLayer` event cannot create an arbitrary Shopify report.
- Shopify supports native session, product-view/cart-add/cart-remove aggregates and conversion reporting through supported instrumentation; these must not be labelled universally GA4-only. The current store still needs complete event-delivery verification.
- Detailed custom list-impression, item-click and bespoke step-by-step funnels remain in GA4 unless a documented Shopify event/report path is implemented and verified.
- Full paid-campaign attribution is not verified. Application-published measurement URLs currently remove query strings, so detailed UTM/click-ID continuity is not established.
- Session definitions, consent, blockers, report timing and attribution rules can make Shopify and GA4 counts differ. Neither system's browser counts should be forced to equal financial records.
- Abandoned checkout records are not every abandoned cart; Shopify's abandoned-checkout resource requires customer contact information.
- No custom embedded reporting application, external database or GA4-to-Shopify synchronization service was introduced.

The [Headless channel](https://shopify.dev/docs/storefronts/headless/overview) and [official Hydrogen analytics](https://shopify.dev/docs/storefronts/hydrogen/analytics) provide the supported native path. Current runtime availability and historical Headless orders are not substitutes for verifying the deployed storefront's configuration.

## 7. Remaining manual actions or approvals

1. **Finish the existing Google & YouTube account/property connection** when the account chooser is usable. Confirm the intended existing GA4 property. Do not create a second property or run competing purchase senders.
2. **Confirm production Headless configuration:** verify the deployed Storefront token's intended channel, public storefront configuration and exact hostname allowlist without exposing private credentials.
3. **Authorize deployment separately when the Google connection and production configuration are ready.** Local checks and the final production build passed. The current no-deployment instruction remains in force. Set production activation flags only as part of an authorized release; current local flags remain false.
4. **Verify one controlled consented journey after release:** homepage, product, accepted cart add/remove, cart view and hosted checkout. Check denied and revoked consent, mobile behavior, direct navigation, refresh/back and event duplication.
5. **Verify purchase safely under separate authorization.** A Shopify-supported test must be planned without silently changing payment configuration or creating a real charge. The merchant previously left completed-purchase verification pending; no new order, payment or refund was created here.
6. **Reconcile historical paid-status records** against original payment-provider/transaction records, especially #1004 and #1005. Do not correct financial records merely to make dashboard totals match.
7. **Inspect report results after their processing delay**, using matching dates, timezone, currency, source/channel and refund definitions. Confirm product mapping before explaining or trying to repair the empty product cards.

## 8. Final tracking status

| Area | Status at this checkpoint |
| --- | --- |
| Shopify dashboard organization | **Saved** |
| Historical Shopify sales/order records | **Present and read-only verified**; payment reconciliation outstanding |
| Historical native Headless sessions | **Present**; complete custom-site coverage not proven |
| Cookie integration | **Implemented locally**; India-only banner settings saved in Shopify |
| Storefront analytics code | **Prepared with targeted checks passing**; switches false; not deployed |
| Live product/cart/checkout handoff | **Passed** without customer details, order submission or payment; original bag restored |
| GA4 settings | Existing ID preserved; domains verified; Enhanced Measurement off |
| GA4 live delivery / checkout app | **Not verified / connection incomplete** |
| Completed purchase and payment accuracy | **Pending** |
| Deployment | **Not performed** |

This report records verified findings and remaining work. It does not certify complete live tracking or settled revenue. Google account linking, authorized activation, controlled event receipt, campaign/session continuity and purchase reconciliation remain open.
