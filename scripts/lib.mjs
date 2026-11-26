// Shared helpers for the repo scripts. Plain Node, no dependencies.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const serverDir = join(root, 'apps', 'server');
export const uiDir = join(root, 'apps', 'ui');
export const uiDist = join(uiDir, 'dist');
export const serverOutput = join(serverDir, '.mastra', 'output');

/** Load the repository-root .env into process.env (existing variables win). */
export function loadRootEnv() {
  const file = join(root, '.env');
  if (existsSync(file)) process.loadEnvFile(file);
  // The Factory's PostHog telemetry is off unless you opt in.
  process.env.MASTRA_TELEMETRY_DISABLED ??= '1';
}

// Each workspace has its own node_modules/.bin (bun's isolated installs).
const bin = (name, cwd) => join(cwd, 'node_modules', '.bin', name);

/** Run a binary from node_modules/.bin; resolves on exit 0, rejects otherwise. */
export function run(name, args, { cwd = root, env = {} } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin(name, cwd), args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
    child.on('exit', code => (code === 0 ? resolvePromise() : reject(new Error(`${name} exited with ${code}`))));
  });
}

/** Start long-running processes; stop all of them when one exits or on Ctrl-C. */
export function runAll(processes) {
  const children = processes.map(({ name, args, cwd, env }) =>
    spawn(bin(name, cwd), args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' }),
  );
  const stop = code => {
    for (const child of children) child.kill('SIGTERM');
    process.exit(code ?? 0);
  };
  for (const child of children) child.on('exit', code => stop(code));
  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
}

export function buildUi() {
  return run('vite', ['build', '--config', 'src/vite.config.ts'], { cwd: uiDir, env: { MASTRACODE_ENV_DIR: root } });
}
