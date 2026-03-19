import { useEffect, useState } from 'react';

export type AccountSummary = {
  accountId: string;
  balance: number;
  streakCount: number;
  shieldStock: number;
  lastSettlementDate: string | null;
};

export function useAccount() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const response = await fetch('/api/account');
      const data = (await response.json()) as { account: AccountSummary };

      if (!active) {
        return;
      }

      setAccount(data.account);
      setLoading(false);
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, []);

  return { account, loading, setAccount };
}
