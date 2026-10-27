import { DAYS_PER_WEEK } from '../../constants';
import type { MonthCell } from '../../types';
import { addDays } from '../addDays';
import { buildWeek } from '../buildWeek';
import { parseDate } from '../parseDate';
import type { BuildMonthGridOptions } from './types';

export const buildMonthGrid = ({ date, weekStartsOn }: BuildMonthGridOptions): MonthCell[][] => {
  const { year, month } = parseDate({ date });
  const monthPrefix = date.slice(0, 7);
  const first = `${monthPrefix}-01`;
  const [gridStart = first] = buildWeek({ date: first, weekStartsOn });
  const leading =
    (new Date(`${first}T00:00:00Z`).getUTCDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Math.ceil((leading + daysInMonth) / DAYS_PER_WEEK);
  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_unused, day) => {
      const cellDate = addDays({ date: gridStart, days: week * DAYS_PER_WEEK + day });
      return { date: cellDate, inMonth: cellDate.startsWith(monthPrefix) };
    }),
  );
};
