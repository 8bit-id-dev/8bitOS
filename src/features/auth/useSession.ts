import { useEffect } from 'react';
import { create } from 'zustand';

export interface SessionUser {
  id: string;
  email: string | null;
}

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  setUser: (u: SessionUser | null) => void;
  setLoading: (b: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useSession = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return {
    user,
    isLoading,
    signIn: async () => ({ data: null, error: null as null | { message: string } }),
    signUp: async () => ({ data: null, error: null as null | { message: string } }),
    signOut: () => undefined,
  };
};
