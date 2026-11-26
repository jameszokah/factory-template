/** Small helpers for reading environment variables consistently. */

export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`${name} is required. See .env.example at the repository root.`);
  return value;
}

export function listEnv(name: string): string[] {
  return (env(name) ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export const isProduction = process.env.NODE_ENV === 'production';

/** Refuse to boot if the deployment would silently fall back to Mastra Platform services. */
export function assertNoPlatformServices(): void {
  const platformVars = [
    'MASTRA_SHARED_API_URL',
    'MASTRA_PLATFORM_ACCESS_TOKEN',
    'MASTRA_PLATFORM_SECRET_KEY',
  ].filter(name => env(name));
  if (platformVars.length > 0) {
    throw new Error(
      `This Factory is self-hosted and never uses Mastra Platform services. Unset: ${platformVars.join(', ')}.`,
    );
  }
}
