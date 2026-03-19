export type SettlementLevel = 1 | 2 | 3;

export type SettlementInput = {
  missedItems: string[];
  severeViolation: boolean;
};

export type AccountSnapshot = {
  accountId: string;
  balance: number;
  streakCount: number;
  shieldStock: number;
  lastSettlementDate: string | null;
};

export type LedgerEventSummary = {
  eventType: string;
  amountDelta: number;
  balanceAfter: number;
  streakAfter: number;
  shieldAfter: number;
};
