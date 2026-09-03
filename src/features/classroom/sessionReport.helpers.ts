import type { AttendanceRecord, AttendanceStatus } from '@/shared/db/types';

export interface ReportCounts {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  marked: number;
  unmarked: number;
}

export const attendanceCounts = (records: AttendanceRecord[]): ReportCounts => {
  const acc: Record<AttendanceStatus, number> = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
  for (const r of records) acc[r.status] += 1;
  const marked = records.length;
  return {
    ...acc,
    marked,
    unmarked: 0, // filled by caller with roster size
  };
};

export const withUnmarked = (counts: ReportCounts, rosterSize: number): ReportCounts => ({
  ...counts,
  unmarked: Math.max(0, rosterSize - counts.marked),
});

export const sessionDurationLabel = (
  startIso: string,
  endIso: string | null | undefined,
): string => {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const mins = Math.max(0, Math.round((end - start) / 60_000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
};
