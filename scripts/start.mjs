// Run the production build created by `bun run build`.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { loadRootEnv, root, runAll, serverDir, serverOutput } from './lib.mjs';

loadRootEnv();
if (!existsSync(join(serverOutput, 'index.mjs'))) {
  console.error('No build found. Run `bun run build` first.');
  process.exit(1);
}
process.env.NODE_ENV ??= 'production';
runAll([
  {
    name: 'mastra',
    args: ['start', ...(existsSync(join(root, '.env')) ? ['--env', join(root, '.env')] : [])],
    cwd: serverDir,
    env: { MASTRACODE_UI_DIST: join(serverOutput, 'factory') },
  },
]);
