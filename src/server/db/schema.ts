import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_snapshot (
      account_id TEXT PRIMARY KEY,
      balance REAL NOT NULL,
      streak_count INTEGER NOT NULL,
      shield_stock INTEGER NOT NULL,
      last_settlement_date TEXT
    );

    CREATE TABLE IF NOT EXISTS ledger_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_type TEXT NOT NULL,
      amount_delta REAL NOT NULL,
      balance_after REAL NOT NULL,
      streak_after INTEGER NOT NULL,
      shield_after INTEGER NOT NULL,
      level INTEGER,
      missed_items TEXT,
      reason TEXT,
      source TEXT,
      note TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_events_account_date
      ON ledger_events (account_id, event_date DESC);
  `);
}
