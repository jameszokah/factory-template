// Local development.
//   bun run dev      Factory server on :4111 serving your built UI (rebuilt on start).
//   bun run dev:ui   API on :4111 + Vite on :5173 with hot reload. Open :5173.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { buildUi, loadRootEnv, runAll, root, serverDir, uiDir, uiDist } from './lib.mjs';

loadRootEnv();
const hmr = process.argv.includes('--hmr');
const apiPort = process.env.PORT ?? '4111';
const envFile = join(root, '.env');
const serverArgs = ['factory', 'dev', ...(existsSync(envFile) ? ['--env', envFile] : [])];

if (hmr) {
  const uiPort = process.env.MASTRACODE_UI_PORT ?? '5173';
  const publicUrl = process.env.MASTRACODE_PUBLIC_URL ?? `http://localhost:${uiPort}`;
  runAll([
    {
      name: 'mastra',
      args: serverArgs,
      cwd: serverDir,
      // The Vite server serves the UI here, so the API server must not serve one.
      env: { PORT: apiPort, MASTRACODE_PUBLIC_URL: publicUrl, MASTRACODE_UI_DIST: uiDist },
    },
    {
      name: 'vite',
      args: ['--config', 'src/vite.config.ts'],
      cwd: uiDir,
      env: {
        MASTRACODE_ENV_DIR: root,
        MASTRACODE_UI_PORT: uiPort,
        MASTRACODE_API_TARGET: `http://localhost:${apiPort}`,
        MASTRACODE_PUBLIC_URL: publicUrl,
      },
    },
  ]);
} else {
  await buildUi();
  runAll([
    {
      name: 'mastra',
      args: serverArgs,
      cwd: serverDir,
      env: { PORT: apiPort, MASTRACODE_UI_DIST: uiDist },
    },
  ]);
}
