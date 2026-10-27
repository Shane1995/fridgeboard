import type { CalendarEvent } from '../../types';

export type EventRowProps = { event: CalendarEvent; onEdit: (event: CalendarEvent) => void };
