#!/usr/bin/env node

import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const dbPath = resolve(process.env.EBS_DB_PATH ?? 'ebs.sqlite');

if (!existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

// Clear all ledger events
db.exec(`DELETE FROM ledger_events`);

// Reset account snapshot to initial state
db.exec(`
  UPDATE account_snapshot 
  SET balance = 100.0,
      streak_count = 0,
      shield_stock = 0,
      last_settlement_date = NULL
  WHERE account_id = 'primary'
`);

console.log('✅ EBS system data cleared');
console.log('   - All ledger events deleted');
console.log('   - Balance reset to 100');
console.log('   - Streak reset to 0');
console.log('   - Shield reset to 0');
console.log('   - Last settlement date cleared');

db.close();
