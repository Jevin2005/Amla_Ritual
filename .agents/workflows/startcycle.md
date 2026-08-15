---
description: Plan, implement and verify a NatureMist frontend change
---

When the user types `/startcycle <idea>`, use `.agents/agents.md` and `.agents/skills/` against the existing frontend repository.

## Sequence

1. Use `write_specs.md` to create or revise `docs/specifications/technical-specification.md` when the request needs a material product or architecture decision. Pause for approval only when that skill identifies an approval gate.
2. Use `generate_code.md` to implement the approved scope in the existing `src/` tree.
3. Use `audit_code.md` and fix in-scope failures.
4. Use `deploy_app.md` when the user wants a local preview.
5. Use `deploy_sites.md` only when the user explicitly asks to publish.

Never create `app_build/` or a second frontend project.
