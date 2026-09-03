import { createClient } from '@insforge/sdk';
import { env } from '@/shared/lib/env';

export const insforge = createClient({
  baseUrl: env.insforgeUrl,
  anonKey: env.insforgeAnonKey,
});

export type InsforgeClient = typeof insforge;
