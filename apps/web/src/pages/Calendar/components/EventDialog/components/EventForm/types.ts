import type { CalendarEvent, EventDraft } from '../../../../types';

export type EventFormProps = {
  event: CalendarEvent | undefined;
  date: string;
  onSave: (draft: EventDraft) => void;
  onDelete: () => void;
  onDone: () => void;
};

export type SetFieldOptions<Field extends keyof EventDraft> = {
  field: Field;
  value: EventDraft[Field];
};
