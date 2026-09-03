const requireEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  insforgeUrl: requireEnv('VITE_INSFORGE_URL'),
  insforgeAnonKey: requireEnv('VITE_INSFORGE_ANON_KEY'),
} as const;
