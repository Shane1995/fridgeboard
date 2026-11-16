import type { IEventRuleInput } from '@fridgeboard/contract/events';
import type { ToRuleBodyOptions } from './types';

// What the events API accepts to start a repeating series from a draft: the first day is the
// draft's date, the repeat settings come from its `repeat`. Rules keep London wall times as they
// are, so a timed rule sends the draft's start and end time, not instants.
export const toRuleBody = ({ draft }: ToRuleBodyOptions): IEventRuleInput => {
  const { repeat } = draft;
  if (repeat === undefined) {
    throw new Error('A rule needs a draft that repeats');
  }
  const base = {
    title: draft.title.trim(),
    note: draft.note.trim(),
    ownerId: draft.ownerId,
    color: draft.color ?? null,
    reminder: draft.reminder ?? null,
    startDate: draft.date,
    frequency: repeat.frequency,
    interval: repeat.interval,
    ...(repeat.frequency === 'weekly' ? { weekdays: repeat.weekdays } : {}),
    ...(repeat.until === undefined ? {} : { until: repeat.until }),
  };
  return draft.allDay
    ? { ...base, allDay: true }
    : { ...base, allDay: false, startTime: draft.startTime, endTime: draft.endTime };
};
