import type { CalendarEvent } from '../../types';

export type WeekViewProps = {
  dates: readonly string[];
  today: string;
  anchor: string;
  eventsByDay: Readonly<Record<string, readonly CalendarEvent[]>>;
  onSelectDay: (date: string) => void;
  onEdit: (event: CalendarEvent) => void;
};
