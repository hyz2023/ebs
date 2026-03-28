import { Router } from 'express';
import Database from 'better-sqlite3';

type AccountRow = {
  account_id: string;
  balance: number;
  streak_count: number;
  shield_stock: number;
  last_settlement_date: string | null;
};

export function createAccountRouter(db: Database.Database) {
  const router = Router();

  router.get('/', (_request, response) => {
    const row = db
      .prepare(
        `
          SELECT account_id, balance, streak_count, shield_stock, last_settlement_date
          FROM account_snapshot
          WHERE account_id = ?
        `,
      )
      .get('primary') as AccountRow;

    // Fetch all dates that already have a DAILY_SETTLEMENT event
    const settledRows = db
      .prepare(
        `SELECT DISTINCT event_date FROM ledger_events
         WHERE account_id = ? AND event_type = 'DAILY_SETTLEMENT'
         ORDER BY event_date`,
      )
      .all('primary') as Array<{ event_date: string }>;

    response.json({
      account: {
        accountId: row.account_id,
        balance: row.balance,
        streakCount: row.streak_count,
        shieldStock: row.shield_stock,
        lastSettlementDate: row.last_settlement_date,
        settledDates: settledRows.map((r) => r.event_date),
      },
    });
  });

  return router;
}
