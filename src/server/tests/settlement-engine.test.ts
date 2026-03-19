import { describe, expect, it } from 'vitest';

import { createAppDatabase } from '../db/connection';
import { settleDay } from '../domain/settlement';

describe('settleDay', () => {
  it('applies a level 1 settlement and increments streak', () => {
    const db = createAppDatabase(':memory:');

    const result = settleDay(db, {
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    expect(result.level).toBe(1);
    expect(result.amountDelta).toBe(25);
    expect(result.account.balance).toBe(125);
    expect(result.account.streakCount).toBe(1);
    expect(result.account.shieldStock).toBe(0);
  });

  it('uses novice protection payout for level 2 within the protected window', () => {
    const db = createAppDatabase(':memory:');

    const result = settleDay(db, {
      eventDate: '2026-03-21',
      missedItems: ['fuel'],
      severeViolation: false,
      note: null,
    });

    expect(result.level).toBe(2);
    expect(result.amountDelta).toBe(25);
    expect(result.account.balance).toBe(125);
    expect(result.account.streakCount).toBe(0);
  });

  it('spends a shield to preserve streak on level 2 when requested', () => {
    const db = createAppDatabase(':memory:');
    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, streak_count = ?, shield_stock = ?
        WHERE account_id = ?
      `,
    ).run(140, 5, 1, 'primary');

    const result = settleDay(db, {
      eventDate: '2026-03-23',
      missedItems: ['environment'],
      severeViolation: false,
      consumeShield: true,
      note: null,
    });

    expect(result.level).toBe(2);
    expect(result.amountDelta).toBe(15);
    expect(result.account.balance).toBe(155);
    expect(result.account.streakCount).toBe(5);
    expect(result.account.shieldStock).toBe(0);
    expect(result.events.some((event) => event.eventType === 'SHIELD_CONSUMED')).toBe(
      true,
    );
  });

  it('resets streak and deducts balance on level 3', () => {
    const db = createAppDatabase(':memory:');
    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, streak_count = ?, shield_stock = ?
        WHERE account_id = ?
      `,
    ).run(140, 4, 1, 'primary');

    const result = settleDay(db, {
      eventDate: '2026-03-24',
      missedItems: [],
      severeViolation: true,
      note: null,
    });

    expect(result.level).toBe(3);
    expect(result.amountDelta).toBe(-50);
    expect(result.account.balance).toBe(90);
    expect(result.account.streakCount).toBe(0);
    expect(result.account.shieldStock).toBe(1);
  });

  it('creates the 3-day streak reward and the 14-day shield reward', () => {
    const db = createAppDatabase(':memory:');
    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, streak_count = ?, shield_stock = ?
        WHERE account_id = ?
      `,
    ).run(200, 2, 0, 'primary');

    const thirdDay = settleDay(db, {
      eventDate: '2026-03-25',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    expect(thirdDay.account.balance).toBe(245);
    expect(thirdDay.account.streakCount).toBe(3);
    expect(
      thirdDay.events.some(
        (event) => event.eventType === 'STREAK_REWARD' && event.amountDelta === 20,
      ),
    ).toBe(true);

    db.prepare(
      `
        UPDATE account_snapshot
        SET balance = ?, streak_count = ?, shield_stock = ?
        WHERE account_id = ?
      `,
    ).run(300, 13, 0, 'primary');

    const fourteenthDay = settleDay(db, {
      eventDate: '2026-03-26',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    expect(fourteenthDay.account.balance).toBe(325);
    expect(fourteenthDay.account.streakCount).toBe(14);
    expect(fourteenthDay.account.shieldStock).toBe(1);
    expect(
      fourteenthDay.events.some((event) => event.eventType === 'SHIELD_GRANTED'),
    ).toBe(true);
  });
});
