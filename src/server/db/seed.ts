import Database from 'better-sqlite3';

import { APP_CONFIG } from '../config';

export function seedDefaultAccount(db: Database.Database) {
  const existing = db
    .prepare('SELECT account_id FROM account_snapshot WHERE account_id = ?')
    .get(APP_CONFIG.primaryAccountId);

  if (existing) {
    return;
  }

  db.prepare(
    `
      INSERT INTO account_snapshot (
        account_id,
        balance,
        streak_count,
        shield_stock,
        last_settlement_date
      ) VALUES (?, ?, 0, 0, NULL)
    `,
  ).run(APP_CONFIG.primaryAccountId, APP_CONFIG.initialBalance);
}
