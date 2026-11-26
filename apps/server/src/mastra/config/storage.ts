/**
 * Storage: PostgreSQL with pgvector holds everything (agent threads, memory,
 * recall vectors, Factory app tables and auth tables).
 *
 * Swap `PgFactoryStorage` for another FactoryStorage adapter (for example
 * `LibSQLFactoryStorage` from `@mastra/libsql`) to change it.
 */
import { createFactorySecretEncryption } from '@mastra/factory';
import { PgFactoryStorage, PgVector } from '@mastra/pg';

import { env, requiredEnv } from './env';

export function createStorage() {
  return new PgFactoryStorage({ id: 'factory-storage', connectionString: requiredEnv('DATABASE_URL') });
}

/** Recall vectors live in the same database (needs the pgvector extension). */
export function createVector() {
  return new PgVector({ id: 'factory-vectors', connectionString: requiredEnv('DATABASE_URL') });
}

/** Encrypts stored model-provider keys and integration tokens at rest. */
export function createSecretEncryption() {
  const previous = env('FACTORY_CREDENTIAL_ENCRYPTION_PREVIOUS_KEYS');
  return createFactorySecretEncryption({
    primary: {
      id: env('FACTORY_CREDENTIAL_ENCRYPTION_KEY_ID') ?? 'v1',
      key: Buffer.from(requiredEnv('FACTORY_CREDENTIAL_ENCRYPTION_KEY'), 'base64'),
    },
    ...(previous
      ? {
          previous: Object.entries(JSON.parse(previous) as Record<string, string>).map(([id, key]) => ({
            id,
            key: Buffer.from(key, 'base64'),
          })),
        }
      : {}),
  });
}
