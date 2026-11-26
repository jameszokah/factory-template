# AGENTS.md

A self-hosted Mastra Factory with its own backend and UI. Use `bun` for installs and scripts.

## Layout

- `apps/server` — the Factory server (Mastra entry `src/mastra/index.ts`). Each service lives in
  `src/mastra/config/*` (auth, storage, integrations, sandbox); your extensions in `src/mastra/custom/*`.
- `apps/ui` — the Factory React SPA, forked from `mastracode/factory-ui` at the commit in `UPSTREAM.json`.
  Branding lives in `apps/ui/src/brand.json` and `apps/ui/src/ui/public/brand/`.
- `scripts/` — dev, build, start, setup, rename and upstream-sync helpers. They load the root `.env`.

## Rules

- Never configure Mastra Platform services (`MASTRA_SHARED_API_URL`, `MASTRA_PLATFORM_*`); the server refuses to boot.
- Keep `auth` explicit in the server entry: an omitted provider falls back to Mastra Platform sign-in.
- The `@mastra/*` versions in `apps/server` and `apps/ui` must come from the same release as `UPSTREAM.json`.
- Keep policy, validation and persistence in the server, not in React.
- Check changes with `bun run typecheck` and `bun run build`.

## Docs

- Factory: https://factory.mastra.ai/llms.txt
- Mastra: https://mastra.ai/llms.txt
