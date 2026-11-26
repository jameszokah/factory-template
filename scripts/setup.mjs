// First-run setup: create .env from .env.example and fill in generated secrets.
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { root } from './lib.mjs';

const envFile = join(root, '.env');
if (!existsSync(envFile)) {
  copyFileSync(join(root, '.env.example'), envFile);
  console.log('Created .env from .env.example');
}

const generated = {
  FACTORY_CREDENTIAL_ENCRYPTION_KEY: () => randomBytes(32).toString('base64'),
  BETTER_AUTH_SECRET: () => randomBytes(32).toString('base64url'),
};

let text = readFileSync(envFile, 'utf8');
for (const [name, make] of Object.entries(generated)) {
  const line = new RegExp(`^#?\\s*${name}=(.*)$`, 'm');
  const match = text.match(line);
  if (match && match[0].startsWith(name) && match[1].trim()) continue; // already set
  text = match ? text.replace(line, `${name}=${make()}`) : `${text.trimEnd()}\n${name}=${make()}\n`;
  console.log(`Generated ${name}`);
}
writeFileSync(envFile, text);
console.log('Done. Back up FACTORY_CREDENTIAL_ENCRYPTION_KEY: losing it makes stored credentials unreadable.');
