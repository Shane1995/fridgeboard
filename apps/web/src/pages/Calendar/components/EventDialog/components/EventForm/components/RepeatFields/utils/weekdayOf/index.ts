import type { WeekdayOfOptions } from './types';

// The weekday of a calendar date, Sunday as 0, the same numbering the events API uses.
export const weekdayOf = ({ date }: WeekdayOfOptions): number =>
  new Date(`${date}T00:00:00Z`).getUTCDay();
