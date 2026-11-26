// Production build: your UI + the Factory server in apps/server/.mastra/output.
//
// `mastra build` copies the UI bundled inside the Mastra CLI into the output.
// We then replace it with your own UI build, so the output serves your UI.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { buildUi, loadRootEnv, run, serverDir, serverOutput, uiDist } from './lib.mjs';

loadRootEnv();
await buildUi();
await run('mastra', ['build'], { cwd: serverDir });

const target = join(serverOutput, 'factory');
rmSync(target, { recursive: true, force: true });
cpSync(uiDist, target, { recursive: true });
if (!existsSync(join(target, 'index.html'))) throw new Error(`UI copy failed: ${target}/index.html missing`);
console.log(`Your UI is in ${target}`);
