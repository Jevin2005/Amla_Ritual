# Skill: Audit the frontend

## Objective

Verify that the implementation matches the approved specification and remains production-buildable.

## Scope

- Review `src/`, relevant root configuration, `public/`, `build/` and `worker/`.
- Compare behavior with `docs/specifications/technical-specification.md` when that file exists.
- Preserve the dependency rules in `docs/architecture.md`.

## Required checks

1. Review modified files for broken imports, unsafe browser/server boundaries, unhandled states and accessibility regressions.
2. Run `npm run lint`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Run `npm run check:site` for release or hosting work.
6. Report failures truthfully and fix only defects within the approved scope.
