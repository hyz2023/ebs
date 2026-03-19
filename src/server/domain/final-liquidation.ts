import Database from 'better-sqlite3';

import { APP_CONFIG } from '../config';

function getAccount(db: Database.Database) {
  return db
    .prepare(
      `
        SELECT account_id, balance, streak_count, shield_stock, last_settlement_date
        FROM account_snapshot
        WHERE account_id = ?
      `,
    )
    .get(APP_CONFIG.primaryAccountId) as {
    account_id: string;
    balance: number;
    streak_count: number;
    shield_stock: number;
    last_settlement_date: string | null;
  };
}

export function previewFinalLiquidation(
  db: Database.Database,
  eventDate: string,
) {
  const account = getAccount(db);
  const shieldConversion = account.shield_stock * 30;
  const finalBalance = account.balance + shieldConversion;

  return {
    preview: {
      eventDate,
      balance: account.balance,
      shieldStock: account.shield_stock,
      shieldConversion,
      finalBalance,
    },
  };
}

export function executeFinalLiquidation(
  db: Database.Database,
  eventDate: string,
) {
  const existing = db
    .prepare(
      `
        SELECT id
        FROM ledger_events
        WHERE event_type = 'FINAL_LIQUIDATION'
        LIMIT 1
      `,
    )
    .get();

  if (existing) {
    throw new Error('Final liquidation has already been executed');
  }

  const transaction = db.transaction((date: string) => {
    const preview = previewFinalLiquidation(db, date);
    const account = getAccount(db);

    db.prepare(
      `
        INSERT INTO ledger_events (
          account_id,
          event_date,
          event_type,
          amount_delta,
          balance_after,
          streak_after,
          shield_after,
          reason,
          source,
          metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      account.account_id,
      date,
      'FINAL_LIQUIDATION',
      preview.preview.shieldConversion,
      preview.preview.finalBalance,
      account.streak_count,
      account.shield_stock,
      'Final liquidation',
      'system',
      JSON.stringify(preview.preview),
    );

    return preview;
  });

  return transaction(eventDate);
}
