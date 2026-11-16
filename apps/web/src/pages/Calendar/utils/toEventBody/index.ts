import type { IEventInput } from '@fridgeboard/contract/events';
import { lastDay } from '../lastDay';
import { resolveEventTimes } from '../resolveEventTimes';
import type { ToEventBodyOptions } from './types';

// What the events API accepts for a save. The server derives the London start and end dates from
// the instants, so a timed event carries only `startsAt` and `endsAt`.
export const toEventBody = ({ draft }: ToEventBodyOptions): IEventInput => {
  const base = {
    title: draft.title.trim(),
    note: draft.note.trim(),
    ownerId: draft.ownerId,
    color: draft.color ?? null,
    reminder: draft.reminder ?? null,
  };
  if (draft.allDay) {
    return { ...base, allDay: true, startDate: draft.date, endDate: lastDay({ draft }) };
  }
  return {
    ...base,
    allDay: false,
    ...resolveEventTimes({ date: draft.date, startTime: draft.startTime, endTime: draft.endTime }),
  };
};
