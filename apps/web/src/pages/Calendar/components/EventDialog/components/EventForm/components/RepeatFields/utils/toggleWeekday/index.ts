import type { ToggleWeekdayOptions } from './types';

// Adds or removes one weekday from a weekly series, keeping week order. The last one stays, since a
// weekly series on no day would never happen.
export const toggleWeekday = ({ weekdays, day }: ToggleWeekdayOptions): number[] => {
  if (!weekdays.includes(day)) {
    return [...weekdays, day].sort((left, right) => left - right);
  }
  return weekdays.length === 1 ? [...weekdays] : weekdays.filter((existing) => existing !== day);
};
