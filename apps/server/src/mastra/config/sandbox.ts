/**
 * Where agent commands run.
 *
 * The default is a local sandbox: commands run on this machine as the server's
 * user, under FACTORY_LOCAL_SANDBOX_ROOT. Only an allow-list of host variables
 * reaches those commands, so server secrets (DATABASE_URL, API keys) stay out.
 *
 * For shared or multi-tenant hosts, replace it with an isolated provider, for
 * example `E2BFactorySandbox` from `@mastra/e2b`, or your own FactorySandbox.
 * See https://factory.mastra.ai/configure/sandboxes.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';

import { LocalFactorySandbox } from '@mastra/factory';

import { env } from './env';

const SANDBOX_ENV_KEYS = [
  'HOME',
  'USER',
  'LOGNAME',
  'SHELL',
  'TMPDIR',
  'LANG',
  'LC_ALL',
  'TERM',
  'TZ',
  'GIT_EXEC_PATH',
  'GIT_TEMPLATE_DIR',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
];

export function createSandbox() {
  return new LocalFactorySandbox({
    root: env('FACTORY_LOCAL_SANDBOX_ROOT') ?? join(homedir(), '.factory', 'sandboxes'),
    env: Object.fromEntries(SANDBOX_ENV_KEYS.flatMap(key => (process.env[key] ? [[key, process.env[key]!]] : []))),
  });
}
