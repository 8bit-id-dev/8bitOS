import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AttendanceStatus, ActivityType } from './types';

// Outbox multi-entitas (Dok 10 §35 Sync Queue): semua mutasi penting
// yang harus survive offline — attendance, notes, grades, activities.

export interface AttendanceUpsert {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface NoteUpsert {
  noteId: string;
  userId: string;
  title: string;
  body: string;
  kind: string;
  classId?: string | null;
  sessionId?: string | null;
}

export interface GradeUpsert {
  userId: string;
  componentId: string;
  studentId: string;
  score: number;
  note?: string;
}

export interface ActivityInsert {
  userId: string;
  sessionId: string;
  type: ActivityType;
  title: string;
  metadata?: Record<string, unknown>;
}

export type OutboxTable = 'attendance_records' | 'notes' | 'grades' | 'session_activities';

export type OutboxPayload = AttendanceUpsert | NoteUpsert | GradeUpsert | ActivityInsert;

export type OutboxOp = 'upsert' | 'insert';

export interface OutboxRow {
  id?: number;
  table: OutboxTable;
  op: OutboxOp;
  payload: OutboxPayload;
  attempts: number;
  created_at: string;
}

interface OutboxSchema extends DBSchema {
  outbox: {
    key: number;
    value: OutboxRow;
    indexes: { 'by-created': string };
  };
}

const DB_NAME = '8bithos-outbox';
const STORE = 'outbox';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OutboxSchema>> | null = null;

export const __resetDbForTests = async (): Promise<void> => {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
};

const getDb = (): Promise<IDBPDatabase<OutboxSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<OutboxSchema>(DB_NAME, VERSION, {
      blocked() {
        // Another tab is holding an old version. We do not handle multi-tab sync in Spec 1.
      },
      blocking() {
        // We are holding an old version while another tab wants to upgrade. Closing the DB lets the other tab proceed.
        if (dbPromise) {
          void dbPromise.then((db) => db.close());
        }
      },
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-created', 'created_at');
        }
      },
    });
  }
  return dbPromise;
};

const enqueue = async (
  table: OutboxTable,
  op: OutboxOp,
  payload: OutboxPayload,
): Promise<void> => {
  const db = await getDb();
  await db.add(STORE, {
    table,
    op,
    payload,
    attempts: 0,
    created_at: new Date().toISOString(),
  });
};

export const enqueueAttendance = (payload: AttendanceUpsert): Promise<void> =>
  enqueue('attendance_records', 'upsert', payload);

export const enqueueNote = (payload: NoteUpsert): Promise<void> =>
  enqueue('notes', 'upsert', payload);

export const enqueueGrade = (payload: GradeUpsert): Promise<void> =>
  enqueue('grades', 'upsert', payload);

export const enqueueActivity = (payload: ActivityInsert): Promise<void> =>
  enqueue('session_activities', 'insert', payload);

export const peek = async (): Promise<OutboxRow[]> => {
  const db = await getDb();
  return db.getAllFromIndex(STORE, 'by-created');
};

export const remove = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.delete(STORE, id);
};

export const incrementAttempts = async (id: number): Promise<void> => {
  const db = await getDb();
  const row = await db.get(STORE, id);
  if (!row) return;
  row.attempts += 1;
  await db.put(STORE, row);
};

export const count = async (): Promise<number> => {
  const db = await getDb();
  return db.count(STORE);
};
