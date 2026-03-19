import { isNoviceProtectionDate } from '../lib/date';
import { TopStatusBar } from '../components/TopStatusBar';
import { TodaySettlementCard } from '../components/TodaySettlementCard';
import { useAccount } from '../hooks/useAccount';
import { getTodayDateString } from '../lib/date';

export function TodayPage() {
  const { account, loading, setAccount } = useAccount();
  const today = getTodayDateString();
  const inNoviceWindow = isNoviceProtectionDate(today);

  return (
    <section className="page-card">
      <p className="eyebrow">今日</p>
      <h1>EBS</h1>
      <p className="summary">精英住校生系统</p>
      {inNoviceWindow ? (
        <div className="banner banner--novice">
          新手保护期进行中：只要不是等级 3，今天都按 +25 计算。
        </div>
      ) : null}
      {loading || !account ? (
        <div className="placeholder-block">
          <h2>加载中</h2>
          <p>正在获取当前账户状态。</p>
        </div>
      ) : (
        <>
          <TopStatusBar account={account} />
          <TodaySettlementCard
            account={account}
            onSettled={(response) => {
              setAccount(response.account);
            }}
          />
        </>
      )}
    </section>
  );
}
