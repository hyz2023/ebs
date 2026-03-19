type CalendarDay = {
  date: string;
  level: number | null;
  usedShield: boolean;
  hasExternalAdjustment: boolean;
  note: string | null;
};

export function BehaviorCalendar({
  days,
  onSelect,
}: {
  days: CalendarDay[];
  onSelect: (day: CalendarDay) => void;
}) {
  return (
    <div className="calendar-grid">
      {days.map((day) => (
        <button
          key={day.date}
          className="calendar-day"
          onClick={() => onSelect(day)}
          type="button"
        >
          <span>{day.date}</span>
          <strong>{day.level === null ? '-' : `L${day.level}`}</strong>
        </button>
      ))}
    </div>
  );
}
