import { useEffect, useState } from 'react';

import { BalanceTrendChart } from '../components/BalanceTrendChart';
import { IncomeBreakdownChart } from '../components/IncomeBreakdownChart';
import { useReports } from '../hooks/useReports';

export function AssetsPage() {
  const { data, loading } = useReports<{
    balancePoints: Array<{ eventDate: string; balance: number }>;
    incomeBreakdown: Array<{ key: string; amount: number }>;
    milestoneSummary: { shieldGrants: number };
  }>('/api/reports/assets');
  const [finalPreview, setFinalPreview] = useState<{
    eventDate: string;
    balance: number;
    shieldStock: number;
    shieldConversion: number;
    finalBalance: number;
  } | null>(null);
  const [liquidationSubmitting, setLiquidationSubmitting] = useState(false);
  const [liquidationExecuted, setLiquidationExecuted] = useState(false);
  const [liquidationError, setLiquidationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      const response = await fetch(
        '/api/final-liquidation/preview?eventDate=2026-07-31',
      );
      const payload = (await response.json()) as {
        preview: {
          eventDate: string;
          balance: number;
          shieldStock: number;
          shieldConversion: number;
          finalBalance: number;
        };
      };

      if (!active) {
        return;
      }

      setFinalPreview(payload.preview);
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, []);

  async function handleLiquidation() {
    setLiquidationSubmitting(true);
    setLiquidationError(null);

    try {
      const response = await fetch('/api/final-liquidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: '2026-07-31' }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? '最终结算执行失败。');
      }

      const payload = (await response.json()) as {
        preview: {
          eventDate: string;
          balance: number;
          shieldStock: number;
          shieldConversion: number;
          finalBalance: number;
        };
      };

      setFinalPreview(payload.preview);
      setLiquidationExecuted(true);
    } catch (error) {
      setLiquidationError(
        error instanceof Error ? error.message : '最终结算执行失败。',
      );
    } finally {
      setLiquidationSubmitting(false);
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">资产</p>
      <h1>金融报表</h1>
      <p className="summary">查看余额走势、收益来源和里程碑摘要。</p>
      {loading || !data ? (
        <div className="placeholder-block">
          <h2>加载中</h2>
          <p>正在获取报表数据。</p>
        </div>
      ) : (
        <>
          <BalanceTrendChart points={data.balancePoints} />
          <IncomeBreakdownChart items={data.incomeBreakdown} />
          <div className="placeholder-block">
            <h2>里程碑</h2>
            <p>获得护盾：{data.milestoneSummary.shieldGrants}</p>
          </div>
          {finalPreview ? (
            <div className="placeholder-block">
              <h2>最终结算预览</h2>
              <p>结算日期：{finalPreview.eventDate}</p>
              <p>护盾库存：{finalPreview.shieldStock}</p>
              <p>护盾折算：{finalPreview.shieldConversion}</p>
              <p className="result-balance">预计总额：{finalPreview.finalBalance}</p>
              <button
                className="primary-button"
                disabled={liquidationSubmitting || liquidationExecuted}
                onClick={() => void handleLiquidation()}
                type="button"
              >
                {liquidationSubmitting
                  ? '执行中...'
                  : liquidationExecuted
                    ? '已完成最终结算'
                    : '执行最终结算'}
              </button>
              {liquidationExecuted ? <p>最终结算已执行。</p> : null}
              {liquidationError ? <p>{liquidationError}</p> : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
