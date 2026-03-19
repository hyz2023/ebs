type CalendarDay = {
  date: string;
  level: number | null;
  usedShield: boolean;
  hasExternalAdjustment: boolean;
  note: string | null;
};

export function DayDetailDrawer({ day }: { day: CalendarDay | null }) {
  if (!day) {
    return null;
  }

  return (
    <div className="placeholder-block">
      <h2>当日详情</h2>
      <p>{day.date}</p>
      <p>等级：{day.level ?? '-'}</p>
      <p>护盾：{day.usedShield ? '已使用' : '未使用'}</p>
      <p>外部奖惩：{day.hasExternalAdjustment ? '有' : '无'}</p>
      <p>{day.note}</p>
    </div>
  );
}
