/**
 * Factory server entry: a fully self-hosted Mastra Factory.
 *
 * Every service is chosen explicitly and runs on infrastructure you operate.
 * Nothing here talks to the Mastra Platform:
 *
 *   auth          config/auth.ts          Better Auth (default), WorkOS, or none
 *   storage       config/storage.ts       PostgreSQL + pgvector
 *   integrations  config/integrations.ts  GitHub App, GitLab, Linear, Jira, Slack
 *   sandbox       config/sandbox.ts       local (swap for E2B or your own)
 *   tools/routes  custom/*                your own extensions
 *
 * `mastra build` requires this file to export a `Mastra` instance named
 * `mastra`, built by a literal `new Mastra(...)` here — that's why the factory
 * returns constructor args from `prepare()` instead of an instance.
 */
import { Mastra } from '@mastra/core/mastra';
import { MastraFactory } from '@mastra/factory';

import { createAuth, stateSecret } from './config/auth';
import { assertNoPlatformServices, env, listEnv } from './config/env';
import { createIntegrations } from './config/integrations';
import { createSandbox } from './config/sandbox';
import { createSecretEncryption, createStorage, createVector } from './config/storage';
import { customRoutes } from './custom/routes';
import { tools } from './custom/tools';

assertNoPlatformServices();

const auth = createAuth();
// Keep these as plain `const x = ...` declarations: `mastra build` statically
// analyzes this file and drops destructured top-level bindings.
const storage = createStorage();
const vector = createVector();
const embedder = env('FACTORY_EMBEDDER');

export const factory = new MastraFactory({
  configVersion: 'factory-template-v1',
  auth,
  secretEncryption: auth === null ? undefined : createSecretEncryption(),
  storage,
  vector,
  ...(embedder ? { embedder } : {}),
  integrations: createIntegrations(),
  sandbox: createSandbox(),
  tools,
  // Providers every signed-in account may use with this server's credentials,
  // e.g. amazon-bedrock or google-vertex.
  deploymentModelProviders: listEnv('FACTORY_DEPLOYMENT_MODEL_PROVIDERS'),
  publicUrl: env('MASTRACODE_PUBLIC_URL'),
  allowedOrigins: listEnv('MASTRACODE_ALLOWED_ORIGINS'),
  stateSecret: stateSecret(),
});

const preparedArgs = await factory.prepare();

export const mastra = new Mastra({
  ...preparedArgs,
  server: {
    ...preparedArgs.server,
    apiRoutes: [...(preparedArgs.server?.apiRoutes ?? []), ...customRoutes],
  },
  storage: preparedArgs.storage,
  pubsub: preparedArgs.pubsub,
  workers: preparedArgs.workers,
  workflows: preparedArgs.workflows,
});

await factory.finalize();
