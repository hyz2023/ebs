import Database from 'better-sqlite3';

type LedgerRow = {
  id: number;
  event_date: string;
  event_type: string;
  amount_delta: number;
  balance_after: number;
  streak_after: number;
  shield_after: number;
  level: number | null;
  missed_items: string | null;
  reason: string | null;
  source: string | null;
  note: string | null;
  metadata_json: string | null;
};

export function getLedgerReport(db: Database.Database) {
  const rows = db
    .prepare(
      `
        SELECT
          id,
          event_date,
          event_type,
          amount_delta,
          balance_after,
          streak_after,
          shield_after,
          level,
          missed_items,
          reason,
          source,
          note,
          metadata_json
        FROM ledger_events
        ORDER BY event_date DESC, id DESC
      `,
    )
    .all() as LedgerRow[];

  return {
    items: rows.map((row) => ({
      id: row.id,
      eventDate: row.event_date,
      eventType: row.event_type,
      amountDelta: row.amount_delta,
      balanceAfter: row.balance_after,
      streakAfter: row.streak_after,
      shieldAfter: row.shield_after,
      level: row.level,
      missedItems: row.missed_items ? JSON.parse(row.missed_items) : [],
      reason: row.reason,
      source: row.source,
      note: row.note,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null,
    })),
  };
}

export function getCalendarReport(db: Database.Database, month: string) {
  const start = `${month}-01`;
  const end = `${month}-31`;
  const rows = db
    .prepare(
      `
        SELECT
          event_date,
          MAX(CASE WHEN event_type = 'DAILY_SETTLEMENT' THEN level END) AS level,
          MAX(CASE WHEN event_type = 'SHIELD_CONSUMED' THEN 1 ELSE 0 END) AS used_shield,
          MAX(CASE WHEN event_type = 'EXTERNAL_ADJUSTMENT' THEN 1 ELSE 0 END) AS has_external_adjustment,
          MAX(note) AS note
        FROM ledger_events
        WHERE event_date >= ? AND event_date <= ?
        GROUP BY event_date
        ORDER BY event_date ASC
      `,
    )
    .all(start, end) as Array<{
      event_date: string;
      level: number | null;
      used_shield: number;
      has_external_adjustment: number;
      note: string | null;
    }>;

  return {
    days: rows.map((row) => ({
      date: row.event_date,
      level: row.level,
      usedShield: Boolean(row.used_shield),
      hasExternalAdjustment: Boolean(row.has_external_adjustment),
      note: row.note,
    })),
  };
}

export function getAssetsReport(db: Database.Database) {
  const balancePoints = db
    .prepare(
      `
        SELECT event_date, balance_after AS balance
        FROM ledger_events
        WHERE id IN (
          SELECT MAX(id)
          FROM ledger_events
          GROUP BY event_date
        )
        ORDER BY event_date ASC
      `,
    )
    .all() as Array<{ event_date: string; balance: number }>;

  const rows = db
    .prepare(
      `
        SELECT event_type, amount_delta
        FROM ledger_events
      `,
    )
    .all() as Array<{ event_type: string; amount_delta: number }>;

  const baseRewards = rows
    .filter((row) => row.event_type === 'DAILY_SETTLEMENT')
    .reduce((total, row) => total + row.amount_delta, 0);
  const streakRewards = rows
    .filter((row) => row.event_type === 'STREAK_REWARD')
    .reduce((total, row) => total + row.amount_delta, 0);
  const externalAdjustments = rows
    .filter((row) => row.event_type === 'EXTERNAL_ADJUSTMENT')
    .reduce((total, row) => total + row.amount_delta, 0);
  const shieldEvents = rows.filter((row) => row.event_type === 'SHIELD_GRANTED').length;

  return {
    balancePoints: balancePoints.map((point) => ({
      eventDate: point.event_date,
      balance: point.balance,
    })),
    incomeBreakdown: [
      { key: 'base_rewards', amount: baseRewards },
      { key: 'streak_rewards', amount: streakRewards },
      { key: 'external_adjustments', amount: externalAdjustments },
    ],
    milestoneSummary: {
      shieldGrants: shieldEvents,
    },
  };
}

export function getShieldsReport(db: Database.Database) {
  const rows = db
    .prepare(
      `
        SELECT event_date, event_type, shield_after, note
        FROM ledger_events
        WHERE event_type IN ('SHIELD_GRANTED', 'SHIELD_CONSUMED')
        ORDER BY event_date DESC, id DESC
      `,
    )
    .all() as Array<{
      event_date: string;
      event_type: string;
      shield_after: number;
      note: string | null;
    }>;

  return {
    shieldEvents: rows.map((row) => ({
      eventDate: row.event_date,
      eventType: row.event_type,
      shieldAfter: row.shield_after,
      note: row.note,
    })),
  };
}
