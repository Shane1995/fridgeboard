import type { LastDayOptions } from './types';

// The day an all-day draft ends on: its own last day, or the first day when it has none or the
// last day was set before the first.
export const lastDay = ({ draft }: LastDayOptions): string =>
  draft.endDate !== undefined && draft.endDate > draft.date ? draft.endDate : draft.date;
