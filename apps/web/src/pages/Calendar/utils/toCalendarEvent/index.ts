import { ShopColor } from '../../../../services/shoppingList/constants';
import type { CalendarEvent } from '../../types';
import type { ToCalendarEventOptions } from './types';

const PALETTE: readonly string[] = Object.values(ShopColor);

const toColor = (value: string | undefined): ShopColor | undefined =>
  PALETTE.find((known): known is ShopColor => known === value) as ShopColor | undefined;

// What the calendar draws for one event the server sent. A colour the app's palette does not know
// is dropped, so the event falls back to its owner's colour instead of showing nothing.
export const toCalendarEvent = ({ event }: ToCalendarEventOptions): CalendarEvent => {
  const color = toColor(event.color);
  const base = {
    id: event.id,
    title: event.title,
    note: event.note,
    ownerId: event.ownerId,
    ...(color === undefined ? {} : { color }),
    ...(event.reminder === undefined ? {} : { reminder: event.reminder }),
    ...(event.ruleId === undefined ? {} : { ruleId: event.ruleId }),
  };
  return event.allDay
    ? { ...base, allDay: true, startDate: event.startDate, endDate: event.endDate }
    : { ...base, allDay: false, startsAt: event.startsAt, endsAt: event.endsAt };
};
