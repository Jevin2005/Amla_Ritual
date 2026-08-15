# Skill: Publish with Sites

## Objective

Publish the verified frontend through its existing Sites project binding.

## Safety rules

- Deploy only when the user explicitly requests publishing.
- Preserve `.openai/hosting.json` and its existing project ID.
- Never expose secrets, invent environment values or create a replacement hosting project without approval.
- Do not use Cloud Run for this repository unless the user separately requests and approves a hosting migration.

## Instructions

1. Work from the frontend repository root.
2. Run `npm run check` and resolve in-scope failures.
3. Verify the generated Sites artifact and its copied hosting manifest.
4. Use the available Sites hosting workflow to publish the current source revision and artifact.
5. Report the verified deployment URL and visibility.
