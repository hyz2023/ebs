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

    response.json({
      account: {
        accountId: row.account_id,
        balance: row.balance,
        streakCount: row.streak_count,
        shieldStock: row.shield_stock,
        lastSettlementDate: row.last_settlement_date,
      },
    });
  });

  return router;
}
