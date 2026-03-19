export function IncomeBreakdownChart({
  items,
}: {
  items: Array<{ key: string; amount: number }>;
}) {
  function toLabel(key: string) {
    if (key === 'base_rewards') return '基础分';
    if (key === 'streak_rewards') return '连胜大奖';
    if (key === 'external_adjustments') return '外部奖惩';
    return key;
  }

  return (
    <div className="placeholder-block">
      <h2>收益构成</h2>
      <div className="stack-list">
        {items.map((item) => (
          <div key={item.key} className="stack-card">
            <div className="stack-card__row">
              <span>{toLabel(item.key)}</span>
              <strong>{item.amount}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
