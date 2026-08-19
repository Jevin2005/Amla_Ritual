# NatureMist

> Pure botanicals. Powerful rituals.

NatureMist is a premium, responsive headless Shopify storefront for traditional Indian botanical hair-care powders. The existing editorial experience is preserved while Shopify Admin supplies the live catalogue, product media, variants, prices, inventory, collections, promotional posters, navigation, policies, cart, discounts, and hosted checkout.

![NatureMist social preview](frontend/public/og-shopify.jpg)

## Project status

This repository now contains a **Shopify-ready headless storefront** with a safe preview fallback.

- Shopify is the source of truth for live products, variants, media, prices, availability, collections, cart totals, discount codes, and checkout.
- Shopify Files and the `storefront_content/main` metaobject control the active homepage, ritual, and story posters plus the announcement bar.
- Shopify Navigation and Policies feed the corresponding website surfaces.
- The full Shopify cart ID stays in a secure HTTP-only cookie and payment details are collected only by Shopify's hosted checkout.
- When credentials are absent, the original six-product catalogue remains available as clearly isolated fallback data so builds and design review continue to work.
- Wishlist remains device-local. Customer accounts, order tracking, newsletter delivery, and reviews require the merchant's chosen Shopify/customer apps if those features are needed.

The Next.js application lives in the `frontend` workspace. Follow [the Shopify setup and merchant handoff](docs/shopify-setup.md) before launch.

The detailed experience notes below also document the built-in fallback catalogue used before Shopify credentials are supplied.

## Website experience

### Homepage

The homepage is an editorial introduction to the NatureMist brand and collection. It contains:

1. An Amla-led hero with preview pricing, add-to-bag, wishlist, and featured ritual guidance.
2. A horizontally browsable collection of all products published through Shopify.
3. Goal-based entry points for cleansing, nourishment, softness and shine, and botanical colour.
4. A two-question ritual finder that recommends a simple starting product.
5. A three-step scoop, mix, and apply preparation guide.
6. Ingredient-clarity standards and the NatureMist brand philosophy.
7. An interactive Shopify product switcher.
8. Merchant-defined ritual sets sourced from Shopify collections.
9. A product comparison table.
10. Journal-style educational links and six frequently asked questions.

The journal cards are curated links into existing ritual and product content; there is currently no separate blog or journal system.

### Collection and product discovery

The shop presents every published Shopify product and supports:

- ritual-goal filtering through the `?goal=` URL parameter;
- ritual-step filtering by Cleanse, Condition, or Colour;
- client-side search across product names, botanical names, subtitles, and search terms;
- collection-order and preview-price sorting;
- result counts, empty states, wishlisting, and add-to-bag actions;
- a global product search dialog available from the site header.

Search is intentionally limited to the loaded Shopify product catalogue. It is not a full-site search engine.

### Product detail pages

Every published catalogue item has a dynamic product page at its Shopify handle. Each page contains:

- breadcrumbs and a CSS-rendered packaging mockup;
- botanical identity, plant part, texture, preview price, and catalogue status;
- quantity selection from 1 to 12;
- add-to-bag, preview buy-now, and wishlist actions;
- benefits, preparation steps, ingredient details, mixers, suitability, storage, and safety guidance;
- product-specific FAQs and related products;
- basic Product JSON-LD without unverified offers, reviews, inventory, or ratings.

Unknown product slugs return the branded 404 page.

### Ritual education

The ritual area combines a deterministic recommendation tool with preparation and safety education. The finder asks for a ritual goal and current hair feel, then applies this mapping:

| Goal | Hair feel | Recommendation |
| --- | --- | --- |
| Botanical Colour | Any choice | Indigo Powder |
| Scalp Ritual | Any choice | Bhringraj Powder |
| Cleanse | Oily | Reetha Powder |
| Cleanse | Any other choice | Shikakai Powder |
| Softness + Shine | Dry / textured | Hibiscus Powder |
| Softness + Shine | Any other choice | Amla Powder |

The result is cosmetic guidance only. It is not a diagnosis, medical recommendation, permanent profile, or guaranteed outcome.

## Routes

| Route | Purpose | Search indexing |
| --- | --- | --- |
| `/` | Editorial homepage and complete brand introduction | Allowed |
| `/shop` | Searchable, filterable Shopify collection | Allowed |
| `/shop/amla-powder` | Amla product and ritual guide | Allowed |
| `/shop/reetha-powder` | Reetha product and ritual guide | Allowed |
| `/shop/shikakai-powder` | Shikakai product and ritual guide | Allowed |
| `/shop/bhringraj-powder` | Bhringraj product and ritual guide | Allowed |
| `/shop/hibiscus-powder` | Hibiscus product and ritual guide | Allowed |
| `/shop/indigo-powder` | Indigo colour and safety guide | Allowed |
| `/rituals` | Ritual finder, preparation guide, and safety education | Allowed |
| `/our-story` | Brand philosophy and ingredient-clarity principles | Allowed |
| `/wishlist` | Products saved in the current browser | No index |
| `/checkout` | Shopify bag summary and hosted-checkout handoff | No index |
| `/track-order` | Future fulfilment-provider entry point | No index |
| `/shipping-returns` | Pre-launch shipping and returns policy preview | Allowed |
| `/privacy` | Pre-launch privacy statement | Allowed |
| `/terms` | Pre-launch browsing and commerce terms | Allowed |

The app also generates `/robots.txt`, `/sitemap.xml`, a web app manifest, social metadata, a favicon, a dynamic app icon, and branded loading, error, and not-found states.

## Built-in preview botanical collection

All prices below are editable INR previews. Every product currently has `Net weight to be confirmed` and `Preview catalogue` status.

| No. | Product | Botanical and plant part | Ritual focus | Step | Experience | Preview price |
| --- | --- | --- | --- | --- | --- | ---: |
| 01 | Amla Powder | *Phyllanthus emblica*, fruit | Condition + shine | Condition | Beginner | ₹449 |
| 02 | Reetha Powder | *Sapindus mukorossi*, fruit shell | Botanical cleanse | Cleanse | Familiar | ₹399 |
| 03 | Shikakai Powder | *Acacia concinna*, fruit | Gentle cleanse + slip | Cleanse | Beginner | ₹399 |
| 04 | Bhringraj Powder | *Eclipta prostrata*, whole plant | Scalp + length ritual | Condition | Familiar | ₹449 |
| 05 | Hibiscus Powder | *Hibiscus rosa-sinensis*, flower | Softness + luster | Condition | Beginner | ₹499 |
| 06 | Indigo Powder | *Indigofera tinctoria*, leaf | Botanical colour | Colour | Advanced | ₹499 |

Three bundle presets are included:

| Bundle | Contents | Combined preview price | Behaviour |
| --- | --- | ---: | --- |
| Essential Wash Day | Reetha, Shikakai, and Amla | ₹1,247 | Adds one of each product |
| Softness & Luster Ritual | Amla, Hibiscus, and Bhringraj | ₹1,397 | Adds one of each product |
| The Botanical Cabinet | All six products | ₹2,694 | Adds the complete collection |

Bundle totals are the sum of the individual preview prices. No bundle discount is applied.

## Commerce and data behaviour

| Capability | Current implementation |
| --- | --- |
| Bag | Shopify Cart API when connected; device-local preview cart only when unconfigured |
| Wishlist | Browser-only saved product list |
| Persistence | Shopify cart ID in a secure HTTP-only cookie; preview cart/wishlist use device storage |
| Discount code | Validated and priced by Shopify when connected |
| Checkout | Secure handoff to Shopify hosted checkout |
| Order tracking | Session-only input and an integration notice; the reference is not sent or stored |
| Newsletter | Lightweight client-side preview validation; the email is cleared and not submitted |
| Inventory and tax | Shopify-authoritative when connected |
| Accounts and order history | Not implemented |
| CMS and API | Shopify products, collections, Files, metaobjects, menus, and policies |

The browser storage keys are:

```text
naturemist-cart-v1
naturemist-wishlist-v1
```

Invalid or removed product identifiers are discarded when stored state is restored.

## Analytics integration boundary

Interactions dispatch a `naturemist:analytics` browser `CustomEvent`. If another integration has already created `window.dataLayer`, the same non-sensitive event object is also pushed there. The repository does not bundle or contact an analytics provider.

Current event names include:

```text
add_to_cart
remove_from_cart
view_cart
add_to_wishlist
remove_from_wishlist
select_item
filter_applied
search
quiz_completed
begin_checkout
newsletter_signup
```

An integration can listen without changing store behaviour:

```js
window.addEventListener("naturemist:analytics", (event) => {
  console.log(event.detail);
});
```

Do not add names, email addresses, postal addresses, payment details, or free-text personal data to these payloads.

## Technology

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16.3.0 App Router |
| UI runtime | React 19.2.8 |
| Language | TypeScript with strict checking |
| Styling | Tailwind CSS 4 plus the project design system in `globals.css` |
| Native build | Next.js |
| Sites build | Vinext, Vite 8, Cloudflare Vite integration, and Wrangler |
| Images | `next/image`, static concept imagery, and CSS-rendered product jars |
| State | React context and browser `localStorage` |
| Data source | Typed catalogue objects in the repository |

No runtime environment variables are required for the current frontend preview.

## Brand and visual language

NatureMist uses a restrained editorial system built around ivory (`#f7f4e8`), forest (`#173f2a`), botanical green (`#3f7d3a`), and amla green (`#a7c943`). Display typography uses an Iowan/Palatino/Baskerville/Georgia system-serif stack, while interface copy uses an Avenir/Segoe UI/Helvetica/Arial system-sans stack, so no external font service is required.

The hero and preparation photography lives in `public/images/`; the default social card is `public/naturemist-social-redesign.png`. Product jars are reusable HTML/CSS illustrations driven by each product's accent colours. All packaging visuals remain previews until approved artwork and product photography are supplied.

## Getting started

### Requirements

- Node.js 22 or newer
- npm 11 (the repository declares npm 11.17.0)

From the repository root:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test the native production build locally:

```bash
npm run build
npm run start
```

## Available commands

Run every command from the repository root.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run the Next.js Core Web Vitals and TypeScript ESLint rules |
| `npm run typecheck` | Generate Next.js route types and run `tsc --noEmit` |
| `npm run build` | Create the native Next.js production build |
| `npm run start` | Serve the native production build |
| `npm run build:site` | Create the Vinext/Sites artifact in `dist/` |
| `npm run preview:site` | Preview the Sites build locally |
| `npm run check:site` | Run Vinext compatibility checks and build the Sites artifact |
| `npm run check` | Run lint, typecheck, native build, and the complete Sites gate |

There is currently no automated unit, integration, or end-to-end test suite. The listed checks are the implemented quality gates.

## Project structure

```text
Amla_Ritual/
├── .openai/hosting.json           Sites project binding
├── build/                         Sites/Vite build adapter
├── docs/                          Engineering notes and specifications
├── public/                        Static images and browser assets
├── src/
│   ├── app/                       Thin routes, metadata, SEO files, and global CSS
│   ├── domain/catalog/            Product facts, types, bundles, and selectors
│   ├── features/                  Cart, catalogue, checkout, rituals, search, etc.
│   ├── shared/hooks/              Domain-neutral reusable hooks
│   └── widgets/
│       ├── home/                  Homepage composition, content, and interactions
│       └── site-chrome/           Header, mobile menu, footer, and site shell
├── worker/                        Sites runtime and image-optimization entry point
├── next.config.ts                 Next.js and security-header configuration
├── vite.config.ts                 Vinext/Sites build configuration
├── package.json                   Dependencies and scripts
└── README.md                      Product and engineering overview
```

The intended dependency direction is:

```text
app -> widgets -> features -> domain
              \-> shared
```

- Route files compose the experience and remain server components where possible.
- Interactive leaves such as dialogs, filters, forms, the cart, and the ritual finder are client components.
- `domain` holds framework-light catalogue facts and selectors.
- `shared` contains reusable, domain-neutral presentation and hooks.
- Browser APIs are read after mount to avoid server/client hydration differences.

More engineering detail is available in [`docs/architecture.md`](docs/architecture.md).

## Editing the website

| Change | Primary file or directory |
| --- | --- |
| Products, prices, benefits, directions, safety, FAQs, bundles | `src/domain/catalog/products.ts` |
| Homepage content and section order | `src/widgets/home/home-page.tsx` |
| Homepage cards and FAQ copy | `src/widgets/home/content.ts` |
| Ritual recommendation rules | `src/features/rituals/recommendation.ts` |
| Header, mobile navigation, and footer | `src/widgets/site-chrome/` |
| Design tokens, layouts, animation, and breakpoints | `src/app/globals.css` |
| Hero, ritual, and social imagery | `public/` |
| Global metadata and social cards | `src/app/layout.tsx` |
| Route-specific metadata | Each route's `page.tsx` |
| Security response headers | `next.config.ts` |
| Sites binding and runtime | `.openai/`, `vite.config.ts`, and `worker/` |

Prices are stored in paise: `44900` renders as `₹449`. Product pages, catalogue cards, search results, sitemap entries, and static route parameters are all generated from the central `products` array.

When adding or changing a product, verify every customer-facing field—especially botanical identity, plant part, safety, preparation, colour considerations, and search terms. Update the ritual recommendation logic if the new product should be selectable by the finder.

## Responsive design and accessibility

The interface adapts at 1180 px, 900 px, and 680 px breakpoints. Navigation becomes a modal mobile menu, multi-column sections stack, wide catalogue and comparison content remains horizontally usable, and product pages gain a mobile sticky add-to-bag bar.

Implemented accessibility foundations include:

- `lang="en-IN"`, semantic landmarks, headings, native form controls, and labelled fieldsets;
- a keyboard skip link and visible focus treatment;
- descriptive image alternatives and decorative-image hiding;
- live regions for bag, wishlist, filter, and form feedback;
- labelled icon controls and pressed/selected states;
- focus containment, Escape-to-close, focus restoration, and scroll locking for dialogs;
- a reduced-motion stylesheet override.

These are implementation foundations, not a claim of formal WCAG compliance. A keyboard, screen-reader, contrast, zoom, and assistive-technology audit is still required before launch.

## SEO, metadata, and security

The project includes:

- route titles, descriptions, canonical URLs, Open Graph, and Twitter metadata;
- a request-aware metadata base and sitemap host;
- catalogue-constrained product routes and basic Product structured data;
- `robots.txt`, `sitemap.xml`, a web manifest, favicon, and dynamic application icon;
- deliberate no-index handling for checkout, wishlist, and tracking utilities;
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and restrictive `Permissions-Policy` headers.

Structured product data deliberately omits prices, offers, inventory, ratings, and reviews until commercial information is verified.

## Sites deployment

The repository supports two production paths:

1. `npm run build` creates the standard Next.js output.
2. `npm run build:site` creates the Vinext/Sites artifact under `dist/`.

The Sites binding is stored in `.openai/hosting.json`. D1 and R2 bindings are currently disabled because the storefront has no database or object-storage dependency. The worker sends image-optimization requests through the configured image service and forwards all other requests to the Vinext App Router handler.

Generated `.next/`, `dist/`, and `.wrangler/` directories are intentionally ignored by Git.

## Before accepting real orders

The following work must be completed and verified before launch:

- replace preview jars with approved label artwork and original pack photography;
- confirm botanical identities, plant parts, net weights, batches, sourcing, and storage directions;
- approve product claims, preparation ratios, timings, patch testing, and Indigo colour instructions;
- confirm prices, inventory, discounts, taxes, delivery regions, shipping charges, and return rules;
- connect a verified hosted payment provider and real order creation;
- connect fulfilment, tracking, transactional communication, and customer support;
- connect newsletter consent and delivery infrastructure;
- publish complete operator, privacy, cookie, consumer-rights, and legal information;
- add analytics consent and data-governance controls for any provider introduced;
- complete accessibility, browser, device, performance, security, and end-to-end commerce testing.

Do not publish certifications, customer reviews, origin claims, inventory promises, shipping promises, or discount terms until evidence and operations support them. For Indigo and other pigmented botanicals, final pack directions and approved strand-test guidance must take precedence over website preview copy.

## Documentation and licence

- Architecture guide: [`docs/architecture.md`](docs/architecture.md)
- Specification index: [`docs/specifications/README.md`](docs/specifications/README.md)

No `LICENSE` file is currently included. Add an appropriate licence before allowing external reuse or redistribution.
