# Factory Template

A self-hosted, fully customizable [Mastra Factory](https://factory.mastra.ai): coding agents that turn issues into plans, implementations and reviewed pull requests. You own both halves:

- **Backend** (`apps/server`): the Factory server, with every service wired explicitly in code you can change.
- **Frontend** (`apps/ui`): the complete Factory React app, forked from Mastra's `factory-ui`, so you can restyle, rebrand or rebuild any screen.

Nothing runs on the Mastra Platform. Sign-in, storage, sandboxes and integrations all run on infrastructure you operate, and the server refuses to boot if Platform services are configured.

## Use this template

Click **Use this template** on GitHub (or `gh repo create my-factory --template <owner>/factory-template`), then:

```bash
bun install
bun run rename my-factory --name "My Factory"   # package names + product name
bun run setup                                    # .env with generated secrets
bun run db:up                                    # PostgreSQL + pgvector in Docker
bun run dev                                      # http://localhost:4111
```

Open the app, create the first account, and the onboarding wizard asks you to connect a repository and a model provider. To connect GitHub repositories, [create a GitHub App](https://factory.mastra.ai/configure/github) and fill in the `GITHUB_APP_*` variables in `.env`.

Requirements: Node.js 22.19+, Bun 1.4+, Docker (for PostgreSQL), and Git plus your repositories' build tools on the machine that runs the server (the default sandbox runs agent commands locally).

## What runs where

| Service      | Default                                    | Change it in                                 |
| ------------ | ------------------------------------------ | -------------------------------------------- |
| Sign-in      | Better Auth: email + password, in your DB  | `apps/server/src/mastra/config/auth.ts`      |
| Storage      | PostgreSQL + pgvector                      | `apps/server/src/mastra/config/storage.ts`   |
| Source code  | Your GitHub App (also GitLab)              | `apps/server/src/mastra/config/integrations.ts` |
| Work intake  | GitHub issues, Linear, Jira, Slack         | `apps/server/src/mastra/config/integrations.ts` |
| Sandboxes    | Local: commands run on the server machine  | `apps/server/src/mastra/config/sandbox.ts`   |
| Secrets      | AES-256-GCM encryption of stored keys      | `FACTORY_CREDENTIAL_ENCRYPTION_KEY`          |
| Telemetry    | Off                                        | `MASTRA_TELEMETRY_DISABLED`                  |

Set `AUTH_PROVIDER=workos` to use WorkOS instead, or `AUTH_PROVIDER=none` for a sign-in-free local experiment. After your team has accounts, set `AUTH_SIGN_UP=disabled` to close registration.

> [!WARNING]
> Local sandboxes run agent commands as the server's user, with access to its files and network. Use them on a machine (or container) dedicated to the Factory. For shared hosts, switch to an isolated provider such as `E2BFactorySandbox` from `@mastra/e2b`.

## Customize

**Branding.** Edit `apps/ui/src/brand.json` (name, colors, logo path) and replace `apps/ui/src/ui/public/brand/logo.svg`. The page title, favicon, PWA manifest, header and onboarding all read from it.

**UI.** Everything under `apps/ui/src/ui` is yours: pages in `pages/`, features in `domains/`, layout in `layouts/` and `AppSidebar.tsx`, routes in `router.tsx`, styles in `tailwind.css`. Components come from `@mastra/playground-ui`; replace them with your own whenever you like. Run `bun run dev:ui` for hot reload on http://localhost:5173.

**Agent tools.** Add tools for every session in `apps/server/src/mastra/custom/tools.ts`.

**HTTP routes.** Add endpoints in `apps/server/src/mastra/custom/routes.ts` (see `/custom/health`).

**Skills.** Drop skill folders with a `SKILL.md` into `apps/server/src/mastra/factory-skills/`.

**Anything else.** `MastraFactory` accepts boards, rules, scorers, a knowledge base, a browser, dispatcher limits and more. See the [MastraFactory API](https://factory.mastra.ai/reference/mastra-factory-api).

## Scripts

| Script               | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `bun run setup`      | Create `.env` and generate the encryption key and auth secret.       |
| `bun run db:up`      | Start PostgreSQL (pgvector) on `localhost:54330`. `db:down` stops it.|
| `bun run dev`        | Build your UI, then run the server with it on :4111.                 |
| `bun run dev:ui`     | API on :4111 plus Vite with hot reload on :5173.                     |
| `bun run build`      | Production build in `apps/server/.mastra/output`, serving your UI.   |
| `bun run start`      | Run the production build.                                            |
| `bun run typecheck`  | Type-check both apps.                                                |
| `bun run rename`     | Rename the packages and product.                                     |

## Deploy

Run it anywhere a persistent Node.js process can run.

**Docker** (single host, includes PostgreSQL):

```bash
bun run setup                       # once, then edit .env
MASTRACODE_PUBLIC_URL=https://factory.example.com docker compose --profile app up -d --build
```

**Any VM**: set `MASTRACODE_PUBLIC_URL` to your public HTTPS origin and point `DATABASE_URL` at your PostgreSQL (with the `vector` extension), then `bun run build && bun run start`.

Update your GitHub App (and WorkOS, if used) callback URLs to the public origin. Keep `FACTORY_CREDENTIAL_ENCRYPTION_KEY` stable across deploys. Put the server behind a reverse proxy that terminates HTTPS and forwards `X-Forwarded-For`, so Better Auth can rate-limit sign-in attempts per client IP.

## Stay current with upstream

`apps/ui` tracks the Mastra commit in `UPSTREAM.json`. To pull a newer Factory release into your customized UI:

```bash
scripts/sync-upstream.sh @mastra/factory@0.32.0
```

It 3-way-merges the upstream UI changes into `apps/ui` (conflicts are left as markers). Then pin the `@mastra/*` versions in `apps/server/package.json` and `apps/ui/package.json` to that release, and run `bun install && bun run typecheck && bun run build`.

## License

Apache-2.0. Derived from [Mastra](https://github.com/mastra-ai/mastra); see `NOTICE`.
