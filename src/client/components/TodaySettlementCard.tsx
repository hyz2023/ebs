import { useMemo, useState, useEffect } from 'react';

import { getTodayDateString } from '../lib/date';
import type { AccountSummary } from '../hooks/useAccount';

const checklistItems = [
  { key: 'launch', label: '静音起/收航', hint: '出门进门情绪稳定' },
  { key: 'background-sound', label: '背景音过滤', hint: '不回怼、不翻白眼' },
  { key: 'fuel', label: '燃料与领地', hint: '正常进食 + 整理书包衣物' },
  { key: 'environment', label: '环境友好', hint: '无摔门砸物尖叫' },
] as const;

const SETTLEMENT_START_DATE = '2026-03-21';

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

function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(current.toLocaleDateString('en-CA'));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  
  const today = getTodayDateString();
  const availableDates = useMemo(() => {
    const allDates = getDateRange(SETTLEMENT_START_DATE, today);
    const settledSet = new Set(account.settledDates ?? []);
    return allDates.filter(date => !settledSet.has(date));
  }, [account.settledDates, today]);
  
  const isTodaySelected = selectedDate === today;
  const alreadySettledSelectedDate = (account.settledDates ?? []).includes(selectedDate);

  const missedItems = useMemo(
    () =>
      checklistItems
        .filter((item) => !checkedItems.includes(item.key))
        .map((item) => item.key),
    [checkedItems],
  );

  async function submitSettlement(consumeShield: boolean) {
    setIsSubmitting(true);
    setSubmitError(null);
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
        eventDate: selectedDate,
        missedItems,
        severeViolation,
        consumeShield,
        note: null,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      const message =
        payload.error === 'Settlement already recorded for this date'
          ? '今天已经结算过了。'
          : payload.error ?? '结算失败，请稍后重试。';

      setSubmitError(message);
      setIsSubmitting(false);
      setConfirmShieldUse(false);
      return;
    }

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

  if (alreadySettledSelectedDate) {
    return (
      <div className="placeholder-block">
        <h2>结算日期 <span className="date-suffix">{selectedDate}</span></h2>
        <p className="result-balance">{selectedDate === today ? '今日' : '该日期'}已经结算完成。</p>
        <p>请选择其他未结算的日期。</p>
        <p className="summary">上次结算日期：{account.lastSettlementDate}</p>
      </div>
    );
  }

  return (
    <div className="placeholder-block">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ margin: 0 }}>{isTodaySelected ? '今日结算' : '补结算'}</h2>
        <select
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCheckedItems([]);
            setSevereViolation(false);
            setSubmitError(null);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          {availableDates.map((date) => {
            const isToday = date === today;
            return (
              <option key={date} value={date}>
                {isToday ? `今天 (${date})` : date}
              </option>
            );
          })}
        </select>
      </div>
      <p>{isTodaySelected ? '完成今天的勾选后提交结算。' : `补结算 ${selectedDate} 的记录。`}</p>
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
              <span className="toggle-pill__label">{item.label}</span>
              <span className="toggle-pill__hint">{item.hint}</span>
            </button>
          );
        })}
      </div>
      <div
        className={`danger-panel${severeViolation ? ' danger-panel--active' : ''}`}
      >
        <div className="danger-panel__copy">
          <h3>严重违规 / 熔断</h3>
          <p>用于一票否决的严重违规情况，将直接按等级 3 结算并清零连胜。</p>
        </div>
        <button
          aria-pressed={severeViolation}
          className={`danger-toggle${severeViolation ? ' danger-toggle--active' : ''}`}
          onClick={() => {
            if (!severeViolation) {
              // 启用熔断时清空所有选中的日常项
              setCheckedItems([]);
            }
            setSevereViolation((current) => !current);
          }}
          type="button"
        >
          {severeViolation ? '取消熔断' : '启用熔断'}
        </button>
      </div>
      <button
        className="primary-button"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? '结算中...' : (isTodaySelected ? '立即结算' : '补结算')}
      </button>
      {submitError ? <p className="error-text">{submitError}</p> : null}
      <p className="summary">
        {isTodaySelected 
          ? `上次结算日期：${account.lastSettlementDate ?? '尚未结算'}`
          : `可补结算日期：${availableDates.length} 个`}
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
