import type { CalendarEvent } from '../../types';

export type GroupEventsByDayOptions = {
  events: readonly CalendarEvent[];
  dates: readonly string[];
};
