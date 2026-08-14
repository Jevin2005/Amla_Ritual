# NatureMist

NatureMist is a premium, responsive botanical hair-ritual storefront built with Next.js 16, React 19, TypeScript and Tailwind CSS 4.

The experience includes an editorial homepage, the full six-product collection, product-detail pages, ritual finder, search, filters, device-local wishlist and bag, bundles, checkout handoff, order-tracking entry point, SEO metadata and policy pages.

## Local development

Node.js 20.9 or newer is required.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run check` runs all three gates in order.

## Editing products

All product copy, accent colours, preview prices, ritual guidance and FAQs live in `lib/products.ts`. The current prices and packaging visuals are explicitly pre-launch placeholders. Replace them with verified commercial data and original pack photography before accepting real orders.

Do not publish certifications, reviews, inventory, origin, net weight, batch claims, shipping promises or discount terms until they are verified. Indigo colour guidance and all final preparation timings must match the approved product label.

## Commerce integrations

The wishlist and bag persist only in browser storage. Search, filters, bundles, quantity controls, accordions and the ritual finder are functional. Checkout, tracking, newsletter, reviews, WhatsApp, fulfilment and payment processing remain honest integration handoffs—no card data, customer details or pretend orders are collected.

The UI emits no-op-safe `naturemist:analytics` browser events and optionally pushes non-sensitive conversion events to `window.dataLayer` when one is present.

## Routes

- `/` — editorial homepage
- `/shop` — collection with search, sort and filters
- `/shop/[slug]` — statically generated product-detail pages
- `/rituals` — ritual education and selector
- `/our-story` — brand philosophy
- `/wishlist` — device-local saved rituals
- `/checkout` — secure-provider handoff preview
- `/track-order` — fulfilment handoff preview
- `/shipping-returns`, `/privacy`, `/terms` — pre-launch policy pages

## Brand imagery

Project imagery is stored in `public/images/`, and the social preview is `public/og.png`. These assets were created specifically for the NatureMist concept and should be replaced or supplemented with approved original product photography when available.

## Sites production build

The standard Next.js build remains `npm run build`. The production hosting adapter is validated separately with:

```bash
npm run build:site
npm run preview:site
```

The hosting project binding lives in `.openai/hosting.json`; `dist/` and local Wrangler state are generated and intentionally ignored.
