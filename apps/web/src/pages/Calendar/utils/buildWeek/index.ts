import { DAYS_PER_WEEK } from '../../constants';
import { addDays } from '../addDays';
import type { BuildWeekOptions } from './types';

export const buildWeek = ({ date, weekStartsOn }: BuildWeekOptions): string[] => {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const start = addDays({
    date,
    days: -((weekday - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK),
  });
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => addDays({ date: start, days: index }));
};
