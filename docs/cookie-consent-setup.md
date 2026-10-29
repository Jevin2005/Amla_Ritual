# NatureMist cookie consent

Implemented locally on 26 October 2026. **The website has not been deployed.**

## Saved Shopify settings

The merchant explicitly selected **India only**. In the existing NatureMist Shopify admin, automated banner regions were turned off, India was selected as the only region, and the configuration was saved. The banner is positioned at **bottom center**, with Shopify's existing light theme and content. The separate checkout-banner display toggle was left unchanged (off). This toggle controls displaying the banner during checkout; it is separate from carrying a visitor's consent to checkout.

These Shopify settings are live configuration changes. The Next.js integration remains local until a future authorized release. Data-storage location was not changed.

## Implementation

- `features/analytics/shopify-scripts.tsx`: Shopify's official `ShopifyScripts`, native `default-banner` mode, Headless channel, India/English/INR context. No extra consent app, database, or GA4 account is needed. WebMCP is disabled.
- `app/layout.tsx` and `lib/shopify/privacy-config.ts`: derive the public shop ID from the configured store's Storefront response. No token is sent to the browser. Missing/invalid identity does not initialize another shop's banner.
- `features/analytics/cookie-settings.tsx` and `widgets/site-chrome/site-footer.tsx`: footer button opens Shopify's own preference dialog, with a retry message if the runtime is unavailable. Existing footer layout and all existing page CSS are preserved.
- `api/[version]/graphql.json` and `/__shopify/*`: delegate Shopify browser API traffic to official Hydrogen handlers. The Next folder `%5F%5Fshopify` intentionally escapes Next's private-folder convention. Existing cart and checkout routes retain ownership of their flow.
- `lib/shopify/cart-session.ts`, the cart route, and the Storefront request helper: create one request context per visitor request, forward privacy/session information through the official client, and apply returned cookie/cache headers. Existing cart validation, cart-secret cookie, authoritative totals and exact checkout URL handoff are preserved. Browser-supplied GraphQL never receives the server's private token; cross-site consent writes are rejected.
- `features/analytics/runtime.ts`: replaces the older Hydrogen React sender with the current analytics bus and official confirmed-cart tracker. No duplicate old sender remains. The analytics adapter requires the configured hostname and Shopify permission. Cart keys and buyer contact data are excluded from analytics snapshots.

Hosting must overwrite trusted Host, protocol and IP forwarding headers at its ingress. Public request URLs are reconstructed from Host and the forwarded protocol, so Next's internal hostname does not reject legitimate same-origin consent requests. Buyer IP forwarding allows Shopify to evaluate the actual visitor region, rather than the server's location. Loopback addresses are omitted in local development. Banner display is decided by Shopify's visitor region and saved preferences; setting the pricing country to India does not force all visitors to be classified as Indian.

## Tracking remains separately controlled

The banner works independently of analytics flags. The user supplied Google Measurement ID `G-YF3CVLWVHG` on 27 October; it is now stored in `.env.local` with the exact production hostname allowlist. Both analytics switches remain false and live activation is pending. See [analytics-setup.md](analytics-setup.md) for GA4 account checks, activation and reporting verification after a future authorized release.

Shopify remains authoritative for orders, payments, revenue and inventory. Consent integration alone does not prove that every browsing metric is populated in Shopify reports.

## Verification

- Local browser: the real Shopify preference dialog opens from the footer. Decline all closes it; after reload and reopening, optional Personalization, Marketing and Analytics are unchecked while Required remains checked.
- Shopify admin: India-only region saved successfully. Bottom-center position saved successfully.
- Automated coverage: the official consent proxy forwards privacy/session headers, rejects cross-site writes, excludes private browser credentials, returns Shopify cookies as private/no-store, and isolates cart sessions. Consent denial/revocation and confirmed-cart event deduplication are tested.
- TypeScript, changed-file ESLint, all 575 Node tests (including the 27 October analytics follow-up), and the Next production build pass locally. The sandboxed build uses the project's existing API failure fallback when external services are unavailable.
- An actual local HTTP consent request using the public preview hostname returned HTTP 200 with the saved banner enabled and positioned at bottom center. The internal/public hostname difference is also covered by a regression test.

Automatic first-visit display for an India-geolocated visitor, mobile interaction, the exact production HTTPS cookie scope, cross-domain checkout continuity, and live analytics receipt still need verification after an authorized release. Localhost testing is not evidence of those properties. The attempted mobile browser viewport override did not produce a verified mobile capture.

Evidence: [desktop preferences](cookie-consent-evidence/preferences-desktop.jpg) and [Shopify banner appearance settings](cookie-consent-evidence/shopify-banner-settings.jpg). India-only selection was also confirmed in the admin's visible region summary.

## Official references

- [Shopify Hydrogen analytics and consent](https://shopify.dev/docs/storefronts/hydrogen/analytics)
- [Shopify request handlers](https://shopify.dev/docs/storefronts/hydrogen/request-handlers)
- [Customer Privacy API and preferences dialog](https://shopify.dev/docs/api/customer-privacy)
