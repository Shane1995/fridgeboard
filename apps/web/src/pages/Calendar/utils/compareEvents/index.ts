import type { CalendarEvent } from '../../types';
import type { CompareEventsOptions } from './types';

const startKey = ({ event }: { event: CalendarEvent }): string =>
  event.allDay ? '' : event.startsAt;

export const compareEvents = ({ left, right }: CompareEventsOptions): number =>
  startKey({ event: left }).localeCompare(startKey({ event: right })) ||
  left.title.localeCompare(right.title);
