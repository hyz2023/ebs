export function BalanceTrendChart({
  points,
}: {
  points: Array<{ eventDate: string; balance: number }>;
}) {
  return (
    <div className="placeholder-block">
      <h2>余额走势</h2>
      <div className="stack-list">
        {points.map((point) => (
          <div key={point.eventDate} className="stack-card">
            <div className="stack-card__row">
              <span>{point.eventDate}</span>
              <strong>{point.balance}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
