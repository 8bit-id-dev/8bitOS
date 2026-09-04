// SessionContext — active teaching session state, visible globally
// (Dokumen 06 §3 Session-Based Teaching, §4 CURRENT SESSION, §19 Context Preservation)
import { create } from 'zustand';

export interface ActiveSession {
  sessionId: string;
  classId: string;
  className: string;
  subjectName: string;
  startedAtIso: string;
}

interface SessionContextState {
  active: ActiveSession | null;
  start: (s: ActiveSession) => void;
  end: () => void;
}

const STORAGE_KEY = '8bithos:active-session';

const restore = (): ActiveSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveSession) : null;
  } catch {
    return null;
  }
};

const persist = (s: ActiveSession | null) => {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort
  }
};

export const useSessionContext = create<SessionContextState>((set) => ({
  active: restore(),
  start: (s) => {
    persist(s);
    set({ active: s });
  },
  end: () => {
    persist(null);
    set({ active: null });
  },
}));

// Elapsed label for the persistent indicator (e.g. "42:18")
export const elapsedLabel = (startedAtIso: string, nowMs?: number): string => {
  const start = new Date(startedAtIso).getTime();
  const now = nowMs ?? Date.now();
  const total = Math.max(0, Math.floor((now - start) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
