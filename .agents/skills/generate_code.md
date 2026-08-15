# Skill: Implement frontend code

## Objective

Implement the approved specification in the existing NatureMist frontend.

## Rules

- Read `AGENTS.md`, `docs/architecture.md` and the approved specification first.
- Extend the current application; never scaffold a parallel `app_build/`, `my-app/` or replacement project.
- Put routes in `src/app`, user capabilities in `src/features`, product-domain logic in `src/domain`, shared primitives in `src/shared`, compositions in `src/widgets`, and static assets in `public`.
- Keep route files server-rendered by default and isolate browser interactivity behind focused `"use client"` boundaries.
- Preserve verified business facts and label all unverified commerce data as placeholders.

## Instructions

1. Map each requirement to an existing route or an intentional new module.
2. Implement the smallest coherent change that satisfies the approved behavior.
3. Update documentation when paths, scripts, environment variables or architecture change.
4. Run the validation gates defined in `package.json` before handoff.
