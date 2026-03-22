import { useState } from 'react';

import { BalanceTrendChart } from '../components/BalanceTrendChart';
import { IncomeBreakdownChart } from '../components/IncomeBreakdownChart';
import { useReports } from '../hooks/useReports';

type CalendarDay = {
  date: string;
  level: number | null;
  usedShield: boolean;
  hasExternalAdjustment: boolean;
  note: string | null;
};

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function AssetsPage() {
  const [currentMonth, setCurrentMonth] = useState('2026-04');
  const { data: calendarData, loading: calendarLoading } = useReports<{
    days: CalendarDay[];
  }>(`/api/reports/calendar?month=${currentMonth}`);
  const { data: assetsData, loading: assetsLoading } = useReports<{
    balancePoints: Array<{ eventDate: string; balance: number }>;
    incomeBreakdown: Array<{ key: string; amount: number }>;
    milestoneSummary: { shieldGrants: number };
  }>('/api/reports/assets');
  const { data: shieldsData, loading: shieldsLoading } = useReports<{
    shieldEvents: Array<{
      eventDate: string;
      eventType: string;
      shieldAfter: number;
      note: string | null;
    }>;
  }>('/api/reports/shields');

  function changeMonth(delta: number) {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  }

  function renderCalendarGrid(days: CalendarDay[], month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    // 创建日期到数据的映射
    const dayMap = new Map(days.map(d => [d.date.slice(8), d]));
    
    const cells = [];
    
    // 填充前面的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} style={{ padding: '8px 0' }} />);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${month}-${dayStr}`;
      const dayData = dayMap.get(dayStr);
      
      let bgColor = 'transparent';
      let levelDot = null;
      
      if (dayData?.level === 1) {
        bgColor = 'rgba(118, 228, 179, 0.2)';
        levelDot = <div style={{ width: '6px', height: '6px', borderRadius: '50', background: '#76e4b3', marginTop: '4px' }} />;
      } else if (dayData?.level === 2) {
        bgColor = 'rgba(255, 200, 100, 0.15)';
        levelDot = <div style={{ width: '6px', height: '6px', borderRadius: '50', background: '#ffc864', marginTop: '4px' }} />;
      } else if (dayData?.level === 3) {
        bgColor = 'rgba(255, 120, 120, 0.15)';
        levelDot = <div style={{ width: '6px', height: '6px', borderRadius: '50', background: '#ff7878', marginTop: '4px' }} />;
      }
      
      const isToday = dayStr === new Date().toISOString().slice(8, 10);
      
      cells.push(
        <div
          key={dayStr}
          style={{
            padding: '8px 0',
            textAlign: 'center',
            background: bgColor,
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: isToday ? 700 : 400 }}>{day}</div>
          {levelDot}
          {dayData?.usedShield && (
            <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>🛡️</div>
          )}
        </div>
      );
    }
    
    return cells;
  }

  const isLoading = calendarLoading || assetsLoading || shieldsLoading;

  return (
    <section className="page-card">
      <h1>资产</h1>
      <p className="summary">查看行为日历、收益构成和道具记录。</p>
      {isLoading || !calendarData || !assetsData || !shieldsData ? (
        <div className="placeholder-block">
          <h2>加载中</h2>
          <p>正在获取资产数据。</p>
        </div>
      ) : (
        <>
          {/* 第一部分：行为日历 */}
          <div className="placeholder-block">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
              <button
                className="toggle-pill"
                onClick={() => changeMonth(-1)}
                type="button"
                style={{ minWidth: '44px', padding: '6px', fontSize: '1.1rem' }}
              >
                ‹
              </button>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{currentMonth}</h2>
              <button
                className="toggle-pill"
                onClick={() => changeMonth(1)}
                type="button"
                style={{ minWidth: '44px', padding: '6px', fontSize: '1.1rem' }}
              >
                ›
              </button>
            </div>
            
            {/* 星期标题 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center' }}>
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} style={{ fontSize: '0.85rem', color: 'var(--muted)', padding: '8px 0' }}>{day}</div>
              ))}
            </div>
            
            {/* 日历网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {renderCalendarGrid(calendarData.days, currentMonth)}
            </div>
          </div>

          {/* 第二部分：收益构成 */}
          <IncomeBreakdownChart items={assetsData.incomeBreakdown} />

          {/* 第三部分：道具（护盾记录） */}
          <div className="placeholder-block">
            <h2>道具</h2>
            {!shieldsData || shieldsData.shieldEvents.length === 0 ? (
              <p>暂无护盾记录。</p>
            ) : (
              <div className="stack-list">
                {shieldsData.shieldEvents.map((event) => {
                  const isGrant = event.eventType === 'SHIELD_GRANTED';
                  return (
                    <div key={event.eventDate + event.eventType} className="stack-card">
                      <div className="stack-card__row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{isGrant ? '🛡️' : '💔'}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {isGrant ? '获得护盾' : '使用护盾'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              {event.eventDate}
                            </div>
                          </div>
                        </div>
                        <strong style={{ color: isGrant ? '#76e4b3' : '#ff7878' }}>
                          {isGrant ? '+' : '-'}1
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
