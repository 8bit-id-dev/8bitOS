import { describe, expect, it } from 'vitest';
import {
  addWeeks,
  formatWeekRange,
  planProgress,
  weekStartFor,
} from './planner.helpers';
import type { Plan } from '@/shared/db/types';

const plan = (status: Plan['status']): Plan =>
  ({
    id: 'p1',
    user_id: 'u1',
    class_id: null,
    subject_id: null,
    week_start: '2026-09-07',
    topic: 'Integral',
    goals: '',
    method: '',
    media: '',
    activities: '',
    reflection: '',
    status,
    created_at: '',
    updated_at: '',
  }) as Plan;

describe('planner.helpers', () => {
  it('weekStartFor returns Monday for a midweek date', () => {
    // 2026-09-03 is Thursday in Jakarta; Monday is 2026-08-31.
    expect(weekStartFor(new Date('2026-09-03T02:00:00Z'))).toBe('2026-08-31');
  });

  it('weekStartFor rolls Sunday back to previous Monday', () => {
    // 2026-09-06 is Sunday; Monday is 2026-08-31.
    expect(weekStartFor(new Date('2026-09-06T02:00:00Z'))).toBe('2026-08-31');
  });

  it('addWeeks moves by 7-day steps', () => {
    expect(addWeeks('2026-08-31', 1)).toBe('2026-09-07');
    expect(addWeeks('2026-08-31', -1)).toBe('2026-08-24');
  });

  it('formatWeekRange renders start–end', () => {
    expect(formatWeekRange('2026-08-31')).toContain('–');
    expect(formatWeekRange('2026-08-31')).toContain('2026');
  });

  it('planProgress counts non-draft plans as ready', () => {
    const plans = [plan('draft'), plan('ready'), plan('done')];
    expect(planProgress(plans)).toEqual({ ready: 2, total: 3 });
  });
});
