/**
 * Your own HTTP routes, served by the Factory server next to its API.
 * Routes must not use the reserved `/api` prefix.
 */
import { registerApiRoute } from '@mastra/core/server';

export const customRoutes = [
  registerApiRoute('/custom/health', {
    method: 'GET',
    requiresAuth: false,
    handler: c => c.json({ ok: true }),
  }),
];
