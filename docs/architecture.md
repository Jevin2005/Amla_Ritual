# Frontend architecture

NatureMist is a standalone, single-package frontend. The application and its build configuration live directly at the repository root; future APIs, CMS adapters, or infrastructure packages should be introduced only when a real second deployable unit exists.

## Directory map

```text
Amla_Ritual/
├─ .openai/hosting.json              Sites project binding
├─ build/                            Source for the Sites/Vite build adapter
├─ docs/                             Engineering documentation
├─ public/                           Browser-served images and static assets
├─ src/
│  ├─ app/                           Thin Next.js routes, metadata and global CSS
│  ├─ domain/
│  │  └─ catalog/                    Product data, types and pure selectors
│  ├─ features/
│  │  ├─ cart/components/            Cart drawer and quantity management
│  │  ├─ catalog/components/         Browse and product purchase UI
│  │  ├─ checkout/components/        Checkout-provider handoff
│  │  ├─ newsletter/components/      Newsletter integration boundary
│  │  ├─ rituals/                    Recommendation logic and finder UI
│  │  ├─ search/components/          Catalogue search dialog
│  │  ├─ store/                      Cart, wishlist, persistence and events
│  │  ├─ tracking/components/        Fulfilment-provider handoff
│  │  └─ wishlist/components/        Saved-product experience
│  ├─ shared/
│  │  └─ hooks/                      Domain-neutral reusable hooks
│  └─ widgets/
│     ├─ home/                       Homepage composition and content
│     └─ site-chrome/                Header, navigation, footer and site shell
├─ worker/                            Sites runtime entry point
├─ next.config.ts                    Next.js configuration and response headers
├─ vite.config.ts                    Vinext/Sites build configuration
└─ package.json                      Frontend scripts and dependencies
```

`public`, configuration files, environment files and hosting adapters stay at the package root. Next.js supports `src/app`, but does not support moving `public` or the configuration files into `src`.

## Dependency direction

Code should flow in this direction:

```text
src/app → src/widgets → src/features → src/domain
                    ↘ src/shared ↗
```

- `app` owns routes and composes widgets or features. Route files stay thin and are Server Components unless interactivity requires otherwise.
- `widgets` own page-level or site-wide compositions and may combine several features with shared code.
- `features` own a user capability. A feature may use the catalog domain and shared code; cross-feature imports must be explicit and should not form cycles.
- `domain` contains product facts and pure operations. It must not import React components or browser state.
- `shared` contains reusable, domain-neutral hooks or presentation. It must not import feature modules.
- Prefer direct imports over broad barrel files so client-bundle dependencies remain visible.

The `@/` alias resolves only to `src/`. Assets in `public/` are referenced with browser paths such as `/images/naturemist-hero.png`.

## Server and client components

Pages, layouts, metadata and static editorial sections remain Server Components by default. Add `"use client"` only to interactive leaves such as cart controls, filters, dialogs, the ritual finder and forms. Props crossing the server/client boundary must be serializable.

The store provider reads browser storage after mount. New browser APIs must follow the same pattern to avoid hydration differences.

## Styling

`src/app/globals.css` is the current cross-route design system and preserves the finished visual implementation. New isolated components may adopt CSS modules gradually. Avoid a bulk stylesheet rewrite unless it is paired with breakpoint and visual-regression coverage.

## Adding functionality

- Add a route in `src/app/<route>/page.tsx`.
- Add reusable product behavior to `src/features/catalog/`.
- Add a new customer capability in its own `src/features/<capability>/` folder.
- Put pure catalog facts and selectors in `src/domain/catalog/`.
- Put cross-feature compositions in `src/widgets/`, not in `shared`.
- Keep secrets and server credentials out of this frontend package.

## Quality gates

Run from the repository root:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run check:site
```

`npm run build` verifies the native Next.js output. `npm run check:site` verifies Vinext compatibility and produces the deployable Sites artifact. Sites commands must run from the repository root because the Vite adapter resolves `.openai`, `build`, `worker` and `dist` relative to that root.
