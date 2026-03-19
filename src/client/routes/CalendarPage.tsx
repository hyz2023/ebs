import { useState } from 'react';

import { BehaviorCalendar } from '../components/BehaviorCalendar';
import { DayDetailDrawer } from '../components/DayDetailDrawer';
import { useReports } from '../hooks/useReports';

export function CalendarPage() {
  const { data, loading } = useReports<{
    days: Array<{
      date: string;
      level: number | null;
      usedShield: boolean;
      hasExternalAdjustment: boolean;
      note: string | null;
    }>;
  }>('/api/reports/calendar?month=2026-03');
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    level: number | null;
    usedShield: boolean;
    hasExternalAdjustment: boolean;
    note: string | null;
  } | null>(null);

  return (
    <section className="page-card">
      <p className="eyebrow">日历</p>
      <h1>行为日历</h1>
      <p className="summary">按月查看每日表现和详情。</p>
      {loading || !data ? (
        <div className="placeholder-block">
          <h2>加载中</h2>
          <p>正在获取日历数据。</p>
        </div>
      ) : (
        <>
          <BehaviorCalendar days={data.days} onSelect={setSelectedDay} />
          <DayDetailDrawer day={selectedDay} />
        </>
      )}
    </section>
  );
}
