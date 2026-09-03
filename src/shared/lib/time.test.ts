import { describe, expect, it } from 'vitest';
import { todayInJakarta, formatJakartaTime, formatJakartaDate, daysOfWeek } from './time';

describe('todayInJakarta', () => {
  it('returns YYYY-MM-DD in Asia/Jakarta', () => {
    const utcMidnightJakarta = new Date('2026-08-31T17:00:00.000Z');
    expect(todayInJakarta(utcMidnightJakarta)).toEqual({
      dateKey: '2026-09-01',
      dayOfWeek: 2,
    });
  });

  it('rolls date forward when UTC is past midnight Jakarta', () => {
    const lateUtc = new Date('2026-08-31T23:30:00.000Z');
    expect(todayInJakarta(lateUtc).dateKey).toBe('2026-09-01');
  });
});

describe('formatJakartaTime', () => {
  it('formats HH:mm 24-hour', () => {
    const iso = '2026-09-01T01:08:00.000Z';
    expect(formatJakartaTime(iso)).toBe('08:08');
  });
});

describe('formatJakartaDate', () => {
  it('renders Indonesian long date', () => {
    const iso = '2026-08-30T17:00:00.000Z';
    expect(formatJakartaDate(iso)).toBe('SENIN, 31 AGUSTUS 2026');
  });
});

describe('daysOfWeek', () => {
  it('is a 7-element array starting with MINGGU', () => {
    expect(daysOfWeek).toHaveLength(7);
    expect(daysOfWeek[0]).toBe('MINGGU');
    expect(daysOfWeek[1]).toBe('SENIN');
  });
});
