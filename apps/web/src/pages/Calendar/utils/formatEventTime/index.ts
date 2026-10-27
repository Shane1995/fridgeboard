import { CALENDAR_COPY } from '../../constants';
import { toLondonParts } from '../toLondonParts';
import type { FormatEventTimeOptions } from './types';

export const formatEventTime = ({ event }: FormatEventTimeOptions): string => {
  if (event.allDay) {
    return CALENDAR_COPY.allDay;
  }
  const start = toLondonParts({ instant: event.startsAt });
  const end = toLondonParts({ instant: event.endsAt });
  const suffix = end.date > start.date ? CALENDAR_COPY.nextDaySuffix : '';
  return `${start.time}\u2013${end.time}${suffix}`;
};
