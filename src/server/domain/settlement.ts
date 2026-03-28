import Database from 'better-sqlite3';

import { APP_CONFIG } from '../config';

import {
  calculateSettlementAmount,
  calculateSettlementLevel,
  getMilestoneReward,
} from './rules';
import type { AccountSnapshot, LedgerEventSummary } from './types';

type SettleDayInput = {
  eventDate: string;
  missedItems: string[];
  severeViolation: boolean;
  consumeShield?: boolean;
  note: string | null;
};

type SettleDayResult = {
  level: 1 | 2 | 3;
  amountDelta: number;
  account: AccountSnapshot;
  events: LedgerEventSummary[];
};

type AccountRow = {
  account_id: string;
  balance: number;
  streak_count: number;
  shield_stock: number;
  last_settlement_date: string | null;
};

function toAccountSnapshot(row: AccountRow): AccountSnapshot {
  return {
    accountId: row.account_id,
    balance: row.balance,
    streakCount: row.streak_count,
    shieldStock: row.shield_stock,
    lastSettlementDate: row.last_settlement_date,
  };
}

export function settleDay(
  db: Database.Database,
  input: SettleDayInput,
): SettleDayResult {
  const transaction = db.transaction((payload: SettleDayInput) => {
    const row = db
      .prepare(
        `
          SELECT account_id, balance, streak_count, shield_stock, last_settlement_date
          FROM account_snapshot
          WHERE account_id = ?
        `,
      )
      .get(APP_CONFIG.primaryAccountId) as AccountRow | undefined;

    if (!row) {
      throw new Error('Primary account not found');
    }

    // Check ledger_events table for existing settlement (not just last_settlement_date)
    const existingSettlement = db
      .prepare(
        `SELECT 1 FROM ledger_events
         WHERE account_id = ? AND event_date = ? AND event_type = 'DAILY_SETTLEMENT'`,
      )
      .get(row.account_id, payload.eventDate);

    if (existingSettlement) {
      throw new Error('Settlement already recorded for this date');
    }

    const level = calculateSettlementLevel({
      missedItems: payload.missedItems,
      severeViolation: payload.severeViolation,
    });
    const amountDelta = calculateSettlementAmount({
      level,
      eventDate: payload.eventDate,
    });

    let nextBalance = row.balance + amountDelta;
    let nextStreak = row.streak_count;
    let nextShield = row.shield_stock;

    if (level === 1) {
      nextStreak += 1;
    } else if (level === 2) {
      if (payload.consumeShield && nextShield > 0) {
        nextShield -= 1;
      } else {
        nextStreak = 0;
      }
    } else {
      nextStreak = 0;
    }

    const events: LedgerEventSummary[] = [];
    const insertEvent = db.prepare(
      `
        INSERT INTO ledger_events (
          account_id,
          event_date,
          event_type,
          amount_delta,
          balance_after,
          streak_after,
          shield_after,
          level,
          missed_items,
          note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );

    insertEvent.run(
      row.account_id,
      payload.eventDate,
      'DAILY_SETTLEMENT',
      amountDelta,
      nextBalance,
      nextStreak,
      nextShield,
      level,
      JSON.stringify(payload.missedItems),
      payload.note,
    );
    events.push({
      eventType: 'DAILY_SETTLEMENT',
      amountDelta,
      balanceAfter: nextBalance,
      streakAfter: nextStreak,
      shieldAfter: nextShield,
    });

    if (level === 2 && payload.consumeShield && row.shield_stock > 0) {
      insertEvent.run(
        row.account_id,
        payload.eventDate,
        'SHIELD_CONSUMED',
        0,
        nextBalance,
        nextStreak,
        nextShield,
        level,
        JSON.stringify(payload.missedItems),
        payload.note,
      );
      events.push({
        eventType: 'SHIELD_CONSUMED',
        amountDelta: 0,
        balanceAfter: nextBalance,
        streakAfter: nextStreak,
        shieldAfter: nextShield,
      });
    }

    const milestone = getMilestoneReward(nextStreak);
    if (milestone) {
      if (milestone.eventType === 'STREAK_REWARD') {
        nextBalance += milestone.amountDelta;
        insertEvent.run(
          row.account_id,
          payload.eventDate,
          milestone.eventType,
          milestone.amountDelta,
          nextBalance,
          nextStreak,
          nextShield,
          null,
          null,
          payload.note,
        );
        events.push({
          eventType: milestone.eventType,
          amountDelta: milestone.amountDelta,
          balanceAfter: nextBalance,
          streakAfter: nextStreak,
          shieldAfter: nextShield,
        });

        if (nextStreak === 21) {
          nextStreak = 0;
        }
      } else if (milestone.eventType === 'SHIELD_GRANTED') {
        nextShield += 1;
        insertEvent.run(
          row.account_id,
          payload.eventDate,
          milestone.eventType,
          0,
          nextBalance,
          nextStreak,
          nextShield,
          null,
          null,
          payload.note,
        );
        events.push({
          eventType: milestone.eventType,
          amountDelta: 0,
          balanceAfter: nextBalance,
          streakAfter: nextStreak,
          shieldAfter: nextShield,
        });
      }
    }

    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, streak_count = ?, shield_stock = ?, last_settlement_date = ?
        WHERE account_id = ?
      `,
    ).run(
      nextBalance,
      nextStreak,
      nextShield,
      payload.eventDate,
      row.account_id,
    );

    return {
      level,
      amountDelta,
      account: {
        accountId: row.account_id,
        balance: nextBalance,
        streakCount: nextStreak,
        shieldStock: nextShield,
        lastSettlementDate: payload.eventDate,
      },
      events,
    };
  });

  return transaction(input);
}
