import { beforeEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import {
  __resetDbForTests,
  count,
  enqueueActivity,
  enqueueAttendance,
  enqueueGrade,
  enqueueNote,
  peek,
  remove,
} from './outbox';
import { flushOutbox } from './flushOutbox';

vi.mock('@/shared/db/supabase', () => ({
  supabase: {
    from: (_table: string) => ({
      upsert: vi.fn(async (row: unknown) => ({ data: row, error: null })),
      insert: vi.fn(async (row: unknown) => ({ data: row, error: null })),
    }),
  },
}));

describe('outbox multi-entity', () => {
  beforeEach(async () => {
    await __resetDbForTests();
  });

  it('enqueues 4 entity types with distinct tables', async () => {
    await enqueueAttendance({ sessionId: 's1', studentId: 'st1', status: 'hadir' });
    await enqueueNote({ noteId: 'n1', userId: 'u', title: 't', body: 'b', kind: 'personal' });
    await enqueueGrade({ userId: 'u', componentId: 'c1', studentId: 'st1', score: 90 });
    await enqueueActivity({ userId: 'u', sessionId: 's1', type: 'quiz', title: 'Quiz' });
    const rows = await peek();
    const tables = new Set(rows.map((r) => r.table));
    expect(tables).toEqual(
      new Set(['attendance_records', 'notes', 'grades', 'session_activities']),
    );
    expect(await count()).toBe(4);
  });

  it('sets op per entity (upsert vs insert)', async () => {
    await enqueueNote({ noteId: 'n1', userId: 'u', title: 't', body: 'b', kind: 'personal' });
    await enqueueActivity({ userId: 'u', sessionId: 's1', type: 'note', title: 'x' });
    const rows = await peek();
    const note = rows.find((r) => r.table === 'notes');
    const activity = rows.find((r) => r.table === 'session_activities');
    expect(note?.op).toBe('upsert');
    expect(activity?.op).toBe('insert');
  });
});

describe('flushOutbox multi-entity', () => {
  beforeEach(async () => {
    await __resetDbForTests();
    const rows = await peek();
    for (const r of rows) if (r.id !== undefined) await remove(r.id);
  });

  it('drains all entity types when online', async () => {
    await enqueueAttendance({ sessionId: 's1', studentId: 'st1', status: 'hadir' });
    await enqueueNote({ noteId: 'n1', userId: 'u', title: 't', body: 'b', kind: 'personal' });
    await enqueueGrade({ userId: 'u', componentId: 'c1', studentId: 'st1', score: 90 });
    await enqueueActivity({ userId: 'u', sessionId: 's1', type: 'quiz', title: 'Quiz' });
    const result = await flushOutbox();
    expect(result.flushed).toBe(4);
    expect(result.remaining).toBe(0);
    expect(await count()).toBe(0);
  });

  it('flushes in dependency order (activities before grades)', async () => {
    const order: string[] = [];
    const { supabase } = await import('@/shared/db/supabase');
    vi.spyOn(supabase, 'from').mockImplementation(
      (table: string) =>
        ({
          upsert: vi.fn(async () => {
            order.push(table);
            return { data: null, error: null };
          }),
          insert: vi.fn(async () => {
            order.push(table);
            return { data: null, error: null };
          }),
        }) as unknown as ReturnType<typeof supabase.from>,
    );
    await enqueueGrade({ userId: 'u', componentId: 'c1', studentId: 'st1', score: 90 });
    await enqueueActivity({ userId: 'u', sessionId: 's1', type: 'quiz', title: 'Quiz' });
    await flushOutbox();
    expect(order.indexOf('session_activities')).toBeLessThan(order.indexOf('grades'));
  });

  it('keeps failed rows and increments attempts', async () => {
    const { supabase } = await import('@/shared/db/supabase');
    const upsert = vi.fn(async () => ({ data: null, error: { message: 'fail' } }));
    const insert = vi.fn(async () => ({ data: null, error: { message: 'fail' } }));
    vi.spyOn(supabase, 'from').mockImplementation(
      () => ({ upsert, insert }) as unknown as ReturnType<typeof supabase.from>,
    );
    await enqueueAttendance({ sessionId: 's1', studentId: 'st1', status: 'hadir' });
    const result = await flushOutbox();
    expect(result.flushed).toBe(0);
    expect(result.remaining).toBe(1);
    const [row] = await peek();
    expect(row?.attempts).toBe(1);
  });
});
