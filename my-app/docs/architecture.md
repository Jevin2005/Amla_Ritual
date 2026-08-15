# Frontend architecture

NatureMist is a standalone frontend package. Its repository folder is named `frontend`, so a future API, CMS adapter or infrastructure package can be added beside it without mixing concerns.

## Directory map

```text
frontend/
├─ src/
│  ├─ app/                       Next.js App Router routes and metadata
│  ├─ domain/
│  │  └─ catalog/                Product data, types and pure selectors
│  ├─ features/
│  │  ├─ cart/components/        Cart drawer and quantity management
│  │  ├─ catalog/components/     Browse and product purchase UI
│  │  ├─ checkout/components/    Checkout-provider handoff
│  │  ├─ home/components/        Homepage-only interactive sections
│  │  ├─ newsletter/components/  Newsletter integration boundary
│  │  ├─ rituals/                Recommendation logic and finder UI
│  │  ├─ search/components/      Catalog search dialog
│  │  ├─ store/                  Cart, wishlist, persistence and events
│  │  ├─ tracking/components/    Fulfilment-provider handoff
│  │  └─ wishlist/components/    Saved-product experience
│  ├─ shared/                    Reusable layout, hooks and primitives
│  └─ widgets/                   Cross-feature page compositions
├─ public/                       Browser-served images and static assets
├─ build/                        Source for the Sites/Vite build adapter
├─ worker/                       Sites runtime entry point
├─ docs/                         Engineering documentation
├─ .openai/hosting.json          Existing Sites project binding
└─ package.json                  Frontend scripts and dependencies
```

`public`, configuration files, environment files and hosting adapters stay at the package root. Next.js supports `src/app`, but does not support moving `public` or the configuration files into `src`.

## Dependency direction

Code should flow in this direction:

```text
src/app → src/widgets → src/features → src/domain
                    ↘ src/shared ↗
```

- `app` owns routes and composes widgets or features. Route files stay thin and are Server Components unless interactivity requires otherwise.
- `widgets` may compose several features and shared components.
- `features` own a user capability. A feature may use the catalog domain and shared code; cross-feature imports must be explicit and should not form cycles.
- `domain` contains product facts and pure operations. It must not import React components or browser state.
- `shared` contains reusable, domain-neutral presentation and hooks. It must not import feature modules.
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

Run from the `frontend` directory:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run check:site
```

`npm run build` verifies the native Next.js output. `npm run check:site` verifies Vinext compatibility and produces the deployable Sites artifact. Sites commands must run from this directory because the Vite adapter resolves `.openai`, `build`, `worker` and `dist` relative to the package root.
