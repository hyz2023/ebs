import { APP_CONFIG } from '../config';

import type { SettlementInput, SettlementLevel } from './types';

export function calculateSettlementLevel(
  input: SettlementInput,
): SettlementLevel {
  if (input.severeViolation) {
    return 3;
  }

  if (input.missedItems.length > 0) {
    return 2;
  }

  return 1;
}

export function isNoviceProtectionDate(eventDate: string) {
  return (
    eventDate >= APP_CONFIG.noviceProtectionStart &&
    eventDate <= APP_CONFIG.noviceProtectionEnd
  );
}

export function calculateSettlementAmount({
  level,
  eventDate,
}: {
  level: SettlementLevel;
  eventDate: string;
}) {
  if (level === 3) {
    return -50;
  }

  if (level === 2 && isNoviceProtectionDate(eventDate)) {
    return 25;
  }

  if (level === 2) {
    return 15;
  }

  return 25;
}

export function getMilestoneReward(streakCount: number) {
  if (streakCount === 3) {
    return { eventType: 'STREAK_REWARD', amountDelta: 20 } as const;
  }

  if (streakCount === 7) {
    return { eventType: 'STREAK_REWARD', amountDelta: 50 } as const;
  }

  if (streakCount === 14) {
    return { eventType: 'SHIELD_GRANTED', amountDelta: 0 } as const;
  }

  if (streakCount === 21) {
    return { eventType: 'STREAK_REWARD', amountDelta: 200 } as const;
  }

  return null;
}
