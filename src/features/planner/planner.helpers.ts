import type { Plan } from '@/shared/db/types';

// Monday-based ISO week start (YYYY-MM-DD) in Asia/Jakarta.
export const weekStartFor = (date: Date): string => {
  const jakarta = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const [y, m, d] = jakarta.split('-').map((v) => Number(v));
  const local = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1));
  const dow = local.getUTCDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow; // back to Monday
  local.setUTCDate(local.getUTCDate() + diff);
  return local.toISOString().slice(0, 10);
};

export const addWeeks = (weekStart: string, delta: number): string => {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta * 7);
  return d.toISOString().slice(0, 10);
};

export const formatWeekRange = (weekStart: string): string => {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
};

export const planProgress = (plans: Plan[]): { ready: number; total: number } => {
  return { ready: plans.filter((p) => p.status !== 'draft').length, total: plans.length };
};

export const planLabel = (plan: Plan): string => {
  const topic = plan.topic.trim();
  return topic.length > 0 ? topic : '(tanpa topik)';
};
