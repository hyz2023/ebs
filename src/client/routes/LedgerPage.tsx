import { ExternalAdjustmentForm } from '../components/ExternalAdjustmentForm';
import { LedgerList } from '../components/LedgerList';
import { useReports } from '../hooks/useReports';

export function LedgerPage() {
  const { data, loading, setData } = useReports<{
    items: Array<{
      id: number;
      eventDate: string;
      eventType: string;
      amountDelta: number;
      reason: string | null;
    }>;
  }>('/api/reports/ledger');

  async function refresh() {
    const response = await fetch('/api/reports/ledger');
    const payload = await response.json();
    setData(payload);
  }

  return (
    <section className="page-card">
      <h1>流水</h1>
      <p className="summary">查看每日结算和外部奖惩记录。</p>
      <ExternalAdjustmentForm onCreated={refresh} />
      {loading || !data ? (
        <div className="placeholder-block">
          <h2>加载中</h2>
          <p>正在获取流水记录。</p>
        </div>
      ) : (
        <LedgerList items={data.items} />
      )}
    </section>
  );
}
