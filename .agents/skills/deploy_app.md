# Skill: Run the frontend locally

## Objective

Start the existing NatureMist frontend locally without creating a second application tree.

## Instructions

1. Work from the repository root containing `package.json` and `.openai/hosting.json`.
2. Use `npm ci` when dependencies need to be installed from the lockfile.
3. Run `npm run lint` and `npm run typecheck` before handoff.
4. Start `npm run dev` for the native Next.js server, or `npm run preview:site` after `npm run build:site` when the Sites runtime must be tested.
5. Report the actual local URL and any unresolved warnings. Do not claim a service is running unless it was verified.
