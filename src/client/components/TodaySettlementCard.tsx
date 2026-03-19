import { useMemo, useState } from 'react';

import { getTodayDateString } from '../lib/date';
import type { AccountSummary } from '../hooks/useAccount';

const checklistItems = [
  { key: 'launch', label: '起航' },
  { key: 'background-sound', label: '背景音' },
  { key: 'fuel', label: '燃料' },
  { key: 'environment', label: '环境' },
] as const;

type SettlementResponse = {
  level: number;
  amountDelta: number;
  account: AccountSummary;
  events?: Array<{ eventType: string; amountDelta: number }>;
};

type ResultContext = {
  missedCount: number;
  severeViolation: boolean;
  consumeShield: boolean;
};

export function TodaySettlementCard({
  account,
  onSettled,
}: {
  account: AccountSummary;
  onSettled: (response: SettlementResponse) => void;
}) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SettlementResponse | null>(null);
  const [resultContext, setResultContext] = useState<ResultContext | null>(null);
  const [severeViolation, setSevereViolation] = useState(false);
  const [confirmShieldUse, setConfirmShieldUse] = useState(false);

  const missedItems = useMemo(
    () =>
      checklistItems
        .filter((item) => !checkedItems.includes(item.key))
        .map((item) => item.key),
    [checkedItems],
  );

  async function submitSettlement(consumeShield: boolean) {
    setIsSubmitting(true);
    const context: ResultContext = {
      missedCount: missedItems.length,
      severeViolation,
      consumeShield,
    };

    const response = await fetch('/api/settlement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventDate: getTodayDateString(),
        missedItems,
        severeViolation,
        consumeShield,
        note: null,
      }),
    });
    const data = (await response.json()) as SettlementResponse;

    setResult(data);
    setResultContext(context);
    onSettled(data);
    setIsSubmitting(false);
    setConfirmShieldUse(false);
  }

  async function handleSubmit() {
    const shouldOfferShield =
      !severeViolation &&
      missedItems.length > 0 &&
      account.shieldStock > 0;

    if (shouldOfferShield) {
      setConfirmShieldUse(true);
      return;
    }

    await submitSettlement(false);
  }

  function toggleItem(key: string) {
    setCheckedItems((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  if (result) {
    let explanation = '今日结果已记录。';

    if (resultContext?.severeViolation) {
      explanation = '触发严重违规，连胜已清零。';
    } else if (result.level === 1) {
      explanation = '四项全部完成，连胜 +1。';
    } else if (result.level === 2 && resultContext?.consumeShield) {
      explanation = `未完成 ${resultContext.missedCount} 项，已消耗护盾，连胜保留。`;
    } else if (result.level === 2) {
      explanation = `未完成 ${resultContext?.missedCount ?? 0} 项，未使用护盾，连胜中断。`;
    }

    const milestoneLines = (result.events ?? [])
      .filter((event) => event.eventType !== 'DAILY_SETTLEMENT')
      .map((event) => {
        if (event.eventType === 'STREAK_REWARD' && event.amountDelta === 20) {
          return '3 天奖励 +20';
        }
        if (event.eventType === 'STREAK_REWARD' && event.amountDelta === 50) {
          return '7 天奖励 +50';
        }
        if (event.eventType === 'STREAK_REWARD' && event.amountDelta === 200) {
          return '21 天奖励 +200';
        }
        if (event.eventType === 'SHIELD_GRANTED') {
          return '14 天奖励 获得护盾';
        }
        if (event.eventType === 'SHIELD_CONSUMED') {
          return '已消耗 1 个护盾';
        }
        return null;
      })
      .filter((line) => line !== null);

    return (
      <div className="placeholder-block result-panel">
        <h2>结算结果</h2>
        <div className="result-hero">
          <div>
            <p className="result-line">等级 {result.level}</p>
            <p className="summary">{explanation}</p>
          </div>
          <div className="result-amount">
            {result.amountDelta > 0 ? `+${result.amountDelta}` : result.amountDelta}
          </div>
        </div>
        <p className="result-balance">当前余额 {result.account.balance}</p>
        {milestoneLines.length > 0 ? (
          <div className="milestone-box">
            <h3>里程碑奖励</h3>
            <div className="milestone-list">
              {milestoneLines.map((line) => (
                <span key={line} className="milestone-pill">
                  {line}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="placeholder-block">
      <h2>今日结算</h2>
      <p>完成今天的勾选后提交结算。</p>
      <div className="checklist-grid">
        {checklistItems.map((item) => {
          const active = checkedItems.includes(item.key);

          return (
            <button
              key={item.key}
              className={`toggle-pill${active ? ' toggle-pill--active' : ''}`}
              onClick={() => toggleItem(item.key)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <button
        className={`toggle-pill${severeViolation ? ' toggle-pill--active' : ''}`}
        onClick={() => setSevereViolation((current) => !current)}
        type="button"
      >
        严重违规 / 熔断
      </button>
      <button
        className="primary-button"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        立即结算
      </button>
      <p className="summary">
        上次结算日期：{account.lastSettlementDate ?? '尚未结算'}
      </p>
      {confirmShieldUse ? (
        <div className="confirm-panel">
          <p>是否消耗 1 个护盾保住连胜？</p>
          <div className="confirm-panel__actions">
            <button
              className="toggle-pill"
              onClick={() => setConfirmShieldUse(false)}
              type="button"
            >
              不使用护盾
            </button>
            <button
              className="primary-button"
              onClick={() => void submitSettlement(true)}
              type="button"
            >
              消耗护盾并结算
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
