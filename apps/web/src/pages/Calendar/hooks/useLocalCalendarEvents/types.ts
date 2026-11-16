import type { CalendarEvent, EventDraft } from '../../types';

export type SaveEventOptions = { draft: EventDraft };

export type UpdateEventOptions = { id: string; draft: EventDraft };

export type DeleteEventOptions = { id: string };

export type CalendarEventsState = {
  events: CalendarEvent[];
  createEvent: (options: SaveEventOptions) => void;
  updateEvent: (options: UpdateEventOptions) => void;
  deleteEvent: (options: DeleteEventOptions) => void;
};
