import type { CalendarEvent } from '../../types';
import { lastDay } from '../lastDay';
import { resolveEventTimes } from '../resolveEventTimes';
import type { BuildEventOptions } from './types';

export const buildEvent = ({ draft, id }: BuildEventOptions): CalendarEvent => {
  const base = {
    id,
    title: draft.title.trim(),
    ownerId: draft.ownerId,
    note: draft.note.trim(),
    ...(draft.color === undefined ? {} : { color: draft.color }),
    ...(draft.reminder === undefined ? {} : { reminder: draft.reminder }),
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
