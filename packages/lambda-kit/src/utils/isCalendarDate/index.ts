import { CALENDAR_DATE_PATTERN } from './constants.ts';

export const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !CALENDAR_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
