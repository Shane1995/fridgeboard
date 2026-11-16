import { PLANNER_COPY } from '../../constants';
import type { WeekGlanceProps } from './types';

export const WeekGlance = ({ days, selectedWeekday, onSelect }: WeekGlanceProps) => {
  const planned = days
    .filter((day) => day.weekday !== selectedWeekday)
    .map((day) => ({
      day,
      meals: day.lines.map((line) => line.text.trim()).filter((text) => text !== ''),
    }))
    .filter(({ meals }) => meals.length > 0);

  if (planned.length === 0) {
    return null;
  }

  return (
    <ul aria-label={PLANNER_COPY.weekGlance} className="flex flex-col md:hidden">
      {planned.map(({ day, meals }) => (
        <li key={day.id}>
          <button
            type="button"
            onClick={() => onSelect({ weekday: day.weekday ?? 0 })}
            className="flex min-h-11 w-full cursor-pointer items-baseline gap-3 rounded-xl px-3 py-2 text-left outline-none hover:bg-default focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="w-24 shrink-0 text-sm font-semibold">{day.title}</span>
            <span className="min-w-0 truncate text-sm">{meals.join(', ')}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};
