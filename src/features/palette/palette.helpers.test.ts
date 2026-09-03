import { describe, expect, it } from 'vitest';
import { fuzzyScore, rankItems, type PaletteItem } from './palette.helpers';

const item = (label: string, group = 'NAV', keywords = ''): PaletteItem => ({
  id: label,
  label,
  group,
  keywords,
});

describe('palette.helpers', () => {
  it('empty query matches everything neutrally', () => {
    expect(fuzzyScore('', 'anything')).toBe(1);
    expect(fuzzyScore('   ', 'anything')).toBe(1);
  });

  it('prefix match scores highest', () => {
    const prefix = fuzzyScore('abs', 'absensi');
    const contains = fuzzyScore('abs', 'buka absensi');
    const subseq = fuzzyScore('abs', 'ambil siswa baru');
    expect(prefix).toBeGreaterThan(contains);
    expect(contains).toBeGreaterThan(subseq);
    expect(subseq).toBeGreaterThan(0);
  });

  it('no match returns 0', () => {
    expect(fuzzyScore('xyz', 'absensi')).toBe(0);
  });

  it('rankItems sorts by score and limits', () => {
    const items = [
      item('Absensi'),
      item('Buka Absensi XI'),
      item('Planner Mingguan'),
      item('Notes Baru'),
    ];
    const ranked = rankItems('abs', items, 2);
    expect(ranked.length).toBe(2);
    expect(ranked[0]?.label).toBe('Absensi');
    expect(ranked[1]?.label).toBe('Buka Absensi XI');
  });

  it('rankItems uses keywords with lower weight', () => {
    const items = [
      item('Planner', 'NAV', 'rencana jadwal minggu'),
      item('Jadwal Hari Ini', 'NAV', ''),
    ];
    const ranked = rankItems('jadwal', items);
    expect(ranked[0]?.label).toBe('Jadwal Hari Ini');
  });

  it('rankItems empty query returns first N items', () => {
    const items = [item('a'), item('b'), item('c'), item('d')];
    expect(rankItems('', items, 3).length).toBe(3);
  });
});
