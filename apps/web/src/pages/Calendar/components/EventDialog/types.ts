import type { UseOverlayStateReturn } from '@heroui/react';
import type { CalendarEvent, EventDraft } from '../../types';

export type EventDialogProps = {
  state: UseOverlayStateReturn;
  event: CalendarEvent | undefined;
  date: string;
  onSave: (draft: EventDraft) => void;
  onDelete: () => void;
};
