import Database from 'better-sqlite3';

import { APP_CONFIG } from '../config';
import type { AccountSnapshot, LedgerEventSummary } from './types';

type CreateExternalAdjustmentInput = {
  eventDate: string;
  amountDelta: number;
  reason: string;
  source: string;
  note: string | null;
  shieldDelta?: number;
};

type AccountRow = {
  account_id: string;
  balance: number;
  streak_count: number;
  shield_stock: number;
  last_settlement_date: string | null;
};

export function createExternalAdjustment(
  db: Database.Database,
  input: CreateExternalAdjustmentInput,
) {
  const transaction = db.transaction((payload: CreateExternalAdjustmentInput) => {
    const row = db
      .prepare(
        `
          SELECT account_id, balance, streak_count, shield_stock, last_settlement_date
          FROM account_snapshot
          WHERE account_id = ?
        `,
      )
      .get(APP_CONFIG.primaryAccountId) as AccountRow;

    const nextBalance = row.balance + payload.amountDelta;
    const nextShield = row.shield_stock + (payload.shieldDelta ?? 0);

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
          note,
          metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      row.account_id,
      payload.eventDate,
      'EXTERNAL_ADJUSTMENT',
      payload.amountDelta,
      nextBalance,
      row.streak_count,
      nextShield,
      payload.reason,
      payload.source,
      payload.note,
      JSON.stringify({ shieldDelta: payload.shieldDelta ?? 0 }),
    );

    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, shield_stock = ?
        WHERE account_id = ?
      `,
    ).run(nextBalance, nextShield, row.account_id);

    const account: AccountSnapshot = {
      accountId: row.account_id,
      balance: nextBalance,
      streakCount: row.streak_count,
      shieldStock: nextShield,
      lastSettlementDate: row.last_settlement_date,
    };

    const event: LedgerEventSummary & { reason: string; source: string; note: string | null } = {
      eventType: 'EXTERNAL_ADJUSTMENT',
      amountDelta: payload.amountDelta,
      balanceAfter: nextBalance,
      streakAfter: row.streak_count,
      shieldAfter: nextShield,
      reason: payload.reason,
      source: payload.source,
      note: payload.note,
    };

    return { account, event };
  });

  return transaction(input);
}
