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

// Reset account snapshot
db.exec(`
  UPDATE account_snapshot 
  SET last_settlement_date = NULL,
      balance = 100.0,
      streak_count = 0,
      shield_stock = 0
  WHERE account_id = 'primary'
`);

// Delete today's ledger events
const today = new Date().toISOString().split('T')[0];
db.exec(`
  DELETE FROM ledger_events 
  WHERE event_date = '${today}'
`);

console.log(`✅ Reset complete for ${today}`);
console.log('   - Balance reset to 100');
console.log('   - Streak reset to 0');
console.log('   - Shield reset to 0');
console.log('   - Last settlement date cleared');
console.log('   - Today ledger events deleted');

db.close();
