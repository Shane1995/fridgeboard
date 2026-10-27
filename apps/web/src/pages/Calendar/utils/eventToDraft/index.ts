import { DEFAULT_END_TIME, DEFAULT_START_TIME } from '../../constants';
import type { EventDraft } from '../../types';
import { toLondonParts } from '../toLondonParts';
import type { EventToDraftOptions } from './types';

export const eventToDraft = ({ event }: EventToDraftOptions): EventDraft => {
  const common = { title: event.title, ownerId: event.ownerId, note: event.note };
  if (event.allDay) {
    return {
      ...common,
      allDay: true,
      date: event.startDate,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
    };
  }
  const start = toLondonParts({ instant: event.startsAt });
  const end = toLondonParts({ instant: event.endsAt });
  return { ...common, allDay: false, date: start.date, startTime: start.time, endTime: end.time };
};
