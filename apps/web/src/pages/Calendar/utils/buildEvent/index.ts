import type { CalendarEvent } from '../../types';
import { resolveEventTimes } from '../resolveEventTimes';
import type { BuildEventOptions } from './types';

export const buildEvent = ({ draft, id }: BuildEventOptions): CalendarEvent => {
  const base = {
    id,
    title: draft.title.trim(),
    ownerId: draft.ownerId,
    note: draft.note.trim(),
  };
  if (draft.allDay) {
    return { ...base, allDay: true, startDate: draft.date, endDate: draft.date };
  }
  return {
    ...base,
    allDay: false,
    ...resolveEventTimes({ date: draft.date, startTime: draft.startTime, endTime: draft.endTime }),
  };
};
