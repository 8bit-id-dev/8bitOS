import { create } from 'zustand';
import { supabase } from '@/shared/db/supabase';

export interface SessionUser {
  id: string;
  email: string | null;
}

const DEMO_EMAIL = 'demo.8bitos@gmail.com';
const DEMO_PASSWORD = '8bitos-demo-2026';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  started: boolean;
  setUser: (u: SessionUser | null) => void;
  setDone: () => void;
  ensureStarted: () => void;
}

const setSessionUser = (user: { id: string; email?: string | null } | null) => {
  useAuthStore.setState({
    user: user ? { id: user.id, email: user.email ?? null } : null,
    isLoading: false,
    started: true,
  });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  started: false,
  setUser: (user) => set({ user }),
  setDone: () => set({ isLoading: false }),
  ensureStarted: () => {
    if (get().started) return;
    set({ started: true });

    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionUser(session.user);
          return;
        }

        const { data: signIn } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (signIn.session) {
          setSessionUser(signIn.user);
          return;
        }

        const { data: signUp } = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (signUp.session) {
          setSessionUser(signUp.user);
          return;
        }

        // Email confirmation likely ON or network unavailable — stop blocking the UI.
        useAuthStore.setState({ user: null, isLoading: false });
      } catch {
        useAuthStore.setState({ user: null, isLoading: false });
      }
    })();
  },
}));

export const useSession = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const ensureStarted = useAuthStore((s) => s.ensureStarted);

  ensureStarted();

  return {
    user,
    isLoading,
    signIn: async () => ({ data: null, error: null as null | { message: string } }),
    signUp: async () => ({ data: null, error: null as null | { message: string } }),
    signOut: () => undefined,
  };
};
