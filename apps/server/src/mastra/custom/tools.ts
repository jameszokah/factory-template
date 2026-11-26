/**
 * Your own tools, available to every Factory session.
 *
 * Example:
 *
 *   import { createTool } from '@mastra/core/tools';
 *   import { z } from 'zod';
 *
 *   export const tools = {
 *     ping: createTool({
 *       id: 'ping',
 *       description: 'Reply with pong',
 *       inputSchema: z.object({}),
 *       execute: async () => ({ reply: 'pong' }),
 *     }),
 *   };
 */
export const tools = {};
