/**
 * Sign-in for the Factory. Choose a provider with AUTH_PROVIDER:
 *
 * - `better-auth` (default): email + password accounts stored in your own
 *   Postgres. No third-party identity service. Tables are migrated on boot.
 * - `workos`: WorkOS AuthKit (SSO, social login). Needs WORKOS_* variables.
 * - `none`: no sign-in at all. Local experiments only; refused in production.
 *
 * To use another identity system, implement a Mastra auth provider that also
 * implements `IOrganizationsProvider` and return it from `createAuth()`.
 * See https://factory.mastra.ai/configure/auth.
 *
 * `auth` is never left `undefined`: MastraFactory would then fall back to Mastra
 * Platform sign-in, which this template deliberately avoids.
 */
import { MastraAuthBetterAuth } from '@mastra/auth-better-auth';
import { MastraAuthWorkos } from '@mastra/auth-workos';
import type { IMastraAuthProvider } from '@mastra/core/server';

import { env, isProduction, requiredEnv } from './env';

export type AuthProviderName = 'better-auth' | 'workos' | 'none';

export function authProviderName(): AuthProviderName {
  const name = (env('AUTH_PROVIDER') ?? 'better-auth').toLowerCase();
  if (name === 'better-auth' || name === 'workos' || name === 'none') return name;
  throw new Error(`Unknown AUTH_PROVIDER "${name}". Use better-auth, workos or none.`);
}

export function createAuth(): IMastraAuthProvider | null {
  const provider = authProviderName();

  switch (provider) {
    case 'better-auth':
      // Deferred mode: the provider builds its own betterAuth() instance on the
      // Factory's database and owns its schema migrations.
      return new MastraAuthBetterAuth({
        secret: requiredEnv('BETTER_AUTH_SECRET'),
        // Lock registration after the first accounts exist with AUTH_SIGN_UP=disabled.
        signUpEnabled: env('AUTH_SIGN_UP') !== 'disabled',
      });

    case 'workos':
      // Reads WORKOS_API_KEY, WORKOS_CLIENT_ID and WORKOS_REDIRECT_URI.
      // The redirect defaults to <publicUrl>/auth/callback.
      return new MastraAuthWorkos({
        fetchMemberships: true,
        session: { cookiePassword: requiredEnv('WORKOS_COOKIE_PASSWORD') },
      });

    case 'none':
      if (isProduction) throw new Error('AUTH_PROVIDER=none is not allowed when NODE_ENV=production.');
      console.warn('[auth] AUTH_PROVIDER=none: the Factory is open to anyone who can reach it.');
      return null;
  }
}

/** A stable secret for signing OAuth `state` in integration connect flows. */
export function stateSecret(): string | undefined {
  return env('FACTORY_STATE_SECRET') ?? env('BETTER_AUTH_SECRET') ?? env('WORKOS_COOKIE_PASSWORD');
}
