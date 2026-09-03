import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AttendanceStatus } from './types';

export interface AttendanceUpsert {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export type OutboxOp = 'upsert';

export interface OutboxRow {
  id: number;
  table: 'attendance_records';
  op: OutboxOp;
  payload: AttendanceUpsert;
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

const enqueue = async (table: OutboxRow['table'], payload: OutboxRow['payload']): Promise<void> => {
  const db = await getDb();
  await db.add(STORE, {
    table,
    op: 'upsert',
    payload,
    attempts: 0,
    created_at: new Date().toISOString(),
  });
};

export const enqueueAttendance = (payload: AttendanceUpsert): Promise<void> =>
  enqueue('attendance_records', payload);

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
