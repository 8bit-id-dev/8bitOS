import { describe, expect, it } from 'vitest';
import {
  attendanceCounts,
  sessionDurationLabel,
  withUnmarked,
} from './sessionReport.helpers';
import type { AttendanceRecord } from '@/shared/db/types';

const rec = (status: AttendanceRecord['status']): AttendanceRecord =>
  ({
    id: 'r',
    session_id: 's',
    student_id: 'st',
    status,
    note: '',
    recorded_at: '',
  }) as AttendanceRecord;

describe('sessionReport.helpers', () => {
  it('attendanceCounts tallies statuses', () => {
    const counts = attendanceCounts([
      rec('hadir'),
      rec('hadir'),
      rec('izin'),
      rec('alpha'),
    ]);
    expect(counts.hadir).toBe(2);
    expect(counts.izin).toBe(1);
    expect(counts.alpha).toBe(1);
    expect(counts.sakit).toBe(0);
    expect(counts.marked).toBe(4);
  });

  it('withUnmarked computes missing students from roster size', () => {
    const counts = attendanceCounts([rec('hadir'), rec('sakit')]);
    const full = withUnmarked(counts, 32);
    expect(full.unmarked).toBe(30);
    expect(withUnmarked(counts, 1).unmarked).toBe(0);
  });

  it('sessionDurationLabel formats hours and minutes', () => {
    expect(sessionDurationLabel('2026-09-03T01:00:00Z', '2026-09-03T01:27:00Z')).toBe('27m');
    expect(sessionDurationLabel('2026-09-03T01:00:00Z', '2026-09-03T02:30:00Z')).toBe('1j 30m');
    expect(sessionDurationLabel('2026-09-03T01:00:00Z', null)).toMatch(/m$/);
  });
});
