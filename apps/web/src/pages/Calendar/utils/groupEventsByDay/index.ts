import type { CalendarEvent } from '../../types';
import { compareEvents } from '../compareEvents';
import { eventDateRange } from '../eventDateRange';
import type { GroupEventsByDayOptions } from './types';

export const groupEventsByDay = ({
  events,
  dates,
}: GroupEventsByDayOptions): Record<string, CalendarEvent[]> =>
  Object.fromEntries(
    dates.map((date) => [
      date,
      events
        .filter((event) => {
          const { startDate, endDate } = eventDateRange({ event });
          return startDate <= date && date <= endDate;
        })
        .sort((left, right) => compareEvents({ left, right })),
    ]),
  );
