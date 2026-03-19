import { describe, expect, it } from 'vitest';

import {
  calculateSettlementAmount,
  calculateSettlementLevel,
  isNoviceProtectionDate,
} from '../domain/rules';

describe('settlement rules', () => {
  it('returns level 1 when all daily items are complete', () => {
    expect(
      calculateSettlementLevel({ missedItems: [], severeViolation: false }),
    ).toBe(1);
  });

  it('returns level 2 when items are missed without severe violation', () => {
    expect(
      calculateSettlementLevel({
        missedItems: ['fuel'],
        severeViolation: false,
      }),
    ).toBe(2);
  });

  it('returns level 3 when a severe violation is present', () => {
    expect(
      calculateSettlementLevel({ missedItems: [], severeViolation: true }),
    ).toBe(3);
  });

  it('identifies novice protection dates correctly', () => {
    expect(isNoviceProtectionDate('2026-03-20')).toBe(true);
    expect(isNoviceProtectionDate('2026-03-22')).toBe(true);
    expect(isNoviceProtectionDate('2026-03-23')).toBe(false);
  });

  it('uses novice protection payout for level 2 inside the window', () => {
    expect(calculateSettlementAmount({ level: 2, eventDate: '2026-03-21' })).toBe(
      25,
    );
  });

  it('uses standard payout for level 2 outside the window', () => {
    expect(calculateSettlementAmount({ level: 2, eventDate: '2026-03-23' })).toBe(
      15,
    );
  });
});
