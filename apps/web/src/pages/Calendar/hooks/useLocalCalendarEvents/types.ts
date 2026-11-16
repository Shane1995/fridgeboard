import type { CalendarEvent, EventDraft } from '../../types';

export type SaveEventOptions = { draft: EventDraft };

// For an event that comes from a repeating series: just that day, or every day of the series.
export type RepeatScope = 'one' | 'all';

export type UpdateEventOptions = { id: string; draft: EventDraft; scope?: RepeatScope };

export type DeleteEventOptions = { id: string; scope?: RepeatScope };

export type CalendarEventsState = {
  events: CalendarEvent[];
  createEvent: (options: SaveEventOptions) => void;
  updateEvent: (options: UpdateEventOptions) => void;
  deleteEvent: (options: DeleteEventOptions) => void;
};
