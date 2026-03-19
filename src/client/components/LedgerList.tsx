type LedgerItem = {
  id: number;
  eventDate: string;
  eventType: string;
  amountDelta: number;
  reason: string | null;
};

function getEventLabel(eventType: string) {
  if (eventType === 'DAILY_SETTLEMENT') return '每日结算';
  if (eventType === 'EXTERNAL_ADJUSTMENT') return '外部奖惩';
  if (eventType === 'STREAK_REWARD') return '连胜奖励';
  if (eventType === 'SHIELD_GRANTED') return '获得护盾';
  if (eventType === 'SHIELD_CONSUMED') return '消耗护盾';
  if (eventType === 'FINAL_LIQUIDATION') return '最终结算';
  return eventType;
}

export function LedgerList({ items }: { items: LedgerItem[] }) {
  return (
    <div className="stack-list">
      {items.map((item) => (
        <article key={item.id} className="stack-card">
          <div className="stack-card__row">
            <strong>{getEventLabel(item.eventType)}</strong>
            <span>{item.amountDelta}</span>
          </div>
          <div className="stack-card__row stack-card__row--muted">
            <span>{item.eventDate}</span>
            <span>{item.reason}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
