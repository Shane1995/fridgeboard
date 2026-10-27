import type { CalendarEvent, EventDraft } from '../../../../../../types';

export type UseEventFormOptions = {
  event: CalendarEvent | undefined;
  date: string;
  onSave: (draft: EventDraft) => void;
  onDelete: () => void;
  onDone: () => void;
};
