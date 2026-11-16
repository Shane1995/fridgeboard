import type { AddDaysOptions } from './types.ts';

export const addDays = ({ date, days }: AddDaysOptions): string => {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
};
