import { toLondonParts } from '../toLondonParts';
import type { EventDateRange, EventDateRangeOptions } from './types';

export const eventDateRange = ({ event }: EventDateRangeOptions): EventDateRange =>
  event.allDay
    ? { startDate: event.startDate, endDate: event.endDate }
    : {
        startDate: toLondonParts({ instant: event.startsAt }).date,
        endDate: toLondonParts({ instant: event.endsAt }).date,
      };
