import type { AccountSummary } from '../hooks/useAccount';

export function TopStatusBar({ account }: { account: AccountSummary }) {
  return (
    <section aria-label="账户状态" className="status-grid">
      <div className="status-chip">
        <span className="status-chip__label">余额</span>
        <strong>{account.balance}</strong>
      </div>
      <div className="status-chip">
        <span className="status-chip__label">连胜</span>
        <strong>{account.streakCount}</strong>
      </div>
      <div className="status-chip">
        <span className="status-chip__label">护盾</span>
        <strong>{account.shieldStock}</strong>
      </div>
    </section>
  );
}
