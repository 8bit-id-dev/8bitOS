import type { ClassRow, ClassSession, ScheduleSlot, Subject } from '@/shared/db/types';

export interface JoinedSlot {
  slot: ScheduleSlot;
  classRow: ClassRow;
  subject: Subject;
}

export interface JoinedSession extends ClassSession {
  classRow: ClassRow;
  subject: Subject;
}

export const sortSlotsByStart = (slots: JoinedSlot[]): JoinedSlot[] =>
  [...slots].sort((a, b) => a.slot.start_time.localeCompare(b.slot.start_time));

export const findNextSlot = (
  slots: JoinedSlot[],
  nowJakarta: { hhmm: string },
): JoinedSlot | null => {
  const upcoming = sortSlotsByStart(slots).find((s) => s.slot.start_time >= nowJakarta.hhmm);
  return upcoming ?? null;
};

export const findActiveSession = (
  sessions: JoinedSession[],
  nowJakarta: { hhmm: string },
): JoinedSession | null => {
  return sessions.find((s) => {
    const start = new Date(s.scheduled_for).toISOString().substring(11, 16);
    return s.status === 'active' && start <= nowJakarta.hhmm;
  }) ?? null;
};
