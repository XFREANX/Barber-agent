import React, { useState } from 'react';
import './CalendarPicker.css';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  minDate?: string; // YYYY-MM-DD, defaults to today
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
}) => {
  const today = new Date();
  const effectiveMin = minDate ?? toYMD(today);

  const [viewYear, setViewYear] = useState(() => {
    const ref = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
    return ref.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const ref = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
    return ref.getMonth();
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < effectiveMin) return;
    onDateSelect(dateStr);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar-picker">
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="Mes anterior">‹</button>
        <span className="cal-month-label">{MONTHS_ES[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">›</button>
      </div>

      <div className="calendar-grid">
        {DAYS_ES.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="cal-cell empty" />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = dateStr < effectiveMin;
          const isToday = dateStr === toYMD(today);
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              className={`cal-cell day${isPast ? ' past' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => handleDayClick(day)}
              disabled={isPast}
              aria-label={`${day} de ${MONTHS_ES[viewMonth]}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPicker;
