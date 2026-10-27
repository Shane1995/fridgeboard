import type { CalendarEvent } from '../../types';

export type DayAgendaProps = {
  date: string;
  events: readonly CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
};
