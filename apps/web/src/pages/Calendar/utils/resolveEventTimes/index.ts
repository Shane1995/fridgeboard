import { addDays } from '../addDays';
import { fromLondonParts } from '../fromLondonParts';
import type { EventTimes, ResolveEventTimesOptions } from './types';

export const resolveEventTimes = ({
  date,
  startTime,
  endTime,
}: ResolveEventTimesOptions): EventTimes => {
  const endDate = endTime < startTime ? addDays({ date, days: 1 }) : date;
  return {
    startsAt: fromLondonParts({ date, time: startTime }),
    endsAt: fromLondonParts({ date: endDate, time: endTime }),
  };
};
