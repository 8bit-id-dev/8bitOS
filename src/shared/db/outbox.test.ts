import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { enqueueAttendance, peek, remove, count, __resetDbForTests } from './outbox';
import type { AttendanceUpsert } from './outbox';

const sample: AttendanceUpsert = {
  sessionId: 'sess-1',
  studentId: 'stud-1',
  status: 'hadir',
};

describe('outbox', () => {
  beforeEach(async () => {
    await __resetDbForTests();
    const rows = await peek();
    for (const r of rows) await remove(r.id);
  });

  it('enqueues and peeks rows', async () => {
    await enqueueAttendance(sample);
    expect(await count()).toBe(1);
    const rows = await peek();
    expect(rows[0]?.table).toBe('attendance_records');
    expect(rows[0]?.op).toBe('upsert');
    expect(rows[0]?.payload).toEqual(sample);
  });

  it('removes a row', async () => {
    await enqueueAttendance(sample);
    const rows = await peek();
    await remove(rows[0]!.id);
    expect(await count()).toBe(0);
  });
});
