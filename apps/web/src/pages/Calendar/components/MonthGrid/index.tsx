import { formatWeekday } from '../../utils/formatWeekday';
import { DayCell } from './components/DayCell';
import type { MonthGridProps } from './types';

export const MonthGrid = ({ cells, anchor, today, eventsByDay, onSelectDay }: MonthGridProps) => {
  const headerDates = cells[0]?.map((cell) => cell.date) ?? [];
  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-separator bg-separator">
      {headerDates.map((date) => (
        <span
          key={date}
          className="bg-background py-1 text-center text-xs font-semibold uppercase opacity-60"
        >
          {formatWeekday({ date })}
        </span>
      ))}
      {cells.flat().map((cell) => (
        <DayCell
          key={cell.date}
          date={cell.date}
          inMonth={cell.inMonth}
          isToday={cell.date === today}
          isSelected={cell.date === anchor}
          events={eventsByDay[cell.date] ?? []}
          onSelect={onSelectDay}
        />
      ))}
    </div>
  );
};
