const requireEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
} as const;
