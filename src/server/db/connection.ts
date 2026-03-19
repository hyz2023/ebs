import Database from 'better-sqlite3';

import { initializeSchema } from './schema';
import { seedDefaultAccount } from './seed';

export function createAppDatabase(filename: string) {
  const db = new Database(filename);
  initializeSchema(db);
  seedDefaultAccount(db);
  return db;
}
