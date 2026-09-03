import { beforeEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { enqueueAttendance, count, peek, remove, __resetDbForTests } from './outbox';
import { flushOutbox } from './flushOutbox';

vi.mock('@/shared/db/insforge', () => ({
  insforge: {
    database: {
      from: (_table: string) => ({
        upsert: vi.fn(async (rows: unknown[]) => ({ data: rows, error: null })),
      }),
    },
  },
}));

describe('flushOutbox', () => {
  beforeEach(async () => {
    await __resetDbForTests();
    const rows = await peek();
    for (const r of rows) if (r.id !== undefined) await remove(r.id);
  });

  it('drains pending attendance rows', async () => {
    await enqueueAttendance({ sessionId: 's1', studentId: 'st1', status: 'hadir' });
    await enqueueAttendance({ sessionId: 's1', studentId: 'st2', status: 'izin' });
    const result = await flushOutbox();
    expect(result.flushed).toBe(2);
    expect(result.remaining).toBe(0);
    expect(await count()).toBe(0);
  });

  it('keeps row when write fails and increments attempts', async () => {
    const { insforge } = await import('@/shared/db/insforge');
    const upsert = vi.fn(async () => ({ data: null, error: { message: 'fail' } }));
    vi.spyOn(insforge.database, 'from').mockImplementation(
      () => ({ upsert } as unknown as ReturnType<typeof insforge.database.from>),
    );
    await enqueueAttendance({ sessionId: 's1', studentId: 'st1', status: 'hadir' });
    const result = await flushOutbox();
    expect(result.flushed).toBe(0);
    expect(result.remaining).toBe(1);
  });
});
