import { describe, expect, it } from 'vitest';

import { createAppDatabase } from '../db/connection';

describe('database initialization', () => {
  it('creates account and event tables', () => {
    const db = createAppDatabase(':memory:');
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as Array<{ name: string }>;

    expect(tables.some((table) => table.name === 'account_snapshot')).toBe(true);
    expect(tables.some((table) => table.name === 'ledger_events')).toBe(true);
  });

  it('seeds the single account with the initial balance', () => {
    const db = createAppDatabase(':memory:');
    const account = db
      .prepare(
        'SELECT balance, streak_count, shield_stock FROM account_snapshot WHERE account_id = ?',
      )
      .get('primary') as {
        balance: number;
        streak_count: number;
        shield_stock: number;
      };

    expect(account.balance).toBe(100);
    expect(account.streak_count).toBe(0);
    expect(account.shield_stock).toBe(0);
  });
});
